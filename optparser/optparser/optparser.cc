#include <unistd.h>
#include <iostream>
#include <fstream>
#include <sstream>
#include <map>
#include <set>
#include <cxxabi.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <signal.h>
#include <iomanip>
#include <regex>

#include "CodeObject.h"
#include "InstructionDecoder.h"
#include "Symtab.h"
#include "Function.h"

#define INTERACTIVE_TIMEOUT_S 600
#define MAX_NAME_LENGTH 128

using namespace std;
using namespace Dyninst;
using namespace ParseAPI;
using namespace SymtabAPI;

using namespace InstructionAPI;

static CodeObject::funclist funcs;
static SymtabAPI::Symtab *symtab;
static set<Address> addresses;
static string binaryPath, filename;
static SymtabCodeSource *sts;
static map<Block *, unsigned long> block_to_id;

static bool interactive = false;
static string tempdir;
static set<string> unique_sourcefiles;

typedef enum  {
   bb_vectorized,
   bb_memory_read,
   bb_memory_write,
   bb_call,
   bb_syscall,
   bb_fp
} block_flags;
static map<Block *, set<block_flags> > block_to_flags;

bool parseArgs(int argc, char **argv)
{
   if (argc < 2) {
      printf("Usage: %s [--interative] <binary path> <functions>\n", argv[0]);
      return false;
   }
   int n = 1;
   if (string(argv[1]) == "--interactive") {
      if (argc < 4) {
         printf("Usage: %s [--interative tempdir] <binary path> <functions>\n", argv[0]);
         return false;      
      }
      interactive = true;
      n++;
      tempdir = argv[2];
      n++;
   }
   
   binaryPath = argv[n];
   const char *last_slash = strrchr(binaryPath.c_str(), '/');
   if (last_slash)
      filename = string(last_slash+1);
   else
      filename = binaryPath;

   bool isParsable = SymtabAPI::Symtab::openFile(symtab, binaryPath);
   if (!isParsable) {
      cerr << "Error: file " << binaryPath << " can not be parsed" << endl;
      return false;
   }
   sts = new SymtabCodeSource(const_cast<char*>(binaryPath.c_str()));
   CodeObject *co = new CodeObject(sts);
   //parse the binary given as a command line arg
   co->parse();

   // If there are other command line arguments besides the binary, then
   // use them to filter the functions we parse from the binary.
   if (argc == n+1)
      funcs = co->funcs();
   else { 
      for (CodeObject::funclist::iterator f = co->funcs().begin(); f != co->funcs().end(); f++) {
         for (int argi = n+1; argi < argc; argi++) {
            ParseAPI::Function *func = *f;
            if (func->name() == argv[argi]) {
               funcs.insert(func);
               break;
            }
         }
      }
   }
      
   if (funcs.empty()) {
      cerr << "Error: no functions in file";
      return false;
   }

   return true;
}

void setBlockFlags(Block *block, const Instruction &instr, set<block_flags> &flags)
{
   switch (instr.getCategory()) {
#if defined(DYNINST_MAJOR_VERSION) && (DYNINST_MAJOR_VERSION >= 10)
      case InstructionAPI::c_VectorInsn:
         flags.insert(bb_vectorized);
         break;
#endif
      case InstructionAPI::c_CallInsn:
         flags.insert(bb_call);
         break;
      case InstructionAPI::c_SysEnterInsn:
      case InstructionAPI::c_SyscallInsn:
         flags.insert(bb_syscall);
         break;
      default:
         break;
   }
   if (instr.readsMemory())
      flags.insert(bb_memory_read);
   if (instr.writesMemory())
      flags.insert(bb_memory_write);   
}

static void print_clean_string(const std::string &str, ostream &out)
{
   static regex pattern("[^a-zA-Z0-9 /:;,\\.{}\\[\\]<>~|\\-_+()&\\*=$!#]");
   const size_t len = str.length();
   std::string str2;
   if (len > MAX_NAME_LENGTH) {
      size_t substrlen = (MAX_NAME_LENGTH - 3) / 2;
      str2 = str.substr(0, substrlen) + "..." + str.substr(len - substrlen);
   }
   else {
      str2 = str;
   }
      
   out << regex_replace(str, pattern, "?");
}

bool generateDOT(ostream &out)
{
   //create an Instruction decoder which will convert the binary opcodes to strings
   ParseAPI::Function *anyfunc = *funcs.begin();
   InstructionDecoder decoder(anyfunc->isrc()->getPtrToInstruction(anyfunc->addr()),
                              InstructionDecoder::maxInstructionLength,
                              anyfunc->region()->getArch());
   map<Block *, int> block_ids;
   int cur_id = 0;

   /**
    * Output DOT file format of CFG
    **/
   out << "digraph g {" << endl;

   for (CodeObject::funclist::iterator fit=funcs.begin(); fit != funcs.end(); fit++) {
      ParseAPI::Function *f = *fit;
      if (f->blocks().empty())
         continue;

      for (ParseAPI::Function::blocklist::iterator b = f->blocks().begin(); b != f->blocks().end(); b++) {
         Block *block = *b;
         Address icur = block->start();
         Address iend = block->last();
         stringstream instr_str;
         set<block_flags> flags;
         while (icur <= iend) {
            addresses.insert(icur);
            const unsigned char *raw_insnptr = (const unsigned char *) f->isrc()->getPtrToInstruction(icur);
#if defined(DYNINST_MAJOR_VERSION) && (DYNINST_MAJOR_VERSION >= 10)
            Instruction instr = decoder.decode(raw_insnptr);
#else
            Instruction::Ptr ip = decoder.decode(raw_insnptr);
            Instruction instr = *ip;
#endif
            instr_str << hex << "0x" << icur << ": " << instr.format();
            if (icur != iend)
               instr_str << "\\n";
            icur += instr.size();
            setBlockFlags(block, instr, flags);
         }
         //Set the basic block label to: function_name\n[instruction list]
         out << "B" << cur_id << " [shape=box, style=solid, label=\"";
         print_clean_string(f->name(), out);
         out << "\\n" << instr_str.str() << " 1, 0\"];" << endl;
         block_ids[block] = cur_id++;
         block_to_flags.insert(make_pair(block, flags));
      }
   }

   for (CodeObject::funclist::iterator fit = funcs.begin(); fit != funcs.end(); ++fit) {
      ParseAPI::Function *f = *fit;
      for (ParseAPI::Function::blocklist::iterator b = f->blocks().begin(); b != f->blocks().end(); b++) {
         Block *block = *b;
         for (ParseAPI::Block::edgelist::const_iterator e = block->sources().begin();
              e != block->sources().end(); e++)
         {
            Edge *edge = *e;
            map<Block *, int>::iterator sourcei = block_ids.find(edge->src());
            map<Block *, int>::iterator targeti = block_ids.find(edge->trg());
            if (sourcei == block_ids.end() || targeti == block_ids.end())
               continue;
            out << "B" << sourcei->second << " -> B" << targeti->second << " [style=solid, color=\"black\"];" << endl;
         }
      }
   }
   out << "}" << endl << endl;
   return true;
}

bool generateLineInfo(ostream &out, bool sourcelines_only = false)
{
   set<Statement::Ptr> all_lines;
   vector<Statement::Ptr> cur_lines;
   for (set<Address>::iterator addri = addresses.begin(); addri != addresses.end(); addri++) {
      cur_lines.clear();
      symtab->getSourceLines(cur_lines, *addri);
      if (cur_lines.empty())
         continue;
      copy(cur_lines.begin(), cur_lines.end(), inserter(all_lines, all_lines.begin()));

      for (vector<Statement::Ptr>::iterator linej = cur_lines.begin(); linej != cur_lines.end(); linej++) {
         Statement::Ptr fl = *linej;
         unique_sourcefiles.insert(fl->getFile());
      }
   }

   if (sourcelines_only)
      return true;

   if (all_lines.empty())
      return true;
   
   out << "\t\"lines\": [" << endl;
   set<Statement::Ptr>::iterator l = all_lines.begin();
   for (;;) {
      Statement::Ptr li = *l;
      
      out << "\t\t{ \"file\": \"";
      print_clean_string(li->getFile(), out);
      out << "\", "
          <<     "\"line\": \"" << li->getLine() << "\", "
          <<     "\"from\": " << li->startAddr() << ", "
          <<     "\"to\": " << li->endAddr() << " }";
      l++;
      if (l == all_lines.end()) {
         out << endl;
         break;
      }
      out << "," << endl;
   }
   out << "\t]," << endl;
   return true;
}

void printBlockEntry(ostream &out, Block *block)
{
   out << "\t\t\t { \"id\": " << block_to_id[block] << ","
       <<         " \"start\": " << block->start() << ","
       <<         " \"end\": " << block->end();
   
   const set<block_flags> &flags = block_to_flags[block];
   if (!flags.empty()) {
      out << ", \"flags\": [";
      for (set<block_flags>::const_iterator i = flags.begin();;) {
         switch (*i) {
            case bb_vectorized:
               out << "\"vector\"";
               break;
            case bb_memory_read:
               out << "\"memread\"";
               break;
            case bb_memory_write:
               out << "\"memwrite\"";
               break;
            case bb_call:
               out << "\"call\"";
               break;
            case bb_syscall:
               out << "\"syscall\"";
               break;
            case bb_fp:
               out << "\"fp\"";
               break;
         }
         i++;
         if (i == flags.end())
            break;
         out << ", ";
      }
      out << "]";
   }
   out << " }";
}


template<typename T>
string number_to_hex(T val){
	stringstream stream;
	stream 
		// << "0x"
		// << setfill('0') << setw(sizeof(T)*2)	

		<< hex << val;
	return stream.str();

}

// Returns the register name from the full name
// Full name also contains the architecture 
// e.g. x86_64::rbx 
string getRegFromFullName(string fullname){
	return fullname.substr(fullname.rfind("::") + 2);
}

void printVar(ostream &out, localVar *var, bool isInlineFn, int tabWidth ){
   
   // storageClass 
   	// - storageUnset
   	// - storageAddr
   	// - storageReg
   	// - storageRefOffset

   // storageRefClass
   	// - storageRefUnset
   	// - storageRef
   	// - storageNoRef

	string stClassArr[]= {"storageUnset", "storageAddr", "storageReg", "storageRegOffset"};
	string refClassArr[] = {"storageRefUnset", "storageRef", "storageNoRef"}; 

   
   string name = var->getName();
   int lineNum = var->getLineNum();
   string fileName = var->getFileName();
   // Type *type = var->getType();
   // string typeName = type->getName();
   // string typeName = type->name();
   
	// cout << endl << "Var name: " << name << "; "
   // << "filename: " << fileName << "; " 
   // << "line no.: " << lineNum << "; " << endl;
   // << "type: " << typeName << endl;
   
	for(int t=0; t<tabWidth+1; t++)	{out << "\t";}
	out << "    \"name\": " << "\"";
   print_clean_string(name, out);
   out << "\"" << ", " 
      << "\"file\": " << "\"" << fileName << "\"" << ", " 
      << "\"line\": "  << "\"" << lineNum  << "\"" << ", " 
      << endl;

   vector<VariableLocation> locations = var->getLocationLists();

   // cout << "Variable Locations: " << endl;
  
	for(int t=0; t<tabWidth+1; t++)	{out << "\t";}
  	out << "    \"locations\": [ " << endl;  
 
   // for(auto i=0; i<locations.size(); i++){
   
   for(vector<VariableLocation>::iterator location = locations.begin(); 
         location != locations.end(); ++location){

   		// VariableLocation *location = &locations[i];
   		// string stClass = location->storageClass2Str(location->stClass);
   		// string refClass = location->storageRefClass2Str(location->refClass);

         // cout << "stClass: " stClass << endl;
         // cout << "refClass: " refClass << endl;

   	  // cout << stClassArr[location->stClass] << ", ";
        // cout << refClassArr[location->refClass] << endl;
  		  long frameOffset = location->frameOffset;
   		// long frameOffsetAbs = location->frameOffsetAbs;

         // cout << "frameOffset: " << number_to_hex(frameOffset) << endl;

   		Address lowPC = location->lowPC;
   		Address hiPC = location->hiPC;

   		string hiPC_str = number_to_hex(hiPC);
   		string lowPC_str = number_to_hex(lowPC);

         // cout << "Address range: " << lowPC_str << " - " << hiPC_str << endl;
	for(int t=0; t<tabWidth+2; t++)  {out << "\t";}
	out << "    { \"start\": \"" << lowPC_str << "\", " << "\"end\": \"" << hiPC_str << "\", ";


   		  MachRegister mr_reg = location->mr_reg;
   		  string full_regName = mr_reg.name();
		string regName = getRegFromFullName(full_regName);

         // cout << "regName: " << regName << endl;
	      // cout << "Full regName: " << full_regName << endl;
   		string finalVarString; 

   		// Match the variable format with the output in the disassembly

   		if(location->stClass == storageAddr){
   			if(location->refClass == storageNoRef){
   				finalVarString = "$0x" + number_to_hex(frameOffset);  // at&t syntax
   				// finalVarString = number_to_hex(frameOffset);
   			} else if(location->refClass == storageRef) {
   				finalVarString = "($0x" + number_to_hex(frameOffset) + ")";  //at&t syntax
   				// finalVarString = "[" + number_to_hex(frameOffset) + "]";
   			}
   		} else if (location->stClass == storageReg){
   			if(location->refClass == storageNoRef){
   				finalVarString = "%" + getRegFromFullName(location->mr_reg.name());  // at&t syntax
   				// finalVarString = getRegFromFullName(location->mr_reg.name());
   			} else if(location->refClass == storageRef) {
   				finalVarString = "(%" + getRegFromFullName(location->mr_reg.name()) + ")"; // at&t syntax
   				// finalVarString = "[" + getRegFromFullName(location->mr_reg.name()) + "]";
   			}
   		} else if (location->stClass == storageRegOffset){
   		
   			if(location->refClass == storageNoRef){
  				   finalVarString = "0x" + number_to_hex(frameOffset) + "(%" + getRegFromFullName(location->mr_reg.name()) + ")"; // at&t syntax
   				// finalVarString = getRegFromFullName(location->mr_reg.name()) + " + " + number_to_hex(frameOffset);
   			} else if(location->refClass == storageRef) {
  				   finalVarString = "0x" + number_to_hex(frameOffset) + "(%" + getRegFromFullName(location->mr_reg.name()) + ")"; // at&t syntax
   				// finalVarString = "[" + getRegFromFullName(location->mr_reg.name()) + " + " + number_to_hex(frameOffset) + "]";
   			}
   		}

         // cout << "finalVarString: " << finalVarString << endl << endl;
        
        out << "\"location\": \"" << finalVarString << "\"";  
   	out << " }"; 
   	
      // if(i<locations.size()-1)
      // if this is not the last item
      if(next(location) != locations.end())
      	{ out << "," << endl;}	
   }

   // cout << endl;
	out << endl;
	for(int t=0; t<tabWidth+1; t++)	{out << "\t";}
   out << "  ]";

}

// Prints the local variables and parameters of the function along with 
// the location in the assembly code

void printFnVars(ostream &out, FunctionBase *f, bool isInlineFn, int tabWidth){

   vector<localVar *> thisLocalVars;
   vector<localVar *> thisParams;

   f->getLocalVariables(thisLocalVars);
   f->getParams(thisParams);

   set<localVar *> allVars;

   for(vector<localVar *>::iterator it = thisLocalVars.begin();
   		it != thisLocalVars.end(); ++it) {
   		allVars.insert(*it);
   }
   for(vector<localVar *>::iterator it = thisParams.begin();
   		it != thisParams.end(); ++it) {
   		allVars.insert(*it);
   }

   // cout << endl << "Reached function: " << f->getName() << endl;

	if(!isInlineFn){
		out << ",";
		out << endl;
	}
	
	for(int t=0; t<tabWidth; t++)	{out << "\t";} 
	out<< "  \"vars\": [" << endl; 

	for(set<localVar *>::iterator it = allVars.begin(); it != allVars.end() ; ++it){
		
		for(int t=0; t<tabWidth+1; t++)	{out << "\t";}
		out << "  {" << endl;  
	    printVar(out, (*it), isInlineFn, tabWidth);
		out << endl;
		for(int t=0; t<tabWidth+1; t++)	{out << "\t";}
		out << "  }" ;
		
		//if this is not the last item
		if(next(it) != allVars.end())	{out << "," << endl;}

	}

	out << endl;	
	for(int t=0; t<tabWidth; t++)	{out << "\t";} 
	out << "  ]" ;
	if(isInlineFn){
		out << "," << endl;
	}

}

void printInlineEntries(ostream &out, set<InlinedFunction *> &ifuncs, int tabwidth)
{
   for (int t = 0; t < tabwidth-1; t++) out << "\t";
   out << "  \"inlines\": [" << endl;
   for (set<InlinedFunction *>::iterator i = ifuncs.begin();;) {
      int status;
      InlinedFunction *ifunc = *i;
      const char *name = abi::__cxa_demangle(ifunc->getName().c_str(), 0, 0, &status);
      const char *name_str = name ? name : ifunc->getName().c_str();
      std::string cleaned_name_str;
      const FuncRangeCollection &ranges = ifunc->getRanges();

      for (int t = 0; t < tabwidth; t++) out << "\t";
      out << "{ \"name\": \"";
      print_clean_string(std::string(name_str), out);
      out << "\"," << endl;

      printFnVars(out, static_cast<FunctionBase*>(ifunc), true, tabwidth);

      if (!ranges.empty()) {
         for (int t = 0; t < tabwidth; t++) out << "\t";
         out << "  \"ranges\": [" << endl;
         for (FuncRangeCollection::const_iterator j = ranges.begin();;) {
            for (int t = 0; t < tabwidth+1; t++) out << "\t";
            out << "{ \"start\": " << (*j).low() << ", \"end\": " << (*j).high() << "}";
            j++;
            if (j == ranges.end()) {
               out << endl;
               break;
            }
            out << "," << endl;
         }
         for (int t = 0; t < tabwidth; t++) out << "\t";
         out << "  ]," << endl;
      }
      for (int t = 0; t < tabwidth; t++) out << "\t";
      out << "  \"callsite_file\": \"" << ifunc->getCallsite().first << "\"," << endl;
      for (int t = 0; t < tabwidth; t++) out << "\t";
      out << "  \"callsite_line\": " << ifunc->getCallsite().second;
      free(const_cast<char *> (name));

      SymtabAPI::InlineCollection ic = ifunc->getInlines();
      set<InlinedFunction *> next_funcs;
      for (SymtabAPI::InlineCollection::iterator j = ic.begin(); j != ic.end(); j++)
         next_funcs.insert(static_cast<InlinedFunction *>(*j));
      if (!next_funcs.empty()) {
         out << "," << endl;
         printInlineEntries(out, next_funcs, tabwidth+1);
      }

      out << endl;
      for (int t = 0; t < tabwidth; t++) out << "\t";
      out << "}";

      i++;
      if (i == ifuncs.end())
         break;
      out << "," << endl;
   }
   out << endl;
   for (int t = 0; t < tabwidth-1; t++) out << "\t";   
   out << "  ]";
}


void printInlines(ostream &out, ParseAPI::Function *f)
{   
   //There can be disjoint views of SymtabAPI functions (what the symbol table
   // says function boundaries look like) and ParseAPI functions (what code
   // in the binary forms a functional-style unit).  Optimizations like outlining
   // or multi-entry functions can cause this.
   //For each basic block in the ParseAPI function, get the containing SymtabAPI
   // function and use the set of SymtabAPI functions to get inlining for this parse
   // function.
   set<FunctionBase *> top_level_functions;
   for (ParseAPI::Function::blocklist::iterator i = f->blocks().begin(); i != f->blocks().end(); i++) {
      SymtabAPI::Function *symt_func = NULL;
      symtab->getContainingFunction((*i)->start(), symt_func);
      if (!symt_func)
         continue;
      top_level_functions.insert(symt_func);
   }
   if (top_level_functions.empty())
      return;

 
   set<InlinedFunction *> ifuncs;
   for (set<FunctionBase *>::iterator i = top_level_functions.begin(); i != top_level_functions.end(); i++) {
      
       
   	printFnVars(out, static_cast<FunctionBase*>(*i), false, 2 );

SymtabAPI::InlineCollection ic = (*i)->getInlines();
      for (SymtabAPI::InlineCollection::iterator j = ic.begin(); j != ic.end(); j++) {
         InlinedFunction *ifunc = static_cast<InlinedFunction *>(*j);
         if (addresses.find(ifunc->getOffset()) == addresses.end())
            continue;
         ifuncs.insert(ifunc);
      }
   }
   if (ifuncs.empty())
      return;
   out << "," << endl;
   printInlineEntries(out, ifuncs, 3);
}

void printLoopEntry(ostream &out, LoopTreeNode *lt, int tabwidth)
{
   if (lt->loop) {
      vector<Edge*> backedges;
      vector<Block*> blocks;
      lt->loop->getBackEdges(backedges);
      lt->loop->getLoopBasicBlocks(blocks);
      
      for (int i=0; i<tabwidth; i++) out << "\t";
      out << "{ \"name\": \"" << lt->name() << "\", ";
      if (!backedges.empty()) {
         out << "\"backedges\": [";
         for (vector<Edge *>::iterator i = backedges.begin();;) {
            Edge *e = *i;
            out << " {\"from\": " << block_to_id[e->src()]
                << ", \"to\": " << block_to_id[e->trg()]
                << "}";
            i++;
            if (i == backedges.end())
               break;
            out << ",";
         }
         out << " ],";
      }
      out << endl;
      for (int i=0; i<tabwidth; i++) out << "\t";
      out << "  \"blocks\": [";
      for (vector<Block*>::iterator i = blocks.begin();;) {
         out << block_to_id[*i];
         i++;
         if (i == blocks.end())
            break;
         out << ", ";
      }
      out << "]";      
   }
   if (!lt->children.empty()) {
      out << "," << endl;
      for (int i=0; i<tabwidth; i++) out << "\t";      
      out << "  \"loops\": [" << endl;
      for (vector<LoopTreeNode *>::iterator i = lt->children.begin();;) {
         printLoopEntry(out, *i, tabwidth+1);
         i++;
         if (i == lt->children.end()) {
            out << endl;
            break;
         }
         out << "," << endl;
      }
      for (int i=0; i<tabwidth; i++) out << "\t";
      out << "  ]";
   }
   if (lt->loop) {
      if (!lt->children.empty()) {
         out << endl;
         for (int i=0; i<tabwidth; i++) out << "\t";
      }
      out << "}";
   }
}

void printLoops(ostream &out, ParseAPI::Function *f)
{
   LoopTreeNode *lt = f->getLoopTree();
   if (!lt)
      return;
   printLoopEntry(out, lt, 2);
   out << "," << endl;
}

void printCalls(ostream &out, ParseAPI::Function *f)
{
   ParseAPI::Function::edgelist el = f->callEdges();
   out << "\t\t  \"calls\": [" << endl;
   ParseAPI::Function::edgelist::iterator i = el.begin();
   while (i != el.end()) {
      Edge* edge = *i;
      if (!edge)
         continue;
      Block *from = edge->src();
      Block *to = edge->trg();
      
      out << "\t\t\t{ \"address\": " << from->lastInsnAddr() << ", ";
      if (to && to->start() != (unsigned long) -1)
         out << "\"target\": " << to->start();
      else
         out << "\"target\": 0";

      vector<ParseAPI::Function *> funcs;
      to->getFuncs(funcs);
      if (!funcs.empty()) {
         out << ", \"target_func\": [";
         vector<ParseAPI::Function *>::iterator j = funcs.begin();
         for (;;) {
            out << "\"";
            print_clean_string((*j)->name(), out);
            out << "\"";
            if (++j == funcs.end())
               break;
            out << ", ";
         }
         out << "]";;
      }
      out << "}";
      if (++i == el.end()) {
         out << endl;
         break;
      }
      out << "," << endl;
   }
   out << "\t\t  ]";
}

void printFunctionEntry(ostream &out, ParseAPI::Function *f)
{
   out << "\t\t{ \"name\": \"";
   print_clean_string(f->name(), out);
   out << "\","
       <<      " \"entry\": " << f->addr() << "," << endl
       << "\t\t  \"basicblocks\": [" << endl;

   ParseAPI::Function::blocklist blocks = f->blocks();
   for (ParseAPI::Function::blocklist::iterator i = blocks.begin();;) {
      printBlockEntry(out, *i);
      i++;
      if (i == blocks.end()) {
         out << endl;
         break;
      }
      out << "," << endl;
   }
   out << "\t\t  ]"; //end basicblocks

   // printFnVars(out, static_cast<FunctionBase*>(f) );

   printInlines(out, f);
   printLoops(out, f);
   printCalls(out, f);
   out << endl << "\t\t}";
}

static void printSourceFiles(ostream &out)
{
   if (unique_sourcefiles.empty()) {
      generateLineInfo(out, true);
   }

   out << "\"sourcefiles\": [" << endl;
   for (set<string>::iterator i = unique_sourcefiles.begin(); i != unique_sourcefiles.end();) {
      string file = *i;
      out << "\t{ \"file\": \"" << file << "\" }";
      i++;
      if (i == unique_sourcefiles.end()) {
         out << endl;
         break;
      }
      out << "," << endl;
   }
   out << "]" << endl;
}

void generateFunctionTable(ostream &out)
{
   out << "\t\"functions\": [" << endl;
   for (CodeObject::funclist::iterator f = funcs.begin();;) {
      printFunctionEntry(out, *f);
      f++;
      if (f == funcs.end()) {
         out << endl;
         break;
      }
      out << "," << endl;
   }
   out << "\t]" << endl;
}

void setBlockIds()
{
   static unsigned long id = 0;
   for (CodeObject::funclist::iterator f = funcs.begin(); f != funcs.end(); f++) {
      ParseAPI::Function::blocklist blocks = (*f)->blocks();
      for (ParseAPI::Function::blocklist::iterator i = blocks.begin(); i != blocks.end(); i++) {
         block_to_id[*i] = id++;
      }
   }
}

static void printParse(ostream &f)
{
   f << "{" << endl;
   setBlockIds();
   generateLineInfo(f);
   generateFunctionTable(f);
   f << "}" << endl;   
}

static void closeInteractive()
{
   const char *files[] = { "fifo0", "fifo1", "fifo2", "target", NULL };
   for (const char **f = files; *f; f++) {
      string filepath = tempdir + "/" + string(*f);
      unlink(filepath.c_str());
   }
   rmdir(tempdir.c_str());
}

static void restartTimeout()
{
   alarm(INTERACTIVE_TIMEOUT_S);
}

static void startInteractiveSession(string &cmd, ifstream &in, ofstream &out, ofstream &ctrl)
{
   for (;;) {
      bool had_error = true;
      restartTimeout();
      if (in.is_open()) {
         had_error = !static_cast<bool>(in >> cmd);
      }

      if (!had_error) {
         break;
      }

      if (in.is_open()) {
         in.close();
         out.close();
         ctrl.close();
      }
      in = ifstream((tempdir + "/fifo0").c_str());
      out = ofstream((tempdir + "/fifo1").c_str());
      ctrl = ofstream((tempdir + "/fifo2").c_str());
   }   
}

static void on_alarm(int sig)
{
   closeInteractive();
   exit(0);
}

static void doInteractive()
{
   string cmd;
   ifstream in;
   ofstream out, ctrl;

   signal(SIGALRM, on_alarm);
   
   for (;;) {
      startInteractiveSession(cmd, in, out, ctrl);
      if (cmd == "open") {
      }
      else if (cmd == "parse") {
         printParse(out);
      }
      else if (cmd == "dot") {
         generateDOT(out);
      }
      else if (cmd == "sourcefiles") {
         printSourceFiles(out);
      }
      else if (cmd == "keepalive") {
         restartTimeout();
      }
      else if (cmd == "close") {
         goto done;
      }
      out << "OPTPARSER OPERATION DONE\n";
      out.flush();
   }

  done:
   closeInteractive();
}

int main(int argc, char **argv)
{
   if (!parseArgs(argc, argv)) {
      return -1;
   }

   if (interactive) {
      close(0);
      close(1);
      close(2);
      doInteractive();
   }
   ofstream dotf(string(filename + ".dot").c_str());
   generateDOT(dotf);
   dotf.close();

   ofstream jsonf(string(filename + ".json").c_str());
   printParse(jsonf);
   jsonf.close();
   
   return 0;
}
