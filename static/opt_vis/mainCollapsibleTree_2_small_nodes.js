var SRC_FILENAME = 'lulesh.cc'
var JSON_FILENAME = 'lulesh.o.json'
var DOT_FILENAME = 'lulesh.o_small_nodes.dot'
var DOT_FILENAME_FULL = 'lulesh.o.dot'

var prefix = "/static/opt_vis/";

var JSON_DATA = {};
var SRC_DATA = "";
var DOT_DATA = "";
var DOT_FULL_DATA = "";

var SRC_CODE_ARRAY = [];

var g = null;
var g_full = null;

var nodesAll = {}; 
var edgesAll = {};
var edgeLabelsAll = {}; 

// Array that stores the list of assembly instructions
// Currently hardcoded, can be obtained from dot file
// The fields are i) id: the address of that instruction
// ii) code: the assembly code in that instruction
// iii) block: the block number of that instruction for coloring etc.
// iv) startBlock: (optional) this signals if this instruction is the first in the block
// v) endBlock: (optional) this signals if this instruction is the second in the block
// iv and v are used for border or padding purposes to separate the blocks  

var ASSEMBLY_ARRAY = [
		{id:0x2c0, code: "mov %edi,0xfffffffffffffff0(%rsp)", block:0, startBlock:true},
		{id:0x2c4, code: "movd 0xfffffffffffffff0(%rsp),%xmm7", block:0},
		{id:0x40e, code:"ret near (%rsp) 1, 0", block:4, startBlock:true, endBlock:true}
	];

// This function extracts the array of instructions from the dot file
// Parses the label field from the CFG node
// From each node, it extracts the function name, instruction address, assembly code, block num, block label, and 
// starting and ending instructions of the block

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

// Structure that is used to build an indented code inlining structure of the program
// start and end fields contain the address of the starting and ending instructions of the function
// level is used for indention
// funcId is used for coloring as well as identifying the function
// Hardcoded currently but can be extracted from the inlining information from the json file

var assembly_data = [
		{start:704, end: 1039, name:"doLoop", level:0, funcId: 0},
		
		{start:714, end: 856, name:"dosum", level:1, funcId: 1},
		{start:901, end: 1007, name:"dosum", level:1, funcId: 1},
		
		{start:719, end: 801, name:"mult3", level:2, funcId: 2},
		{start:910, end: 915, name:"mult3", level:2, funcId: 2},
		{start:967, end: 1002, name:"mult3", level:2, funcId: 2},

		{start:714, end: 719, name:"mult1", level:2, funcId: 3},
		{start:801, end: 856, name:"mult1", level:2, funcId: 3},
		{start:905, end: 910, name:"mult1", level:2, funcId: 3},
		{start:915, end: 920, name:"mult1", level:2, funcId: 3},
		{start:930, end: 935, name:"mult1", level:2, funcId: 3},

		{start:901, end: 905, name:"mult2", level:2, funcId: 4},
		{start:920, end: 930, name:"mult2", level:2, funcId: 4},
		{start:935, end: 962, name:"mult2", level:2, funcId: 4}

	];

// This structure is used for collapsible tree widget that shows inlining structure
// The fields for each entry object are i) name: contains the name of the function
// ii) children: contains the array of entry objects within it
// Leaf nodes have no children

// Aggregate the information from both the dot file and the inlining information
// from json file
// Get the ranges from the inlining information and 
// fill the instructions from the dot file in these ranges

/*
var tree_data = {
 "name": "doLoop : 704 - 1039",
 "children": [
   {"name": "0x2c0: mov %edi,0xfffffffffffffff0(%rsp)"},
   {"name": "0x2c4: movd 0xfffffffffffffff0(%rsp),%xmm7"},
   {"name": "0x2ca: mov $0x1,%esi"},

   {"name": "dosum : 714 - 856",
   "children": [
	   	{"name": "mult1: 714 - 719",
	   		"children": [
	   			{"name": "714: mov $0x1,%esi"},
				{"name": "719: pcmpeqd %xmm0,%xmm0"}
	   		]

	   },
	   	{"name": "mult3: 719 - 801",
	   		"children": [
	   			{"name": "719: pcmpeqd %xmm0,%xmm0"}
 			
	   		]
	   },
	   	{"name": "mult1: 801 - 856",
	   	"children":[
	   		{"name": "806: mov %edx,0xfffffffffffffff0(%rsp)"}
      ]
    },
    {
   "name": "dosum : 901 - 1007",
   "children": [
	   	{"name": "mult2: 901 - 905",
	   	"children": [
	   		{"name": "901: movdqa %xmm3,%xmm1"},
			{"name": "905: movdqa %xmm0,%xmm5"}

	   	]

	   },
	   	{"name": "mult1: 905 - 910",

	   	"children": [
	   		{"name": "910: paddd %xmm0,%xmm0"}
	   	]

	   },
	   	{"name": "mult3: 910 - 915",
	   	"children": [
	   		{"name": "915: paddd %xmm2,%xmm5"}
	   	]
	   },
	   	{"name": "mult1: 915 - 920",
	   	"children": [
	   		{"name": "920: movdqa %xmm5,%xmm6"}
	   	]
	   },
	   	{"name": "mult2: 920 - 930",
	   	"children": [
	   		{"name": "925: pmuludq %xmm5,%xmm1"},
			{"name": "930: paddd %xmm3,%xmm5"}
	   	]

	   },
	   	{"name": "mult1: 930 - 935",
	   	"children": [
	   		{"name": "935: psrlq $0x20,%xmm6"}

	   	]

	   },
	   	{"name": "mult2: 935 - 962",
	   	"children": [
	   		{"name": "941: pmuludq %xmm6,%xmm6"},
  	
	   	]

	   },
	   	{"name": "mult3: 967 - 1002", 
	   		"children":[

	   			{"name": "967: movdqa %xmm0,%xmm5"}
	   		]
	   },

	   	{"name": "1002: paddd %xmm5,%xmm1"},
        {"name": "1007: movaps %xmm1,0xfffffffffffffff0(%rdx)"}

  	]
  }
  ,

	 {"name": "1011: ret near (%rsp) 1, 0"},
	 {"name": "1014: ret near (%rsp) 1, 0"},
	 {"name": "1020: ret near (%rsp) 1, 0"},
	 {"name": "1027: ret near (%rsp) 1, 0"},
	 {"name": "1029: ret near (%rsp) 1, 0"},
	 {"name": "1032: ret near (%rsp) 1, 0"},
	 {"name": "1038: ret near (%rsp) 1, 0"}

  ] 
     
};
*/

var tree_data = {
 "name": "doLoop",
 "children": [
   {"name": "0x2c0: mov %edi,0xfffffffffffffff0(%rsp)"},
   {"name": "0x2c4: movd 0xfffffffffffffff0(%rsp),%xmm7"},
   {"name": "0x2ca: mov $0x1,%esi"},

   {"name": "dosum",
   "children": [
      {"name": "mult1",
        "children": [
          {"name": "714: mov $0x1,%esi"},
        {"name": "719: pcmpeqd %xmm0,%xmm0"}
        ]

     },
      {"name": "mult3",
        "children": [
          {"name": "719: pcmpeqd %xmm0,%xmm0"},
 {"name": "724: movdqa 0x143(%rip),%xmm3"},
 {"name": "733: mov 0x200d14(%rip),%rax"},
 {"name": "740: movdqa 0x143(%rip),%xmm2"},
 {"name": "749: pshufd %xmm7,$0x0,%xmm7"},
 {"name": "754: movdqa 0x115(%rip),%xmm4"},
 {"name": "763: movdqa %xmm7,%xmm1"},
 {"name": "768: lea 0x1000(%rax),%rcx"},
 {"name": "775: lea 0x401000(%rax),%r8"},
 {"name": "782: psrlq $0x20,%xmm1 1, 0"},
 {"name": "788: mov %esi,0xfffffffffffffff4(%rsp)"},
 {"name": "792: movd 0xfffffffffffffff4(%rsp),%xmm4"},
 {"name": "798: lea 0xfffffffffffffffe(%rsi),%edx"},
 {"name": "801: movdqa %xmm4,%xmm2"}
        ]
     },
      {"name": "mult1",
      "children":[
        {"name": "806: mov %edx,0xfffffffffffffff0(%rsp)"},
 {"name": "810: lea 0xfffff000(%rcx),%rdx"},
 {"name": "817: pshufd %xmm4,$0x0,%xmm3"},
 {"name": "822: movd 0xfffffffffffffff0(%rsp),%xmm4"},
  {"name": "828: movdqa %xmm3,%xmm6"},
  {"name": "832: pshufd %xmm4,$0x0,%xmm4"},
  {"name": "837: psrlq $0x20,%xmm6"},
  {"name": "842: movdqa %xmm4,%xmm5"},
  {"name": "846: psrlq $0x20,%xmm5"},
  {"name": "851: nop 0x0(%rax,%rax,1) 1, 0"},
  {"name": "856: movdqa %xmm2,%xmm1"}

      ]

     }
    ]
  },

  {
   "name": "dosum",
   "children": [
      {"name": "mult2",
      "children": [
        {"name": "901: movdqa %xmm3,%xmm1"},
      {"name": "905: movdqa %xmm0,%xmm5"}

      ]

     },
      {"name": "mult1",

      "children": [
        {"name": "910: paddd %xmm0,%xmm0"}
      ]

     },
      {"name": "mult3",
      "children": [
        {"name": "915: paddd %xmm2,%xmm5"}
      ]
     },
      {"name": "mult1",
      "children": [
        {"name": "920: movdqa %xmm5,%xmm6"}
      ]
     },
      {"name": "mult2",
      "children": [
        {"name": "925: pmuludq %xmm5,%xmm1"},
      {"name": "930: paddd %xmm3,%xmm5"}
      ]

     },
      {"name": "mult1",
      "children": [
        {"name": "935: psrlq $0x20,%xmm6"}

      ]

     },
      {"name": "mult2",
      "children": [
        {"name": "941: pmuludq %xmm6,%xmm6"},
  {"name": "946: pshufd %xmm1,$0x8,%xmm1"},
  {"name": "951: pshufd %xmm6,$0x8,%xmm6"},
  {"name": "957: punpcklqd %xmm6,%xmm1"},
  {"name": "962: paddd %xmm5,%xmm1"}
      ]

     },
      {"name": "mult3", 
        "children":[

          {"name": "967: movdqa %xmm0,%xmm5"},
  {"name": "972: psrlq $0x20,%xmm0"},
  {"name": "977: pmuludq %xmm4,%xmm5"},
  {"name": "982: pmuludq %xmm5,%xmm0"},
  {"name": "986: pshufd %xmm5,$0x8,%xmm5"},
  {"name": "992: pshufd %xmm0,$0x8,%xmm0"},
  {"name": "997: punpcklqd %xmm0,%xmm5"},
  {"name": "1002: paddd %xmm5,%xmm1"}

        ]
     },

      {"name": "1002: paddd %xmm5,%xmm1"},
        {"name": "1007: movaps %xmm1,0xfffffffffffffff0(%rdx)"}

    ]
  }
  ,

  {"name": "1011: ret near (%rsp) 1, 0"},
 {"name": "1014: ret near (%rsp) 1, 0"},
 {"name": "1020: ret near (%rsp) 1, 0"},
 {"name": "1027: ret near (%rsp) 1, 0"},
 {"name": "1029: ret near (%rsp) 1, 0"},
 {"name": "1032: ret near (%rsp) 1, 0"},
{"name": "1038: ret near (%rsp) 1, 0"}

  ] 
     
};

// var tree_data = {};

function createInlineTree(){

  var tree_data;

  // Add a root node to this tree
  tree_data = {"name":"root", 
    "children": [] 
  };

  // Add all the functions as children of the root node
  
  var functions = JSON_DATA.functions;

  for (var i=0; i<functions.length; i++){
    var this_function = functions[i];

    var this_fn_treeview = {"name": this_function.name, "children":[]};
    this_fn_treeview = addFunction(this_fn_treeview, this_function);

    tree_data.children.push(this_fn_treeview);

  }

  return tree_data;

}

// TODO: Handle duplicate basic blocks that are shared by multiple blocks here

function addFunction(this_fn_treeview, this_function){

  // iterate through the basic blocks
  var this_basic_blocks = this_function.basicblocks;
  var curr_basic_blk_index = 0;
  var curr_basic_blk = this_basic_blocks[curr_basic_blk_index];

  var isAllInlineConsumed = false;

  // if("inlines" in this_functions){
    this_inlines = this_function.inlines;
  // }

  curr_inlines_index = 0;
  this_inline = this_inlines[curr_inlines_index];
  curr_inline_ranges_index = 0;

  this_inline_ranges = this_inline.ranges;
  curr_inline_range = this_inline_ranges[curr_inline_ranges_index];
  curr_inline_start_addr = curr_inline_range.start; 


  //TODO: sort the basic block by start address so that you don't need to assume anything
  // about the order in which they are given

  //TODO: You also need to sort the inlines by start address so that you don't need to assume
  // anything about the order in which the inline ranges are given

  // iterate through the blocks
  for(var i = 0; i < this_basic_blocks.length; i++){
    curr_basic_blk_index = i;
    curr_basic_blk = this_basic_blocks[i];

    var to_insert_inline = false;

    // check if the first inline range is inside this basic block
    if(!isAllInlineConsumed){
      if((curr_inline_start_addr >= curr_basic_blk.start) 
        && (curr_inline_start_addr <= curr_basic_blk.end )){
        to_insert_inline = true;
      }
    }

    if(!to_insert_inline){
      // No inline block is inside this basic block
      // loop through the instructions array and add all the instructions that are inside this basic block
      // as leaf nodes to the tree

      for(var k = 0; k < ASSEMBLY_ARRAY.length; k++){
        var this_instr_obj = ASSEMBLY_ARRAY[k]; 
        if(this_instr_obj.id >= curr_basic_blk.start 
          && this_instr_obj.id <= curr_basic_blk.end){
          // NOTE: Can convert the address from decimal back to hex here for display purposes
          this_fn_treeview.children.push({"name": this_instr_obj.id + ": " + this_instr_obj.code});
        }
      }
      

    } else {
      //This inline block is inside this basic block

      // loop through the instructions array and add all the instructions that are not inside the inlines as leafs to the tree

      // for instructions that are inside the inline, use the function addRecursiveInline to add to the tree

      // loop through all the inline ranges and apply the same process

     for(var k=0; k < ASSEMBLY_ARRAY.length; k++){
        var this_instr_obj = ASSEMBLY_ARRAY[k];
        
        if(this_instr_obj.id >= curr_basic_blk.start 
          && this_instr_obj.id <= curr_basic_blk.end ){
          // This instruction is inside this basic block

          if((this_instr_obj.id < curr_inline_start_addr) || isAllInlineConsumed){
            // This instruction is not inside the inline block
            this_fn_treeview.children.push({"name": this_instr_obj.id + ": " + this_instr_obj.code});

          } else if(this_instr_obj.id >= curr_inline_start_addr
            && this_instr_obj.id <= curr_inline_range.end ){

            // This instruction is inside the inline block

            var this_inline_node = addRecursiveInline(this_inline);
            this_fn_treeview.children.push(this_inline_node);


          } else {
            // This instruction is after the inline range and outside it
            this_fn_treeview.children.push({"name": this_instr_obj.id + ": " + this_instr_obj.code});

            // Update the current inline block and current inline range
            curr_inline_ranges_index++;
            if(curr_inline_ranges_index >= this_inline_ranges.length){
              curr_inline_ranges_index = 0;
              curr_inlines_index++;

              if(curr_inlines_index >= this_inlines.length){
                // End of inline blocks
                // all inline blocks are processed
                curr_inlines_index = -1;
                isAllInlineConsumed = true;
              }

            }


            if(curr_inlines_index != -1){
              this_inline = this_inlines[curr_inlines_index];
            
              this_inline_ranges = this_inline.ranges;
              curr_inline_range = this_inline_ranges[curr_inline_ranges_index];
              curr_inline_start_addr = curr_inline_range.start;
            }

          }


        }
          }

     } 

    }
 
 return this_fn_treeview;

}

//TODO: Make this function call recursive
function addRecursiveInline(this_inline){
  
  var this_node = {"name": this_inline.name, "children": []};
  
  return this_node;

  var this_inline_ranges = this_inline.ranges;

  // iterate through the ranges
  for(var i = 0; i < this_inline_ranges.length; i++){
    
    var this_range = this_inline_ranges[i];

   for(var k =0 ; k< ASSEMBLY_ARRAY.length; k++){

      var this_instr_obj = ASSEMBLY_ARRAY[k]; 
        if(this_instr_obj.id >= this_range.start 
          && this_instr_obj.id <= this_range.end){
          // NOTE: Can convert the address from decimal back to hex here for display purposes
          this_node.children.push({"name": this_instr_obj.id + ": " + this_instr_obj.code});
        }
   }

  }


  return this_node;
}



var margin = {top: 30, right: 20, bottom: 30, left: 20};
var barHeight = 20;


var i = 0,
    duration = 400,
    root;

var tree = d3.layout.tree()
    .nodeSize([0, 20]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

// var diagonal = d3.linkHorizontal()
//     .x(function(d) { return d.y; })
//     .y(function(d) { return d.x; });

tree_data.x0 = 0;
tree_data.y0 = 0;
// update(root = tree_data);

// root = d3.hierarchy(tree_data);
// root.x0 = 0;
// root.y0 = 0;
// // update(root); 

var svg = d3.select("#assemblyContainer g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");;

// var c10 = d3.schemeCategory10;
// var c10 = d3.scale.category10();

// var f_src_file = document.getElementById('fi_src');
// var f_json_file = document.getElementById('fi_json');
// var f_dot_file = document.getElementById('fi_dot');

// var fr1 = new FileReader();
// var fr2 = new FileReader();
// var fr3 = new FileReader();

Split(['#left', '#middle' , '#right']);

// d3.select("#loadFile")
//   .on("click", function(){
//         loadFile();
//   });

d3.json(prefix + JSON_FILENAME, function(data) {
  
  JSON_DATA = data;
  console.log(JSON_DATA);

  d3.text(prefix + SRC_FILENAME, function(data){
  	SRC_DATA = data;
  	
  	SRC_CODE_ARRAY = SRC_DATA.split('\n');
  	
  	// console.log(SRC_DATA);
  	// console.log(SRC_CODE_ARRAY);

    d3.text(prefix + DOT_FILENAME_FULL, function(data){

      DOT_FULL_DATA = data;
      DOT_FULL_DATA = DOT_FULL_DATA.replace(/\\l/g, "\n");    


    	d3.text(prefix + DOT_FILENAME, function(data){
    		DOT_DATA = data;
    		DOT_DATA = DOT_DATA.replace(/\\l/g, "\n");

    		// console.log(DOT_DATA);

    		setupSource();
    		// setupAssembly();

        g_full = graphlibDot.parse(DOT_FULL_DATA);
        console.log(g_full);

        
        ASSEMBLY_ARRAY = getAssemblyInstrs();
        console.log(ASSEMBLY_ARRAY);

        tree_data = createInlineTree();
        console.log(tree_data);
    		
    		// update(root);
    		update(root=tree_data)

    		setupGraph();

      });

  	});

  });

});
 
function setupGraph(){
	g = graphlibDot.parse(DOT_DATA);
	// console.log(g);

	var svg = d3.select("#graphContainer");
    var inner = d3.select("#graphContainer g");

    // Render the graphlib object using d3.
    var renderer = new dagreD3.Renderer();
    // renderer.run(g, d3.select("#graphContainer g"));

    //Render the modified file (output from loopified code) i.e. the file with invisible edges, ports etc.
    renderer.run(g, d3.select("#graphContainer g"));

    // Optional - resize the SVG element based on the contents.
    var bbox = svg.node().getBBox();  // getBBox gives the bounding box of the enclosed 
                                      // elements. Its width and height can be set to a different value.

     fillNodesandEdges();

    var graph_svg_width = bbox.width;
    var initialScale = parseInt(svg.style("width"), 10) / graph_svg_width;
    
	 // Set up zoom support
    zoom = d3.behavior.zoom().on("zoom", function() {
      inner.attr("transform", "translate(" + d3.event.translate + ")" +
                                  "scale(" + d3.event.scale + ")");
    });
    
    svg.call(zoom).on("dblclick.zoom", null);
       

	zoom
      // .translate([0 , 20])
      .scale(initialScale)
      .event(svg);

     d3.selectAll("g.node.enter")
      .on("mouseover", function(){
  
      })
      .on("mouseout", function(){

      })
    // .call(drag);


}

function  fillNodesandEdges(){

	// compute the degrees of the node i.e. sum of indegrees or sum of outdegrees
    var re = /ct:(\d+)/i;
    var max_deg = 1, max_ct = 1;
    
    var graph_nodes = g.nodes();
    for(var i=0; i<graph_nodes.length; i++){
      var nodeId = graph_nodes[i];
      //Work with only the basic nodes not the function nodes
      if(g.children(nodeId).length == 0){
        //This is a basic node; Compute the degree
        var outEdges = g.outEdges(nodeId);
        var deg = 0;

        for(var j=0; j<outEdges.length; j++){
          // get the count from the edges and sum them 
          // store the degree in the graph's node object
          var label = g.edge(outEdges[j]).label;
          // Check if count is present  
          if(re.test(label)){
            var temp_ct = parseInt(label.match(re)[1]); 
            if(temp_ct > max_ct){
              max_ct = temp_ct;
            }
            deg += temp_ct;
          }
        }

        if(deg>max_deg){
          max_deg = deg;
        }
        g.node(nodeId)["degree"] = deg; 
      }
    }
    
    degreeScale = d3.scale.linear()
      .domain([0,Math.log10(max_deg)])
      .range(["#faf0e6", "#ff7f00"])
      .interpolate(d3.interpolateHcl);

    degreeBorderFillScale = d3.scale.linear()
      .domain([0,Math.log10(max_deg)])
      .range(["#f78a62", "#ad2e00"])
      .interpolate(d3.interpolateHcl);

    degreeBorderScale = d3.scale.linear()
      .domain([0,Math.log10(max_deg)])
      .range([3, 15]);

    var edgeCountScale = d3.scale.linear()
      .domain([0, Math.log10(max_ct)])
      .range([1.5, 6]);

    d3.selectAll("g.node.enter")
  		.each(function(d) { 
  			nodesAll[d] = d3.select(this);
        if(g.node(d).style=="dashed") {
            nodesAll[d].classed("dashed", true);
          }

          if("degree" in g.node(d)){
            var deg = g.node(d).degree;

            // Change this fill property to stroke property
            // nodesAll[d].select("rect").style("fill", degreeScale(Math.log10(deg)));

            // Change this stroke-width property to stroke property i.e. border fill instead of background fill
            nodesAll[d].select("rect").style("stroke-width", degreeBorderScale(Math.log10(deg)));

            // nodesAll[d].select("rect").style("stroke-width", 15);
            // nodesAll[d].select("rect").style("stroke", degreeBorderFillScale(Math.log10(deg)));

          }

  		 });	

  	// var def_stroke_width = parseFloat(d3.select("g.edgePath.enter").style("stroke-width"));

  	d3.selectAll("g.edgePath.enter")
  		.each(function(d){

  			if(!(g.hasEdge(d))){
          d3.select(this).remove(); 
          return;
        }

        edgesAll[d] = d3.select(this);

        if(g.edge(d).style=="dashed") {
            edgesAll[d].classed("dashed", true);
        }

        //Encode the edge count with edge width
        //get the edge count
        var label = g.edge(d).label;
          
        // Check if count is present  
        if(re.test(label)){
          var ct = parseInt(label.match(re)[1]);
          ct = Math.log10(ct);

          // if(ct<0) {ct = 0;}
          // ct = ct*def_stroke_width + def_stroke_width;
          // edgesAll[d].style("stroke-width", ct+"px");

          edgesAll[d].style("stroke-width", edgeCountScale(ct)+"px");

        }

  		});	

  	d3.selectAll("g.edgeLabel.enter")
  		.each(function(d){
        if(!(g.hasEdge(d))){
          d3.select(this).remove(); 
          return;
        }

  			edgeLabelsAll[d] = d3.select(this);
  		});	

}

function setupSource(){

	// function_color = {27: {name: "doloop", color:0}, 19: {name:"dosum", color:1},
	//  14: {name: "mult3", color:2}, 4: {name:"mult1", color:3}, 9: {name:"mult2", color:4}};

	function_color = {};

	d3.select("#text_src")
	  .selectAll("p")
	  .data(SRC_CODE_ARRAY)
	  .enter()
	  .append("p")
	  .text(function(d){
	    return d;
	  });

	hljs.initHighlightingOnLoad();

	d3.selectAll("#text_src p")
	  .each(function(d,i){
	      // {p:d3.select(this), start:this.offsetTop, end: this.offsetTop + this.clientHeight};
		if(i in function_color){
			d3.select(this).style("border-color", function(){return categ_color(function_color[i]['color'])})
			.style("border-width", "3px")
			.style("border-style", "solid");
			
		}
	  })
	  .on("mouseover", function(d){
	    
	  })
	  .on("mouseout", function(d){

	  })
	  .on("click", function(d){

	  });
	 

}

function setupAssembly()
{

	// var window_width = 600;
	// var window_height = 750;

	var window_width = d3.select("#middle").node().clientWidth;
	// var window_width = d3.select("#middle").node().getBoundingClientRect().width;
	var window_height = d3.select("#middle").node().clientHeight;
	// var window_height = d3.select("#middle").node().getBoundingClientRect().height;

	var indent_margin = 30;
	var indent_margin1 = 10;

	var code_domain = [704, 1039];
	var y_range = [0, window_height*1.3];
	
	var y_scale = d3.scaleLinear()
    .domain(code_domain)
    .range(y_range);

	
}

function categ_color(n) {
  var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colors[n % colors.length];
}

function update(source) {

	var width = d3.select("#middle").node().clientWidth;
	var barWidth = (width - margin.left - margin.right) * 0.8;

  // Compute the flattened node list.
  // var nodes = root.descendants();

  var nodes = tree.nodes(root);

  var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

  d3.select("#assemblyContainer").transition()
      .duration(duration)
      .style("height", height);

  d3.select(self.frameElement).transition()
      .duration(duration)
      .style("height", height + "px");

  // Compute the "layout". TODO https://github.com/d3/d3-hierarchy/issues/67
  // var index = -1;
  // root.eachBefore(function(n) {
  //   n.x = ++index * barHeight;
  //   n.y = n.depth * 20;
  // });

  // Compute the "layout".
  nodes.forEach(function(n, i) {
    n.x = i * barHeight;
  });

  // Update the nodes
  var node = svg.selectAll(".treeNode")
    .data(nodes, function(d) { return d.id || (d.id = ++i); });

  var nodeEnter = node.enter().append("g")
      .attr("class", "treeNode")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .style("opacity", 0);

  // Enter any new nodes at the parent's previous position.
  nodeEnter.append("rect")
      .attr("y", -barHeight / 2)
      .attr("height", barHeight)
      .attr("width", barWidth)
      .style("fill", color)
      .on("click", click);

  nodeEnter.append("text")
      .attr("dy", 3.5)
      .attr("dx", 5.5)
      .text(function(d) { return d.name; });

  // Transition nodes to their new position.
  nodeEnter.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1);

  node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
      .style("opacity", 1)
    .select("rect")
      .style("fill", color);

  // Transition exiting nodes to the parent's new position.
  node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .style("opacity", 0)
      .remove();

  // Update the links…
  // var link = svg.selectAll(".treeLink")
  //   .data(root.links(), function(d) { return d.target.id; });

  // Update the links…
  var link = svg.selectAll(".treeLink")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "treeLink")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  // root.each(function(d) {
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}

function color(d) {
  return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
}

  


  
