
var SRC_FILENAME = 'lulesh.cc';
var JSON_FILENAME = 'lulesh.o.json';
// var JSON_FILENAME = 'lulesh2.0.json';

var DOT_FILENAME = 'lulesh.o_small_nodes.dot';
var DOT_FILENAME_FULL = 'lulesh.o.dot';
// var DOT_FILENAME = 'lulesh2.0_small_nodes.dot';
// var DOT_FILENAME_FULL = 'lulesh2.0.dot';

var prefix = "/static/opt_vis/";

var signalType = {
  highlight: 'HIGHLIGHT',
  focus: 'FOCUS',
  focusOut: 'FOCUS_OUT',
  click: 'CLICK'
};

var dataTypes = {
 sourceCodeLine:'SOURCE_CODE_LINE', 
 assemblyInstr: 'ASSEMBLY_INSTR', 
 graphNode: 'GRAPH_NODE'
};

var tree_data = {};

var JSON_DATA = {};
var SRC_DATA = "";
var DOT_DATA = "";
var DOT_FULL_DATA = "";

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

var model, view_source, view_inline_tree, view_graph, controller;

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

var f_src_file = document.getElementById('fi_src');
var f_dot_file = document.getElementById('fi_dot');
var f_json_file = document.getElementById('fi_json');

var fr1 = new FileReader();
var fr2 = new FileReader();
var fr3 = new FileReader();

Split(['#highlightList', '#left', '#middle' , '#right']);

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

// Loads the files selected from the menu
function loadFile(){
	if(f_src_file.files[0] == undefined){
		alert("Please provide the source code file");
	}
	if(f_dot_file.files[0] == undefined){
		alert("Please provide the dot file");
	}
	if(f_json_file.files[0] == undefined){
		alert("Please provide the json analysis file");
	} 

	fr1.readAsText(f_json_file.files[0]);
    fr1.onloadend=function(){
      JSON_DATA = JSON.parse(this.result);
      
	// d3.json(prefix + JSON_FILENAME, function(data) {
	  // JSON_DATA = data;
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

	  /*
	  // convert the line numbers to 0-based index
	  for(var i=0; i<lines.length; i++){
	   lines[i].line = parseInt(lines[i].line) - 1;
	  }
	  */

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

	  fr2.readAsText(f_src_file.files[0]);
      fr2.onloadend=function(){
      	SRC_DATA = this.result;

	  // d3.text(prefix + SRC_FILENAME, function(data){
	  //   SRC_DATA = data;
	    
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

	    fr3.readAsText(f_dot_file.files[0]);
        fr3.onloadend=function(){
      	  DOT_FULL_DATA = this.result;

	    // d3.text(prefix + DOT_FILENAME_FULL, function(data){
	      // DOT_FULL_DATA = data;

	      DOT_FULL_DATA = DOT_FULL_DATA.replace(/\\l/g, "\n");    

	      // d3.text(prefix + DOT_FILENAME, function(data){
	      //   DOT_DATA = data;
	      //   DOT_DATA = DOT_DATA.replace(/\\l/g, "\n");

	        // console.log(DOT_DATA);

	        g_full = graphlibDot.parse(DOT_FULL_DATA);
	        console.log(g_full);

	        g = graphlibDot.parse(DOT_DATA);

	        /*** Graph shortening happens here

		    // Make the label of the graph the function name
		    var graph_nodes = g_full.nodes();

		    // Create a deep copy of the graph
		    graphNoLabel = 

		    for(var i = 0; i<graph_nodes.length; i++){
		    	graphNoLabel.node(graph_nodes[i]).label = blockName + ": " + getfunctionName();
		    }

		    **/ 

	        ASSEMBLY_ARRAY = getAssemblyInstrs();
	        console.log(ASSEMBLY_ARRAY);

	        // tree_data = createInlineTree();
	        // NOTE: Replacement for the complete inlining tree
	        tree_data = createLinearTree();

	        console.log(tree_data);
	        
	        model = makeModel();
	        view_source = makeSourceCodeView(model, 'text_src', 'left');
	        view_inline_tree = makeTreeListView(model, 'assemblyContainer', 'middle');
	        view_graph = makeCFGGraphView(model, 'graphContainer', 'right');
	        view_highlighted_items = makeHighlightedItemsView(model, 'highlightList');

	        controller = makeController(model);

	        // model.register(view_source.render);
	        model.register(view_source.highlight);
	        model.register(view_inline_tree.highlight);
	        model.register(view_graph.highlight);
	        model.register(view_highlighted_items.render);

	        view_source.register(controller.dispatch);
	        view_inline_tree.register(controller.dispatch);
	        view_graph.register(controller.dispatch);

	      };

	    };

	  };
    
    /*** Graph shortening happens here

    // Make the label of the graph the function name
    var graph_nodes = g_full.nodes();

    // Create a deep copy of the graph
    graphNoLabel = 

    for(var i = 0; i<graph_nodes.length; i++){
    	graphNoLabel.node(graph_nodes[i]).label = blockName + ": " + getfunctionName();
    }

    **/ 

}

/**** Editing starts here ****/

d3.json(prefix + JSON_FILENAME, function(data) {
  
  JSON_DATA = data;
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

  /*
  // convert the line numbers to 0-based index
  for(var i=0; i<lines.length; i++){
   lines[i].line = parseInt(lines[i].line) - 1;
  }
  */

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

  d3.text(prefix + SRC_FILENAME, function(data){
    SRC_DATA = data;
    
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

    d3.text(prefix + DOT_FILENAME_FULL, function(data){

      DOT_FULL_DATA = data;
      DOT_FULL_DATA = DOT_FULL_DATA.replace(/\\l/g, "\n");    


      d3.text(prefix + DOT_FILENAME, function(data){
        DOT_DATA = data;
        DOT_DATA = DOT_DATA.replace(/\\l/g, "\n");

        // console.log(DOT_DATA);

        g_full = graphlibDot.parse(DOT_FULL_DATA);
        console.log(g_full);

        g = graphlibDot.parse(DOT_DATA);

        ASSEMBLY_ARRAY = getAssemblyInstrs();
        console.log(ASSEMBLY_ARRAY);

        // tree_data = createInlineTree();
        // NOTE: Replacement for the complete inlining tree
        tree_data = createLinearTree();

        console.log(tree_data);
        
        model = makeModel();
        view_source = makeSourceCodeView(model, 'text_src', 'left');
        view_inline_tree = makeTreeListView(model, 'assemblyContainer', 'middle');
        view_graph = makeCFGGraphView(model, 'graphContainer', 'right');
        view_highlighted_items = makeHighlightedItemsView(model, 'highlightList');

        controller = makeController(model);

        // model.register(view_source.render);
        model.register(view_source.highlight);
        model.register(view_inline_tree.highlight);
        model.register(view_graph.highlight);
        model.register(view_highlighted_items.render);

        view_source.register(controller.dispatch);
        view_inline_tree.register(controller.dispatch);
        view_graph.register(controller.dispatch);

      });

    });

  });

});

/** Editing ends here **/


var makeSignaller = function(){
  var _subscribers = [];

  return {
    add: function(s){
      _subscribers.push(s);
    },

    notify: function(args) {
      for( var i = 0; i < _subscribers.length; i++){
        _subscribers[i](args);
      }
    }
  };

}

var makeModel = function() {

	// Our state is the values in the _dataStore array
	// and the highlight/unhighlight state

  var _dataStore = {
    assemblyArray: ASSEMBLY_ARRAY,
    graph: g_full,
    jsonData: JSON_DATA,
    sourceArray: SRC_CODE_ARRAY,
    nodesAll: nodesAll,
    edgesAll: edgesAll,
    edgeLabelsAll: edgeLabelsAll,
    inlineTree: tree_data,
    graphNoLabel: g,
    isTooltipEnabled: true 

  };

  

  // List of views that will listen for changes
  var _observers = makeSignaller();

  return {
    highlight: function(args){

      // This is the object that the event is executed on
    	var d = args.d;
      // This is the datatype of the object that the event is executed on
      var dataType = args.dataType;
      
      switch (dataType) {
      	case dataTypes.sourceCodeLine:

      		// Instead of the source code object, we use the index of the object in the array
      		// (or the line number)
      		d = args.i;

      		for(var i = 0; i < _dataStore.sourceArray.length; i++){
      			_dataStore.sourceArray[i].highlight = false;
      		}

      		_dataStore.sourceArray[d].highlight = true;

          // The list of assembly instructions that correspond to the 
          // given line of source code
      		var highlighted_assembly = getAssemblyFromSource(d, _dataStore);

      		// console.log(highlighted_assembly);

          // The list of graph nodes that correspond to the given line of source code
      		var highlighted_nodes = getNodesFromSource(d, _dataStore, highlighted_assembly);

      		// Reset the highlight of every items
      		
      		for(var i = 0; i < _dataStore.assemblyArray.length; i++){
      			_dataStore.assemblyArray[i].highlight = false;
      		}

      		for (var i = 0; i< highlighted_assembly.length; i++){
      			highlighted_assembly[i].highlight = true;
      		}

      		var graph_nodes = _dataStore.graphNoLabel.nodes();

      		// Reset the highlight of every items
      		for(var i = 0; i < graph_nodes.length; i++){
      			_dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
      		}

      		for (var i = 0; i< highlighted_nodes.length; i++){
      			_dataStore.graphNoLabel.node(highlighted_nodes[i]).highlight = true;
      		}

      		 

      	break;

      	case dataTypes.assemblyInstr:

      		d = _dataStore.assemblyArray[d.index];
          
          // TODO: This should be handled during the event handling
          // if(!d) {
          //   return;
          // }

      		for(var i=0; i < _dataStore.assemblyArray.length; i++){
      			_dataStore.assemblyArray[i].highlight = false;
      		}

          
      		d.highlight = true;

          // The list of source code lines that correspond to the 
          // given line of assembly code  
      		var highlighted_source = getSourceFromAssembly(d, _dataStore);
          // The list of graph nodes that correspond to the 
          // given line of assembly code
      		var highlighted_nodes = getNodesFromAssembly(d, _dataStore);

      		// Reset the highlight of every items
      		
      		for(var i = 0; i < _dataStore.sourceArray.length; i++){
      			_dataStore.sourceArray[i].highlight = false;
      		}

      		for (var i = 0; i< highlighted_source.length; i++){
      			highlighted_source[i].highlight = true;
      		}

      		var graph_nodes = _dataStore.graphNoLabel.nodes();

      		// Reset the highlight of every items
      		for(var i = 0; i < graph_nodes.length; i++){
      			_dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
      		}

      		for (var i = 0; i< highlighted_nodes.length; i++){
      			_dataStore.graphNoLabel.node(highlighted_nodes[i]).highlight = true;
      		}

      	break;

      	case dataTypes.graphNode:

      		var graph_nodes = _dataStore.graphNoLabel.nodes();

      		for(var i=0; i < graph_nodes.length; i++){
      			_dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
      		}

          _dataStore.graphNoLabel.node(d).highlight = true;

          
      		// The list of assembly code that correspond to the given graph node
          var highlighted_assembly = getAssemblyFromGraphNode(d, _dataStore);
          // The list of source code lines that correspond to the 
          // given graph node
          var highlighted_source = getSourceFromGraphNode(d, _dataStore, highlighted_assembly);
          // console.log(highlighted_source);

      		// Reset the highlight of every items
      		
      		for(var i = 0; i < _dataStore.sourceArray.length; i++){
      			_dataStore.sourceArray[i].highlight = false;
      		}

      		for (var i = 0; i< highlighted_source.length; i++){
      			highlighted_source[i].highlight = true;
      		}

      		// Reset the highlight of every items
      		for(var i = 0; i < _dataStore.assemblyArray.length; i++){
      			_dataStore.assemblyArray[i].highlight = false;
      		}

      		for (var i = 0; i< highlighted_assembly.length; i++){
      			highlighted_assembly[i].highlight = true;
      		}


      	break;

      	default:
      		return;
      		break;
      }
      	

      _observers.notify();
    },

    focus: function(args){

    	// TODO: Implement the focus logic here

      // _observers.notify();
    },

    focusOut: function(args){


      // TODO: Implement the focus out logic here	
      // _observers.notify();
    }, 

    click: function(args){

    	// TODO: Implement the click logic here
    	// _observers.notify();
    },

    get: function(key) {
      return _dataStore[key];
    },

    register: function(fxn) {
      _observers.add(fxn);
    }

  };

}

// Helper functions for fetching the corresponding items to highlight given 
// the dataType, itemId, and the data

// This function returns the list of assembly instructions that are corresponding to
// the source code item
// Return the list of objects instead of just the ids of the assembly instruction
// Params: d: is the lineNumber which is the same as the index of the line of source code
//          in the array sourceArray 
//         dataSource: stores all the data inside the model 

function getAssemblyFromSource(d, dataSource){
	
  if(!(dataSource.sourceArray[d].hasMatchingAssembly)){
    return [];
  }

  var from, to;
  var matchingAssemblies = [];

  var lines = dataSource.jsonData.lines;
  var assemblyArray = dataSource.assemblyArray;

	for(var i=0; i<lines.length; i++){

		if (lines[i].line == d){
			from = lines[i].from;
			to = lines[i].to;
		
      // TODO: Implement range search instead of looping through the array everytime
			for (var j=0; j<assemblyArray.length; j++){
				if(assemblyArray[j].id >= from && assemblyArray[j].id <= to){
					matchingAssemblies.push(assemblyArray[j]);
				}

			}
		}

    // Note: Early exit assuming the lines array is sorted on line number
    // if (lines[i].line > d){
    //   break;
    // }

	}

	return matchingAssemblies;

}

// This function returns a list of nodeIds in the CFG that correspond to the 
// given line of source code
// Instead of computing the matching assembly instructions again, 
// we pass the list of matching assembly instructions to this function.
// From the list of matching assembly instructions, we create a list of
// basic blocks that contain that instruction

function getNodesFromSource(d, dataSource, matchingAssemblies){

  if(!(dataSource.sourceArray[d].hasMatchingAssembly)){
    return [];
  }

	var matchingNodes = new Set();

	for(var i = 0; i < matchingAssemblies.length; i++){
		matchingNodes.add(matchingAssemblies[i].blockId);
	}

	return Array.from(matchingNodes);

}

// This function returns the list of source code lines that are corresponding to
// the assembly code
// Params: d: is the assembly code object 
//         dataSource: stores all the data inside the model 

// Instead of reimplementing this function, we call the function getSourceFromGraphNode
// which also takes an array of assembly instuctions and returns an array of
// source code objects

function getSourceFromAssembly(d, dataSource){
	return getSourceFromGraphNode(null, dataSource, [d]);
}

// This function returns a list of nodeIds in the CFG that correspond to the 
// given assembly instruction
// Params: d: is the assembly code object
//		   dataSource: stores all the data inside the model

function getNodesFromAssembly(d, dataSource){
	return [d.blockId];
}

// This function returns a list of source code lines that are corresponding to
// the graph node
// Params: d: is the nodeId of the graph node
//           dataSource: stores all the data inside the model
// Instead of computing the matching assembly instructions again, 
// we pass the list of matching assembly instructions to this function.
// From the list of matching assembly instructions, we create a list of
// source code lines that contain that instruction

function getSourceFromGraphNode(d, dataSource, matchingAssemblies){

  var matchingSrcLines = [];

  // Given the list of matching assemblies, find the corresponding lines of 
  // source code

  // Note: This function assumes that the matchingAssemblies are 
  // sorted on instruction address

  // The array linesAssembly is sorted on ascending order of "for" values i.e
  // the start of the assembly range that matches a source code line

  // Since both the linesAssembly and matchingAssemblies are sorted, we need to check the
  // elements in these array only once
  // If an instruction address is lower than the current range, then it is lower than all
  // the later ranges. Hence, we can skip this instruction address. There is no match.

  //If an instruction is in the current range, all the later instructions must be 
  // in the current range or the later ranges. Hence, if we handle an instruction correctly,
  // we do not need to go back to previous ranges for the later instructions.

  // If an instruction address is higher than the current range, then the 
  // instruction is higher than all the previous ranges. Hence, we do not need to 
  // go back to previous ranges for the later instructions.

  var linesAssembly = dataSource.jsonData.linesAssembly;
  
  var curr_line_index = 0;
  var from, to;
  var curr_line = linesAssembly[curr_line_index];
  from = curr_line.from;
  to = curr_line.to;

  for(var i = 0; i<matchingAssemblies.length; i++){
    
    //If the current instruction adress is less than the current range, then we can skip 
    // this instruction because there is no possible match with the later ranges
    if(matchingAssemblies[i].id < from){
      continue;
    }

    // If the current instruction address is greater than/equal to the start of this range, then
    // there is a possible match. Continue till all the ranges that are lower than this address
    // are consumed.
    while(to < matchingAssemblies[i].id){
      curr_line_index++;
      if(curr_line_index == linesAssembly.length){
        // We have reached the end of ranges. There are no more ranges to search.
        // All the later assembly instructions have no matches since this instruction
        // is higher than all the ranges.
        return matchingSrcLines;
      }

      curr_line = linesAssembly[curr_line_index];
      from = curr_line.from;
      to = curr_line.to;
    }

    // All the previous ranges are lower than this instruction address
    // This instruction is either inside this range
    // or lower than this range
    // Check if the instruction is inside this range

    if(matchingAssemblies[i].id >= from){
      // This instruction is inside this range.
      // We have found a matching source code line number
      matchingSrcLines.push(dataSource.sourceArray[curr_line.line]);
    }

  }

  return matchingSrcLines;

}

// This function returns the list of assembly instructions that are corresponding to
// the graph node
// Returns the list of objects instead of just the ids of the assembly instruction
// Params: d: is the nodeId of the graph node 
//         dataSource: stores all the data inside the model 

function getAssemblyFromGraphNode(d, dataSource){

  var matchingAssemblies = [];

  // NOTE: What if we precompute the assembly instruction list for all nodes and store it 
  // on the graph datastructure

  for(var i = 0; i<dataSource.assemblyArray.length; i++){
    if(dataSource.assemblyArray[i].blockId == d){
      matchingAssemblies.push(dataSource.assemblyArray[i]);
    }
  }

  return matchingAssemblies;

}

var makeController = function(model) {

  var _highlight = function(args){
    model.highlight(args);
  }

  var _focus = function (args) {
    model.focus(args);
  }

  var _focusOut = function (args) {
    model.focusOut(args);
  }

  var _click = function(args) {
    model.click(args);
  }

  return {

    dispatch: function(evt){
    
      switch(evt.type) {

        case signalType.highlight:
          _highlight(evt);
          break;

        case signalType.focus:
          _focus(evt);
          break;

        case signalType.focusOut:
          _focusOut(evt);
          break;

        case signalType.click:
          _click(evt);
          break;

        default:
          console.log('Unknown Event Type: ', evt);
      }
    }
  };

}

// This function creates the highlighted items view
var makeHighlightedItemsView = function(model, divId){
  var _observers = makeSignaller();

  //create the list of higlighted source code, assembly instructions, and graph nodes
  var sourceArray = model.get('sourceArray');
  var assemblyArray = model.get('assemblyArray');
  var graphNoLabel = model.get('graphNoLabel');
  
  var _render = function(){
  
    var highlighted_src = [];
    var highlighted_assembly = [];
    var highligted_graph_nodes = [];

    // Store the line breaks for source code / assembly instructions that are not consecutive
    var prev_index = -1;
    var tmp;

    for(var i =0; i<sourceArray.length; i++){
      if(sourceArray[i].highlight){
        tmp = {item: sourceArray[i], start: false};
        
        if (prev_index != i-1 && prev_index != -1){
          // The line break should be drawn before this item
          tmp.start = true;
        }
        highlighted_src.push(tmp);
        prev_index = i;
      }
    }

    // reset the previous index
    prev_index = -1;

    for(var i = 0; i<assemblyArray.length; i++){
      if(assemblyArray[i].highlight){
        tmp = {item: assemblyArray[i], start: false};
        
        if (prev_index != i-1 && prev_index != -1){
          // The line break should be drawn before this item
          tmp.start = true;
        }
        highlighted_assembly.push(tmp);
        prev_index = i;
      }
    }

    var graph_nodes = graphNoLabel.nodes();

    for(var i = 0; i<graph_nodes.length; i++){
      if(graphNoLabel.node(graph_nodes[i]).highlight){
        highligted_graph_nodes.push(graph_nodes[i]);
      }
    }

    var src_selection = d3.select("#text_highlight_src")
      .selectAll("p")
      .data(highlighted_src);
        // , function(d){return d.item.lineNum;});

    var assembly_selection = d3.select("#text_highlight_assembly")
      .selectAll("p")
      .data(highlighted_assembly);
        // , function(d){ return d.item.id;}); 

    var graphNode_selection = d3.select("#text_highlight_graph_nodes")
      .selectAll("p")
      .data(highligted_graph_nodes);
        // , function(d){return d;});

    src_selection.enter()
      .append("p")
      .text(function(d){return (d.item.lineNum + 1) + ": " + d.item.code;});

    src_selection.classed("start", function(d) {return d.start;});
    src_selection.exit().remove();

    assembly_selection.enter()
      .append("p")
      .text(function(d){return "0x" + d.item.id.toString(16) + ": " + d.item.code});

    assembly_selection.classed("start", function(d) {return d.start;});
    assembly_selection.exit().remove();

    graphNode_selection.enter()
      .append("p")
      .text(function(d){return d});

    graphNode_selection.exit().remove();
  }

  _render();

  return {
    render: function(){
       _render();
    },

    register: function(fxn){
      _observers.add(fxn);
    }
  };

}

// This function makes the collapsible tree view for the hierarchical representation
// of inlining information

var makeTreeListView = function(model, svgId, divId){

  var _observers = makeSignaller();

  var tree_data = model.get('inlineTree');
  var assemblyArray = model.get('assemblyArray');

  var _highlightEvent = function(d,i){
  	_observers.notify({
      type: signalType.highlight,
      dataType: dataTypes.assemblyInstr,
      d: d,
      i: i
    });
  };

  var _clickEvent = function(d,i) {
    _observers.notify({
      type: signalType.click,
      dataType: dataTypes.assemblyInstr,
      d: d,
      i: i
    });
  }

  var _fireFocusEvent = function(d, i) {
    _observers.notify({
      type: signalType.focus,
      dataType: dataTypes.assemblyInstr,
      d: d,
      i: i
    });

  };

  var _fireFocusOutEvent = function(d,i) {
    _observers.notify({
      type:signalType.focusOut,
      dataType: dataTypes.assemblyInstr,
      d: d,
      i: i
    });
  };

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

  model.get('inlineTree').x0 = 0;
  model.get('inlineTree').y0 = 0;
  // update(root = tree_data);

  // root = d3.hierarchy(tree_data);
  // root.x0 = 0;
  // root.y0 = 0;
  // // update(root); 

  var svg = d3.select("#" + svgId + " g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  function update(source) {

    var width = d3.select("#" + divId).node().clientWidth;
    var barWidth = (width - margin.left - margin.right) * 0.8;

    // Compute the flattened node list.
    // var nodes = root.descendants();

    var nodes = tree.nodes(root);

    var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

    d3.select("#" + svgId)
    // .transition()
        // .duration(duration)
        .style("height", height);

    d3.select(self.frameElement)
    // .transition()
        // .duration(duration)
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
    nodeEnter
    // .transition()
        // .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1);

    node
    // .transition()
        // .duration(duration)
        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .style("opacity", 1)
      .select("rect")
        .style("fill", color);

    // TODO: Update the highlighting of tree node using the node selection

    // Transition exiting nodes to the parent's new position.
    node.exit()
    // .transition()
        // .duration(duration)
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
      // .transition()
        // .duration(duration)
        .attr("d", diagonal);

    // Transition links to their new position.
    link
    // .transition()
        // .duration(duration)
        .attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit()
    // .transition()
        // .duration(duration)
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
  // Also handles the click event of the view
  function click(d, i) {
    
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    update(d);

    if(d.instrId){
      _highlightEvent(d,i);
    }
  }

  function color(d) {
    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }

  var _highlight = function(){
  	
    var found_highlight = false;

  	svg.selectAll(".treeNode")
  		.classed("highlight", function(d){
  			if(d.index){ 
          if(assemblyArray[d.index].highlight){
            if(!found_highlight){
              found_highlight = true;

              // console.log(this.getBoundingClientRect());
              scrollToElemTreeView(divId, this, margin.top, margin.left);
            }
          }

          return assemblyArray[d.index].highlight;
       }
  			return false;
  		});
  };

  update(root=tree_data);

  return {
    render: function(){
      update(root=tree_data);
      _highlight();
    },

    highlight: function(){
      _highlight();
    },

    register: function(fxn) {
      _observers.add(fxn);
    }

  };

};

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

// This function is a temporary replacement for the inlineTree
// Adds the assembly instructions in a linear order in the tree

function createLinearTree(){

  var tree_data;

  // Add a root node to this tree
  tree_data = {"name":"root", 
    "children": [] 
  };

  var this_instr_obj;

  for(var k = 0; k<ASSEMBLY_ARRAY.length; k++){
    this_instr_obj = ASSEMBLY_ARRAY[k];
    // convert the address from decimal back to hex here for display purposes
    tree_data.children.push({"name": "0x" + this_instr_obj.id.toString(16) + ": " + this_instr_obj.code , 
        "instrId":this_instr_obj.id, "index": k});  
  }
  return tree_data;

}

// This structure is used for collapsible tree widget that shows inlining structure
// The fields for each object are i) name: contains the name of the function
// ii) children: contains the array of objects within it (leaf nodes have no children)
// iii) id: the id of the instruction in the assembly array (only present on leaf nodes)
// iv) index: the index of the instruction in the assembly array (only present on leaf nodes)

// Aggregate the information from the dot file and the inlining information from json file
// Get the ranges from the inlining information and 
// fill the instructions from the dot file in these ranges

// TODO: Filter on the filename; check the "callsite_file" property for inlines object

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

// Binary search on an array of objects
// Note: The passed array must be sorted on key in ascending order
// Params: arr: the array to search for
//         key: the key to search on for the array of objects
//         val: the value to search for
// Returns the first found index of the value in the array
// Returns -1 if not found
function binarySearch(arr, key, l, r, val){

  // var l = 0;
  // var r = arr.length - 1;
  var m;

  while (l <= r) {
    m = l + Math.floor((r-1)/2);

    // check if val is present at mid 
    if(arr[m].key == val)
      return m;

    // if val is greater, ignore left half
    if (arr[m].key < val) {l = m + 1; }
    // else ignore right half
    else { r = m - 1; }

  } 

  // val not found in the array
  return -1;

}

// TODO: Handle duplicate basic blocks that are shared by multiple functions

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
          this_fn_treeview.children.push({"name": "0x" + this_instr_obj.id.toString(16) + ": " + this_instr_obj.code , 
          	"instrId":this_instr_obj.id, "index": k});
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
            this_fn_treeview.children.push({"name": "0x" + this_instr_obj.id.toString(16) + ": " + this_instr_obj.code , 
          	"instrId":this_instr_obj.id, "index": k});

          } else if(this_instr_obj.id >= curr_inline_start_addr
            && this_instr_obj.id <= curr_inline_range.end ){

            // This instruction is inside the inline block

            var this_inline_node = addRecursiveInline(this_inline);
            this_fn_treeview.children.push(this_inline_node);


          } else {
            // This instruction is after the inline range and outside it
            this_fn_treeview.children.push({"name": "0x" + this_instr_obj.id.toString(16) + ": " + this_instr_obj.code , 
          	"instrId":this_instr_obj.id, "index": k});

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
          // convert the address from decimal back to hex here for display purposes
          this_node.children.push({"name": "0x" + this_instr_obj.id.toString(16) + ": " + this_instr_obj.code, 
          	"instrId":this_instr_obj.id, "index": k});
        }
   }

  }


  return this_node;
}

// This function clears the given svg
// The input svg can be obtained as document.getElementById(svgId) 
// or d3.select('#' + svgId).node()
// or using the 'this' keyword inside the d3's event handlers or 'each' function call

function clearSVG(svg){
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
}
 
var makeCFGGraphView = function(model, svgId, divId) {

  var g = model.get('graphNoLabel');
  var g_full = model.get('graph');
  var _observers = makeSignaller();
  var svg;
  var inner;
  var zoom;

  var _highlightEvent = function(d,i){
    _observers.notify({
      type: signalType.highlight,
      dataType: dataTypes.graphNode,
      d: d,
      i: i
    });
  }

  var _clickEvent = function(d,i) {
    _observers.notify({
      type: signalType.click,
      dataType: dataTypes.graphNode,
      d: d,
      i: i
    });
  }

  var _fireFocusEvent = function(d, i) {
    _observers.notify({
      type: signalType.focus,
      dataType: dataTypes.graphNode,
      d: d,
      i: i
    });

  };

  var _fireFocusOutEvent = function(d,i) {
    _observers.notify({
      type:signalType.focusOut,
      dataType: dataTypes.graphNode,
      d: d,
      i: i
    });
  };

  var _render = function(){

    svg = d3.select('#' + svgId);
    inner = d3.select('#' + svgId + ' g');
    clearSVG(inner.node());

    // Render the graphlib object using d3.
    var renderer = new dagreD3.Renderer();
    // renderer.run(g, d3.select("#graphContainer g"));

    // Render the modified file (output from loopified code) i.e. 
    // the file with invisible edges, ports etc.
    renderer.run(g, d3.select('#' + svgId + ' g'));

    fillNodesandEdges(g, svgId);

    // Optional - resize the SVG element based on the contents.
    var bbox = svg.node().getBBox();  // getBBox gives the bounding box of the enclosed 
                                      // elements. Its width and height can be set to a different value.

    var graph_svg_width = bbox.width;
    var initialScale = parseInt(svg.style("width"), 10) / graph_svg_width;
    
    // Set up zoom support
    // TODO: Coordinate with the controller to implement this interaction

    zoom = d3.behavior.zoom().on("zoom", function() {
      inner.attr("transform", "translate(" + d3.event.translate + ")" +
                                  "scale(" + d3.event.scale + ")");
    });
    
    svg.call(zoom).on("dblclick.zoom", null);

    zoom
        // .translate([0 , 20])
        .scale(initialScale)
        .event(svg);

    // Setup event listeners    
    d3.selectAll("g.node.enter")
        .on("mouseover", function(d, i){
          _showTooltip(d, i, divId, this);
          _fireFocusEvent(d,i);

          
        })
        .on("mouseout", function(d, i){
          _hideTooltip();
          _fireFocusOutEvent(d,i);

        })
        .on("click", function(d, i){
          // _clickEvent(d,i);
          _highlightEvent(d,i);
        })
      

      // .call(drag);

  };

  var _highlight = function(){

    var graph_nodes = g.nodes();
    var found_highlight = false;

    // Note: Does caching this d3 selection and storing it in the view
    // make it faster?
    d3.selectAll("g.node.enter")
    	.data(graph_nodes, function(d){return d;})
    	.classed("highlight", function(d){
        if (g.node(d).highlight){
          if(!found_highlight) {
            found_highlight = true;
            _centerToNode(d3.select(this));
          }
        }
    		return g.node(d).highlight;
    	});

  };

  _render();

  var _showTooltip = function(d, i, divId, thisNode){

    if(model.get('isTooltipEnabled')){

      var rect = d3.select(thisNode).select("rect");

      //Get the mouse event's x/y values relative to the containing div
      var pos = [0,0];
      // pos = d3.mouse(d3.select("#" + divId).node());
      pos = d3.mouse(d3.select("body").node());
      var xPosition = pos[0]; 
      var yPosition = pos[1];

      var label = g_full.node(d).label;
      label = label.split("\\n");
      label = label.join("<br/>");

      var width = rect.node().getBBox().width;

      //Update the tooltip position and value
      d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px")
        .style("width", function(){ //return (width*1.25) + "px";
          return 300 + "px";
        })
        .select("#value")
        .node().innerHTML = label;
        // .text(text);

      //Show the tooltip
      d3.select("#tooltip").classed("hidden", false);
    }
  }

  var _hideTooltip = function(){
    //Hide the tooltip
    d3.select("#tooltip").classed("hidden", true);
  }

  var _centerToNode = function(node){

    var transform = d3.transform(inner.attr("transform"));
    var scale = transform.scale[0];
    var translateX = transform.translate[0];
    var translateY = transform.translate[1];

    var svgWidth = svg.node().clientWidth;
    var svgHeight = svg.node().clientHeight;

    var nodeTransform = d3.transform(node.attr("transform"));
    var nodetX = nodeTransform.translate[0];
    var nodetY = nodeTransform.translate[1];

    var rect = node.select("rect");
    nodetX += +rect.attr("x");
    nodetY += +rect.attr("y");

    nodetX *= -scale;
    nodetY *= -scale;

    nodetX += svgWidth/2.0;
    // nodetY += svgHeight/8.0;  // Shift it an eighth of the height down instead of half the height of panel
    nodetY += svgHeight/2.0;

    // inner.attr("transform", "translate("+ nodetX + "," + nodetY + ") scale(" + scale + ")");
    zoom
      .translate([nodetX , nodetY])
      .event(svg);

  }

  return {
    render: function(){
      
      _render();
      _highlight();

    },

    highlight: function(){
      
      _highlight();
      

    },

    register: function(fxn) {
      _observers.add(fxn);
    }

  };
}

// This function applies dashed style to nodes and edges if needed. 
// It encodes the node visit and edge visit using node borders
// and edge width. 
// It also populates the nodesAll, edgesAll, and edgeLabelsAll objects 
// that are part of the Model object.

function fillNodesandEdges(g, svgId) {

  // clear previous cached selections
  // TODO: Phase out the use of these data structures by using
  // d3's enter, update, exit pattern with keyed function

  nodesAll = {};
  edgesAll = {};
  edgeLabelsAll = {};

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
    
    var degreeScale = d3.scale.linear()
      .domain([0,Math.log10(max_deg)])
      .range(["#faf0e6", "#ff7f00"])
      .interpolate(d3.interpolateHcl);

    var degreeBorderFillScale = d3.scale.linear()
      .domain([0,Math.log10(max_deg)])
      .range(["#f78a62", "#ad2e00"])
      .interpolate(d3.interpolateHcl);

    var degreeBorderScale = d3.scale.linear()
      .domain([0,Math.log10(max_deg)])
      .range([3, 15]);

    var edgeCountScale = d3.scale.linear()
      .domain([0, Math.log10(max_ct)])
      .range([1.5, 6]);

    // TODO: Store the state of nodes and edges in the model 
    // i.e. i) isDashed ii) number of node visits and iii) number of edge visits 

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

var makeSourceCodeView = function(model, viewId, divId){

  var sourceArray = model.get('sourceArray');
  var _observers = makeSignaller();

  var _highlightEvent = function(d,i) {
    _observers.notify({
      type: signalType.highlight,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i
    });

  };  

  var _fireFocusEvent = function(d,i) {
    _observers.notify({
      type: signalType.focus,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i
    });

  };

  var _fireFocusOutEvent = function(d,i) {
    _observers.notify({
      type:signalType.focusOut,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i
    });
  };

  var _clickEvent = function(d,i){
    _observers.notify({
      type: signalType.click,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i
    })
  }

  // #text_src
  var _render = function(){

  	  var lines = d3.select("#" + viewId)
		// .html(null)  // clear the element
	    .selectAll("p")
	    .data(sourceArray);
  	  
	   lines.enter().append("p")
			.text(function(d, i){ return (i+1) + ": " + d.code; });

      lines.exit().remove();
		
		lines
        .classed("empty", function(d){ return !(d.hasMatchingAssembly);})
        .classed("highlight", function(d) {return d.highlight;})
		     .on("mouseover", function(d, i){
		      _fireFocusEvent(d,i);
		     })
		     .on("mouseout", function(d, i){
		      _fireFocusOutEvent(d,i);
		     })
		     .on("click", function(d, i){
		      // _clickEvent(d,i);
		      _highlightEvent(d,i);
		     });

	  hljs.initHighlightingOnLoad();
	    
  }

  var _highlight = function(){

    var found_highlight = false;

  	d3.selectAll("#" + viewId + " p")
  		.data(sourceArray)
  		.classed("highlight", function(d) {
        if(d.highlight){
          if(!found_highlight){
            found_highlight = true;
            scrollToElement(divId, this);
          }
        }
       return d.highlight;});

  };

  _render();

  return {
    render: function(){
      _render();
      _highlight();
    },

    highlight: function(){
      _highlight();	
    },

    register: function(fxn) {
      _observers.add(fxn);
    }

  };

}

function categ_color(n) {
  var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", 
  "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", 
  "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colors[n % colors.length];
}

// This function scrolls the container to the position of the given element
// Params: containerId: id of the containing element (e.g. top-level panel)
//         node: the html node of the element we are scrolling to
function scrollToElement(containerId, node){
  d3.select("#" + containerId).node().scrollTop = node.offsetTop - 8;
}

// This function scrolls the container to the position of the given element
// in the treeView
// Params: containerId: id of the containing element (e.g. top-level panel)
//         node: the html node of the element we are scrolling to
function scrollToElemTreeView(containerId, node, marginTop, marginLeft){
  var transform = d3.transform(d3.select(node).attr("transform"));
  // var translateX = transform.translate[0];
  var translateY = transform.translate[1];
  d3.select("#" + containerId).node().scrollTop = marginTop + translateY - 12;
}
