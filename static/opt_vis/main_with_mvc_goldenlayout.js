
var SRC_FILENAME = 'lulesh.cc';
var JSON_FILENAME = 'lulesh2.0.json';

var DOT_FILENAME_FULL = 'lulesh2.0.dot';

if(isHostLLNL()){
  var pre2 = "/lorenz_base/dev/pascal/optvis";
  var prefix = pre2 + "/static/opt_vis/sample_inputs/lulesh_out_serial/optparser_v3/out_serial_O3/";
} else if(isXAMPP()){
  var pre2 = "/sd_xampp_dev/opt_vis";
  var prefix = pre2 + "/static/opt_vis/sample_inputs/lulesh_out_serial/optparser_v3/out_serial_O3/";
} else {
  var prefix = "/static/opt_vis/sample_inputs/lulesh_out_serial/optparser_v3/out_serial_O3/";
}

var tree_data = {};

var JSON_DATA = {};
var SRC_DATA = "";
var DOT_DATA = "";
var DOT_FULL_DATA = "";

// variables for loopify_dagre
var loopsObj = null;
var dotFile = "";

var SRC_CODE_ARRAY = [];

var g, g_full;

// This object is keyed by the nodeId of the graph nodes and contains the d3 selection 
// of the "g" object which stores the node
var nodesAll = {}; 

// This object is keyed by the edgeId of the graph and contains the d3 selection of
// the path that represents the edge
var edgesAll = {};

// This object is keyed by the edgeId of the graph and contains the d3 selection of the
// text that represents the edge
var edgeLabelsAll = {}; 

var model, view_source, view_inline_tree, view_graph, controller, view_highlighted_items, view_var_renamer;

// Array that stores the list of assembly instruction objects.
// The fields in the object are 
// i) id: the address of that instruction
// ii) code: the assembly code in that instruction
// iii) block: the block number of that instruction for coloring etc.
// iv) blockId: the block ID i.e. the node name in the CFG
// v) fnName: the name of the function it belongs to 
// vi) startBlock: (optional) this signals if this instruction is the first in the block
// vii) endBlock: (optional) this signals if this instruction is the second in the block
// vi and vii are used for border or padding purposes to separate the blocks  

// Sample array

var ASSEMBLY_ARRAY = [];

/*
var ASSEMBLY_ARRAY = [
    {id:0x2c0, code: "mov %edi,0xfffffffffffffff0(%rsp)", block:0, blockId:"B0", fnName:"calcElem", startBlock:true},
    {id:0x2c4, code: "movd 0xfffffffffffffff0(%rsp),%xmm7", block:0, blockId:"B0", fnName:"calcElem"},
    {id:0x40e, code:"ret near (%rsp) 1, 0", block:4, blockId:"B21", fnName:"multElem", startBlock:true, endBlock:true}
  ];
*/

/*********************************************************************/
// TODO: Handle multiple files
// When working with the data from json file, 
// always filter on the current filename that is active or in context 


/* FIle input from browser
var f_src_file = document.getElementById('fi_src');
var f_dot_file = document.getElementById('fi_dot');
var f_json_file = document.getElementById('fi_json');

var fr1 = new FileReader();
var fr2 = new FileReader();
var fr3 = new FileReader();
*/

// Split(['#highlightList', '#left', '#middle' , '#right']);

// Use goldenlayout to manage layouts

var config = 
{
   "content":[
      {
         "type":"row",
         "content":[
            {
               "type":"column",
               "content":[
                   {
                     "type":"component",
                     "componentName":"SubEnterExec",
                     "componentState":{
                        "label":"SubEnterExecItems"
                     }
                   },
                  {
                     "type":"component",
                     "componentName":"HighlightedItems",
                     "componentState":{
                        "label":"HighlightedItems"
                     }
                  },
                  {
                     "type":"component",
                     "componentName":"VarRenamer",
                     "componentState":{
                        "label":"VarRenamer"
                     }
                  }
               ]
            },
            {
               "type":"component",
               "componentName":"FnLoops",
               "componentState":{
                  "label":"Function and Loops"
               }
            },
            {
               "type":"component",
               "componentName":"SourceCode",
               "componentState":{
                  "label":"SourceCode"
               }
            },
            {
               "type":"component",
               "componentName":"Disassembly",
               "componentState":{
                  "label":"Disassembly"
               }
            },
            {
               "type":"column",
               "content":[
                  {
                     "type":"component",
                     "componentName":"CallGraph",
                     "componentState":{
                        "label":"CallGraph"
                     }
                  }, 
                  {
                     "type":"component",
                     "componentName":"CFG",
                     "componentState":{
                        "label":"CFG"
                     }
                  }
               ]
            }
         ]
      }
   ]
};

var myLayout = new GoldenLayout(config);

myLayout.registerComponent('SubEnterExec', function( container, componentState) {

    var see = d3.select('#sub_enter_exec');
    var node = see.node();
    var str = node.outerHTML;

	str = str.replace(/sub_/g, '');
	str = str.replace(/invisible/g, '');

    container.getElement().html( str );
});

myLayout.registerComponent('FnLoops', function (container, componentState){
  
  var str = d3.select("#sub_fn_loopView").node().outerHTML;
  str = str.replace(/sub_/g, '');
  str = str.replace(/invisible/g, '');
  container.getElement().html(str);

});


myLayout.registerComponent('HighlightedItems', function (container, componentState){

	var str = d3.select("#sub_highlightList").node().outerHTML;
	str = str.replace(/sub_/g, '');
	str = str.replace(/invisible/g, '');
	container.getElement().html(str);

});

myLayout.registerComponent('VarRenamer', function (container, componentState){

  var str = d3.select("#sub_var_rename_window").node().outerHTML;
  str = str.replace(/sub_/g, '');
  str = str.replace(/invisible/g, '');
  container.getElement().html(str);

});

myLayout.registerComponent('SourceCode', function (container, componentState){
  
	var str = d3.select("#sub_left").node().outerHTML;
	str = str.replace(/sub_/g, '');
	str = str.replace(/invisible/g, '');
	container.getElement().html(str);

});

myLayout.registerComponent('Disassembly', function (container, componentState){
  
  	var str = d3.select("#sub_middle").node().outerHTML;
	str = str.replace(/sub_/g, '');
	str = str.replace(/invisible/g, '');
	container.getElement().html(str);

});

myLayout.registerComponent('CFG', function (container, componentState){
  	var str = d3.select("#sub_right").node().outerHTML;
	str = str.replace(/sub_/g, '');
	str = str.replace(/invisible/g, '');
	container.getElement().html(str);

});

myLayout.registerComponent('CallGraph', function (container, componentState){
  var str = d3.select("#sub_call_graph").node().outerHTML;
  str = str.replace(/sub_/g, '');
  str = str.replace(/invisible/g, '');
  container.getElement().html(str);
});

myLayout.init();
//console.dir(myLayout.toConfig());

// console.log(config);
// console.log(myLayout);

/* Top menu code starts */
/*
// Wire the handler for file loading
d3.select("#loadFile")
  .on("click", function(){
        loadFile();
  });

// Toggle menu visibility when clicking the menu button
d3.select("#mydropbtn")
  .on("click", function(){

    //Toggle the visibility
    var div = d3.select(".dropdown-content");

    if(div.style("display") == "none"){
      div.style("display", "block");
    } else {
      div.style("display", "none");
    }

    // div.style("display", "block");

});

// Close the menu on clicking the close menu button
d3.select("#closeMenu").on("click", function(){
  d3.select(".dropdown-content").style("display", "none");
});
*/
/* Top menu code ends */


//loadFile();

// Loads the files selected from the menu
function loadFile(){

	/***** Edit Comment Out for load menu ********/
	/*
	if(f_src_file.files[0] == undefined){
		alert("Please provide the source code file");
    return;
	}
	if(f_dot_file.files[0] == undefined){
		alert("Please provide the dot file");
    return;
	}
	if(f_json_file.files[0] == undefined){
		alert("Please provide the json analysis file");
    return;
	} 
	*/

	/***** Edit Comment Out for load menu ********/	
  /*
  SRC_FILENAME = f_src_file.files[0].name;
  console.log(SRC_FILENAME);
  */

  	/***** Edit Comment Out for load menu ********/	
	/*
	fr1.readAsText(f_json_file.files[0]);
  	fr1.onloadend=function(){
      JSON_DATA = JSON.parse(this.result);
    */  

    /***** Edit Comment for load menu ********/	
	d3.json(prefix + JSON_FILENAME, function(data) {
	  JSON_DATA = data;
	/***** Edit Comment for load menu ********/	 
	  
	  console.log(JSON_DATA);

	  // convert the line numbers to integers
	  var lines = JSON_DATA.lines;
	  var filtered_lines = [];

    var regex1 = RegExp(SRC_FILENAME);

	  // Filter by the filename
	  for(var i =0; i<lines.length; i++){
	    //convert the line numbers to 0-based index
	    lines[i].line = parseInt(lines[i].line) - 1;
	    // If the file contains the filename 
	    if(regex1.test(lines[i].file)) {
	      filtered_lines.push(lines[i]);
	    }
	  }

	  lines = JSON_DATA.lines = filtered_lines;

	  // shallow copy the lines object since its composed of only string literals 
	  // and integers
	  // linesAssembly stores the correspondence between source and assembly in 
	  // the sorted order of assembly ranges (i.e. it is sorted on the "from" property
	  // of the object)
	  
	  // Deep copy of lines array
	  //var linesAssembly = lines.map(a => Object.assign({}, a));
	  
	  // Shallow copy of lines array
	  var linesAssembly = lines.slice(0);

	  JSON_DATA.linesAssembly = linesAssembly;

	  // sort the lines array based on line number of source code
	  lines.sort(function(a, b) {
	    return a.line - b.line;
	  });

	  // sort the linesAssembly array based on the from field 
	  linesAssembly.sort(function(a,b){
	    return a.from - b.from;
	  });

    /***** Edit Comment Out for load menu ********/	
	  /*
	  fr2.readAsText(f_src_file.files[0]);
    fr2.onloadend=function(){
      	SRC_DATA = this.result;
      	*/

      /***** Edit Comment for load menu ********/	
	  d3.text(prefix + SRC_FILENAME, function(data){
	    SRC_DATA = data;
	  /***** Edit Comment Out for load menu ********/	
	    
	    SRC_CODE_ARRAY = SRC_DATA.split('\n');

	    for(var i = 0 ; i < SRC_CODE_ARRAY.length; i++){
	      SRC_CODE_ARRAY[i] = {code: SRC_CODE_ARRAY[i], lineNum: i};
	    }

	    // Check if this line number has any mapping to assembly instructions
	    for(var i = 0; i < lines.length; i++){
	      SRC_CODE_ARRAY[lines[i].line].hasMatchingAssembly = true;
	    }
	    
	    // console.log(SRC_DATA);
	    // console.log(SRC_CODE_ARRAY);

	    /***** Edit Comment Out for load menu ********/	
	    /*
	    fr3.readAsText(f_dot_file.files[0]);
      fr3.onloadend=function(){
      	DOT_FULL_DATA = this.result;
      	*/
      	/***** Edit Comment Out for load menu ********/	

      	/***** Edit Comment for load menu ********/	
	    d3.text(prefix + DOT_FILENAME_FULL, function(data){
	      DOT_FULL_DATA = data;
	    /***** Edit Comment Out for load menu ********/	

	      DOT_FULL_DATA = DOT_FULL_DATA.replace(/\\l/g, "\n");    

	      
	        g_full = graphlibDot.parse(DOT_FULL_DATA);
	        console.log(g_full);

          // Create a copy of the graph
          g = graphlibDot.parse(DOT_FULL_DATA);

          // To copy the graph directly from another graph
          // var g3 = graphlib.json.read(graphlib.json.write(g));
          // To copy a graph from a string
          // var g2 = graphlib.json.read(JSON.parse(str));

  		    // Make the label of the graph the basic block name plus the function name
  		    var graph_nodes = g.nodes();
          	var label;

  		    for(var i = 0; i<graph_nodes.length; i++){
            label = g.node(graph_nodes[i]).label;
  		    	g.node(graph_nodes[i]).label = graph_nodes[i] + ": " + getFunctionFromLabel(label);
  		    }

		    
	        ASSEMBLY_ARRAY = getAssemblyInstrs();
	        console.log(ASSEMBLY_ARRAY);

	        var callGraph = makeCallGraph(JSON_DATA);
          console.log(callGraph);

	        model = makeModel();
          model.set("callGraph", callGraph);

	        view_source = makeSourceCodeView(model, 'text_src', 'left');
	        
          view_disassembly = makeDisassemblyView(model, 'text_assembly', 'middle');

          view_graph = makeCFGGraphView(model, 'graphContainer', 'right');
	        view_highlighted_items = makeHighlightedItemsView(model, 'highlightList');
	        
          view_var_renamer = makeVarRenamingView(model, 'var_rename_window');
          view_callgraph = makeCallGraphView(model, 'callGraphContainer' , 'call_graph');

          view_navBar_Loops = makeLoopFnTreeView(model, 'loopsView', 'fnInlineView', 'fn_loopView');

	        controller = makeController(model);

	        // model.register(view_source.render);
	        model.register(view_source.highlight);
	        
          model.register(view_disassembly.highlight);

          model.register(view_graph.highlight);
	        model.register(view_highlighted_items.render);
	        model.register(view_var_renamer.render);
          model.register(view_callgraph.highlight);
          
          model.registerWithTag(view_disassembly.highlight, viewTypes.viewDisassembly);
          model.registerWithTag(view_var_renamer.render, viewTypes.viewVarRenamer);
          model.registerWithTag(view_callgraph.highlight, viewTypes.viewCallGraph);

	        view_source.register(controller.dispatch);
	        
          view_disassembly.register(controller.dispatch);

          view_graph.register(controller.dispatch);
        	view_var_renamer.register(controller.dispatch);
          view_callgraph.register(controller.dispatch);

	      }
	      /***** Edit Comment for load menu ********/	
	      )
	      /***** Edit Comment for load menu ********/	
	      ;

	    }
	    /***** Edit Comment for load menu ********/		
	    )
	  	/***** Edit Comment for load menu ********/	
	    ;

	  }
	  /***** Edit Comment Out for load menu ********/	
	  )
	  /***** Edit Comment Out for load menu ********/	
	  ;

}

// This function extracts the array of instructions from the dot file
// Parses the label field from the CFG node
// From each node, it extracts the function name, instruction address, assembly code, block num, block label, and 
// starting and ending instructions of the block
// Returns an array of instructions sorted on the instruction address which is stored in
// the id field of the object

function getAssemblyInstrs(){

  var out_assembly_array = [];

  var graph_nodes = g_full.nodes();
  for(var i=0; i<graph_nodes.length; i++){
      var nodeId = graph_nodes[i];

      var label = g_full.node(nodeId)["label"];

      var instrs = label.split('\\n');
      var fn_name = instrs.shift();

      for(var j=0; j<instrs.length; j++){
        var thisStr = instrs[j];

        var n = thisStr.indexOf(":");
        var this_code = thisStr.substring(n+1).trim();
        var this_address = thisStr.substring(0,n).trim();
        this_address = Number(this_address);

        this_instr_obj = {};
        this_instr_obj.id = this_address;
        this_instr_obj.code = this_code;
        this_instr_obj.block = i;
        this_instr_obj.blockId = nodeId;
        this_instr_obj.fnName = fn_name;

        if (j == 0){
          this_instr_obj.startBlock = true;
        }
        if(j == instrs.length - 1){
          this_instr_obj.endBlock = true;
        }

        out_assembly_array.push(this_instr_obj);

      }

  }

  // sort the array based on address
  out_assembly_array.sort(function(a, b) {
    return a.id - b.id;
  });

  return out_assembly_array;

}

