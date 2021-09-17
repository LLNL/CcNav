var signalType = {
  highlight: 'HIGHLIGHT',
  focus: 'FOCUS',
  focusOut: 'FOCUS_OUT',
  click: 'CLICK',
  change: 'CHANGE',
  add: 'ADD',
  mouseup: 'MOUSEUP',
  brushEndEvent: 'BRUSHEND'
};

var dataTypes = {
 sourceCodeLine:'SOURCE_CODE_LINE', 
 assemblyInstr: 'ASSEMBLY_INSTR', 
 graphNode: 'GRAPH_NODE',
 registerName: 'REGISTER_NAME',
 varName: 'VAR_NAME',
 callGraphNode: 'CALLGRAPH_NODE',
 loopTreeNode: 'LOOPTREE_NODE',
 fnTreeNode: 'FNTREE_NODE'
};

var viewTypes = {
  viewVarRenamer: 'VAR_RENAMER_VIEW',
  viewDisassembly: 'DISASSEMBLY_VIEW',
  viewCallGraph: 'CALLGRAPH_VIEW',
  viewSrc: 'SRC_VIEW',
  viewCFG: 'CFG_VIEW' 
};

var strTypes = {
	function: "function",
	loop: "loop",
	inline: "inline"
};

const IntervalTree = window["@flatten-js/interval-tree"].default;

// function AddrRange(start, end){
//   this.start = start;
//   this.end = end;
// }

var makeSignaller = function(){
  var _subscribers = [];
  var _taggedSubscribers = [];

  return {
    add: function(s){
      _subscribers.push(s);
    },

    addWithTag: function(s,tag){
      _taggedSubscribers.push({s:s, tag:tag});
    },

    notify: function(args) {
      for( var i = 0; i < _subscribers.length; i++){
        _subscribers[i](args);
      }
    },

    notifyWithTag: function(tag, args){
      for(var i=0; i < _taggedSubscribers.length; i++){
        if(_taggedSubscribers[i].tag == tag){
          _taggedSubscribers[i].s(args);
        }
      }
    }

  };

};

// Helper functions for fetching the corresponding items to highlight given 
// the dataType, itemId, and the data

// This function returns the list of assembly instructions that are corresponding to
// the source code item
// Returns the list of objects instead of just the ids of the assembly instruction
// Params: d: is the index of the line (i.e. linenumber; linenumber starts from 0)
// 			of source code in the array sourceArray 
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

// Returns the function name given the label of the basic block (i.e. node) of a CFG
function getFunctionFromLabel(label){
  var instrs = label.split('\\n',2);
  var fn_name = instrs[0];
  return fn_name;
};

// This function returns the list of assembly instructions that are corresponding to
// the source code line indices
// Returns the list of objects instead of just the ids of the assembly instruction
// Params: currStart: is the starting index of the source code line (i.e. linenumber, linenumber starts
// 				from 0) in the array sourceArray 
//		   currEnd: is the ending index of the source code line
//         dataSource: stores all the data inside the model 

function getAssemblyFromSourceLines(currStart, currEnd, dataSource){
	
  var from, to;
  var matchingAssemblies = new Set();

  var lines = dataSource.jsonData.lines;
  var assemblyArray = dataSource.assemblyArray;

	for(var i=0; i<lines.length; i++){

		if (lines[i].line >= currStart && lines[i].line <= currEnd){
			from = lines[i].from;
			to = lines[i].to;
		
      // TODO: Implement range search instead of looping through the array everytime
			for (var j=0; j<assemblyArray.length; j++){
				if(assemblyArray[j].id >= from && assemblyArray[j].id <= to){
					matchingAssemblies.add(assemblyArray[j]);
				}

			}
		}

    // Note: Early exit assuming the lines array is sorted on line number
    // if (lines[i].line > d){
    //   break;
    // }

	}
	return Array.from(matchingAssemblies);

}

// This function returns a list of nodeIds in the CFG that correspond to the 
// given lines of source code
// Instead of computing the matching assembly instructions again, 
// we pass the list of matching assembly instructions to this function.
// From the list of matching assembly instructions, we create a list of
// basic blocks that contain that instruction

function getNodesFromSourceLines(currStart, currEnd, dataSource, matchingAssemblies){

	var matchingNodes = new Set();

	for(var i = 0; i < matchingAssemblies.length; i++){
		matchingNodes.add(matchingAssemblies[i].blockId);
	}

	return Array.from(matchingNodes);	

}

// This function returns the list of source code lines that are corresponding to
// the assembly code
// Params: start_index: is the start index in the assembly array
//         end_index: is the end index in the assembly array
//         dataSource: stores all the data inside the model 

// Instead of reimplementing this function, we call the function getSourceFromGraphNodes
// which also takes an array of assembly instuctions and returns an array of
// source code objects

function getSourceFromAssemblyLines(start_index, end_index, dataSource){
  var assemblyInput = [];
  for(var i=start_index; i<= end_index; i++){
    assemblyInput.push(dataSource.assemblyArray[i]);
  }
  return getSourceFromGraphNode(null, dataSource, assemblyInput);
}

// This function returns a list of nodeIds in the CFG that correspond to the 
// given assembly instruction
// Params: start_index: is the start index in the assembly array
//         end_index: is the end index in the assembly array  
//       dataSource: stores all the data inside the model
function getNodesFromAssemblyLines(start_index, end_index, dataSource){
  var nodeList = new Set();
  for(var i=start_index; i<=end_index; i++){
    nodeList.add(dataSource.assemblyArray[i].blockId);
  }
  return Array.from(nodeList);

}

// This function returns the list of assembly instructions that are corresponding to
// the graph node
// Returns the list of objects instead of just the ids of the assembly instruction
// Params: nodeList: is the array of nodeIds of the graph 
//         dataSource: stores all the data inside the model 
function getAssemblyFromGraphNodeList(nodeList, dataSource){

  var matchingAssemblies = [];

  // NOTE: What if we precompute the assembly instruction list for all nodes and store it 
  // on the graph datastructure

  for(var i = 0; i<dataSource.assemblyArray.length; i++){
    if(nodeList.includes(dataSource.assemblyArray[i].blockId)){
      matchingAssemblies.push(dataSource.assemblyArray[i]);
    }
  }

  return matchingAssemblies;

}

// This function returns a list of source code lines that are corresponding to
// the graph node list
// Params: nodeList: is the array of nodeIds of the graph
//           dataSource: stores all the data inside the model
// Instead of computing the matching assembly instructions again, 
// we pass the list of matching assembly instructions to this function.
// From the list of matching assembly instructions, we create a list of
// source code lines that contain that instruction
function getSourceFromGraphNodeList(nodeList, dataSource, matchingAssemblies){
  return getSourceFromGraphNode(nodeList, dataSource, matchingAssemblies);
}

// This function returns the filtered graph from the full graph given the set of nodes to filter on.
// Uses BFS to retrieve the K-hop graph 
// Params:
//  full_graph: the full graph to filter on
//  setOfNodes: the set of nodes to filter on
//  numHops: number of hops (K)
// Returns: a new graph with only the filtered nodes and edges

function getKHopGraph(full_graph, setOfNodes, numHops, maxNodes){

  // Perform BFS in the full_graph starting with the input set of nodes in the queue
  // If any edge not in the new graph, store the edge in the new graph
  
  // console.log("Inside khop graph");
  // console.log(setOfNodes);
  // console.log(numHops);

  var visited = {};

  var queue0 = [];
  var queue1 = [];
  var queues = [queue0, queue1];
  var thisQueue;
  var nextQueue;

  var ctNodes=0;
  
  // var graphToReturn = new graphlib.Graph();
  var graphToReturn = graphlibDot.parse("digraph {}");
   
  for (var i=0; i<setOfNodes.length; i++){
    visited[setOfNodes[i]] = true;
    queues[0].push(setOfNodes[i]);
    graphToReturn.addNode(setOfNodes[i], full_graph.node(setOfNodes[i]));
    ctNodes++;
  }

  // add all edges in the subgraph. Level 0 has all the nodes and 
  // edges in the subgraph
  addSubgraphEdges(full_graph, graphToReturn);

  if(ctNodes >= maxNodes){
    return graphToReturn;
  }

  for(var thisLevel = 0; thisLevel < numHops; thisLevel++){
    
    // console.log("This level " + thisLevel );

    thisQueue = queues[thisLevel%2];
    nextQueue = queues[(thisLevel+1)%2];
    
    // clear the array while not affecting the reference
    nextQueue.length = 0;

    // console.log("This Queue");
    // console.log(thisQueue.join(" "));
    
    while (thisQueue.length > 0){
      var this_node = thisQueue.shift();
      
      // var adj_nodes = full_graph.successors(this_node);
      // Undirected k-hop search
      var adj_nodes = full_graph.neighbors(this_node);
      
      var out_edges = full_graph.outEdges(this_node);
      var in_edges = full_graph.inEdges(this_node);

      // concatenate the two edge lists
      var node_edges = out_edges.concat(in_edges);
    
      for(var i = 0; i<node_edges.length; i++){
        var this_edge = full_graph._strictGetEdge(node_edges[i]);

        if(!graphToReturn.hasNode(this_edge.u)){
          graphToReturn.addNode(this_edge.u, full_graph.node(this_edge.u));
          ctNodes++;

        }

        if(!graphToReturn.hasNode(this_edge.v)){
          graphToReturn.addNode(this_edge.v, full_graph.node(this_edge.v));
          ctNodes++;
        }

        if(!graphToReturn.hasEdge(node_edges[i])){
          graphToReturn.addEdge(this_edge.id, this_edge.u, this_edge.v, full_graph.edge(this_edge.id));
        }

        // if(ctNodes >= maxNodes){
        //   return graphToReturn;
        // }

      }

      for(var i=0; i<adj_nodes.length; i++){
        if(!visited[adj_nodes[i]]){
          visited[adj_nodes[i]] = true;
          nextQueue.push(adj_nodes[i]);

          // This is already added when adding the edge
          // graphToReturn.addNode(adj_nodes[i], full_graph.node(adj_nodes[i]));
          
        }
      }

    }

    if(ctNodes >= maxNodes){
      // add the remaining edges for the current subgraph
      addSubgraphEdges(full_graph, graphToReturn);
      return graphToReturn;
    } 

  }

  // console.log(queues);
  // add the remaining edges for the current subgraph
  addSubgraphEdges(full_graph, graphToReturn);
  return graphToReturn;

}

// This function adds the full edges to the subgraph formed by nodes
// in the input graph
// Params:
//  full_graph: the full graph to add from
//  input_graph: the graph to add the edges to

function addSubgraphEdges(full_graph, input_graph){

	var nodes = input_graph.nodes();

  // go through all nodes in the subgraph
  for(var i=0; i<nodes.length; i++){
  	// go through all the edges of the node
  	var inEdges = full_graph.inEdges(nodes[i]);
  	var outEdges = full_graph.outEdges(nodes[i]);
  	var nodeEdges = inEdges.concat(outEdges);

  	for(var j=0; j<nodeEdges.length; j++){
  		var this_edge = full_graph._strictGetEdge(nodeEdges[j]);
  		// Does this edge have both incident nodes inside the input graph
  		if(input_graph.hasNode(this_edge.u) &&
  			input_graph.hasNode(this_edge.v)){
  			// add this edge if not already in the input graph
  			if(!input_graph.hasEdge(this_edge.id)){
  				input_graph.addEdge(this_edge.id, this_edge.u, this_edge.v,
  					full_graph.edge(this_edge.id));
  			}
  		}
  	}

  }
}

// This function returns the filtered graph from the full graph given the set of nodes to filter on.
// Uses BFS to retrieve the K-hop graph 
// Params:
//  full_graph: the full graph to filter on
//  setOfNodes: the set of nodes to filter on
//  numHops: number of hops (K)
//  direction: "up", "down", or "both"
//    "up" - hops only on predecessors
//    "down" - hops only on successors
//    "both" - hops on both direction
// Returns: a new graph with only the filtered nodes and edges

function getKHopGraphDirected(full_graph, setOfNodes, numHops, maxNodes, direction){

  // Perform BFS in the full_graph starting with the input set of nodes in the queue
  // If any edge not in the new graph, store the edge in the new graph

  // console.log("Inside khop graph");
  // console.log(setOfNodes);
  // console.log(numHops);

  var visited = {};

  var queue0 = [];
  var queue1 = [];
  var queues = [queue0, queue1];
  var thisQueue;
  var nextQueue;

  var ctNodes=0;

  // var graphToReturn = new graphlib.Graph();
  var graphToReturn = graphlibDot.parse("digraph {}");

  for (var i=0; i<setOfNodes.length; i++){
    visited[setOfNodes[i]] = true;
    queues[0].push(setOfNodes[i]);
    graphToReturn.addNode(setOfNodes[i], full_graph.node(setOfNodes[i]));
    ctNodes++;
  }

  // add all edges in the subgraph. Level 0 has all the nodes and 
  // edges in the subgraph
  addSubgraphEdges(full_graph, graphToReturn);

  if(ctNodes >= maxNodes){
    return graphToReturn;
  }

  for(var thisLevel = 0; thisLevel < numHops; thisLevel++){

    // console.log("This level " + thisLevel );

    thisQueue = queues[thisLevel%2];
    nextQueue = queues[(thisLevel+1)%2];

    // clear the array while not affecting the reference
    nextQueue.length = 0;

    // console.log("This Queue");
    // console.log(thisQueue.join(" "));

    while (thisQueue.length > 0){
      var this_node = thisQueue.shift();

      // var adj_nodes = full_graph.successors(this_node);
      // Undirected k-hop search
      // var adj_nodes = full_graph.neighbors(this_node);

      var adj_nodes = [];
      var in_nodes = full_graph.predecessors(this_node);
      var out_nodes = full_graph.successors(this_node);

      var out_edges = full_graph.outEdges(this_node);
      var in_edges = full_graph.inEdges(this_node);

      var node_edges = [];

      if(direction == "up"){

        node_edges = in_edges;
        adj_nodes = in_nodes;

      } else if (direction == "down"){

        node_edges = out_edges;
        adj_nodes = out_nodes;

      } else if(direction == "both"){

        // concatenate the two edge lists
        node_edges = out_edges.concat(in_edges);
        adj_nodes = out_nodes.concat(in_nodes);

      }

      for(var i = 0; i<node_edges.length; i++){
        var this_edge = full_graph._strictGetEdge(node_edges[i]);

        if(!graphToReturn.hasNode(this_edge.u)){
          graphToReturn.addNode(this_edge.u, full_graph.node(this_edge.u));
          ctNodes++;

        }

        if(!graphToReturn.hasNode(this_edge.v)){
          graphToReturn.addNode(this_edge.v, full_graph.node(this_edge.v));
          ctNodes++;
        }

        if(!graphToReturn.hasEdge(node_edges[i])){
          graphToReturn.addEdge(this_edge.id, this_edge.u, this_edge.v, full_graph.edge(this_edge.id));
        }

        // if(ctNodes >= maxNodes){
        //   return graphToReturn;
        // }

      }

      for(var i=0; i<adj_nodes.length; i++){
        if(!visited[adj_nodes[i]]){
          visited[adj_nodes[i]] = true;
          nextQueue.push(adj_nodes[i]);

          // This is already added when adding the edge
          // graphToReturn.addNode(adj_nodes[i], full_graph.node(adj_nodes[i]));

        }
      }

    }

    if(ctNodes >= maxNodes){
      // add the remaining edges for the current subgraph
      addSubgraphEdges(full_graph, graphToReturn);
      return graphToReturn;
    } 

  }

  // console.log(queues);
  // add the remaining edges for the current subgraph
  addSubgraphEdges(full_graph, graphToReturn);
  return graphToReturn;

}

// This function gets the basicblocks from the functions in the json file
// The basicblocks contain the id and the start and end address along with a set of flags
// The flags are one of these ['vector', 'memread', 'memwrite', 'call', 'syscall', 'fp']
// Returns a bblocks object where keys are the ids of the blocks
function getBBsFromFns(dataSource){

  // get bblocks from functions
  // var bblocks = [];
  var bblocks = {};

  var functions = dataSource.jsonData.functions;

  for(var i=0; i<functions.length; i++){
    var thisBBlocks = functions[i]["basicblocks"];
    for(var j=0; j<thisBBlocks.length; j++){
      thisBBlocks[j]["function"] = functions[i]["name"];
      // bblocks.push(thisBBlocks[j]);
      bblocks[thisBBlocks[j].id] = thisBBlocks[j];
    }
  }
  
  // sort the bblocks on the id

  // bblocks.sort(function(a, b) {
  //     return a.id - b.id;
  //   });

  return bblocks;

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
    m = Math.floor((l+r)/2);

    // check if val is present at mid 
    if(arr[m][key] === val)
      return m;

    // if val is greater, ignore left half
    if (arr[m][key] < val) {l = m + 1; }
    // else ignore right half
    else { r = m - 1; }

  } 

  // val not found in the array
  return -1;

}

// NOTE: The address ranges are in the form of [start, end) where
// The range is closed on the start and open on the end address
// The interval tree uses closed intervals. Store the range as [start, end-1]

// This function creates an interval tree for loops and functions
// Params:
		// model: the model object
		// loopFnList: Array of loops and function nodes. The object is computed using 
			// d3 tree layout. Contains the original object in the "ref" field. 
			// Also conatins the "depth", "parent", "children", "id", and "type" field
// Returns an interval tree for loops and functions
function createLoopFnIntervalTree(model, loopFnList){



	var intervalTree = new IntervalTree();

	// From the node list, we extract the intervals for each node
	// Every interval will have the reference to the node as well
	// Add it to the interval tree
	
	for(var i = 0; i<loopFnList.length; i++){
		var thisNode = loopFnList[i];
		if(thisNode.type == "root"){
			continue;
		}
		if(thisNode.type == strTypes.function){

			// get the intervals from the function
			var thisObj = thisNode.ref;
			var bbs = thisObj.basicblocks;

			for(var j=0; j<bbs.length; j++){
				var thisBB = bbs[j];
				var thisIntvl = {"interval": [thisBB.start, thisBB.end - 1], "val": 
					{"parentNode": thisNode, "obj": thisBB}};
				intervalTree.insert(thisIntvl.interval, thisIntvl.val);
			}

		}	else if (thisNode.type==strTypes.loop){

      

			// get the intervals from the loop
			var thisObj = thisNode.ref;
			var bbs = thisObj.blocks;

			var allBblocks = model.get("bblocks");
			for(var j=0; j<bbs.length; j++){
				var thisBB = allBblocks[bbs[j]];
				var thisIntvl = {"interval": [thisBB.start, thisBB.end - 1], 
					"val": {"parentNode": thisNode, "obj": thisBB}};
				intervalTree.insert(thisIntvl.interval, thisIntvl.val);
			}
			
		}
	}
	return intervalTree;
}

// NOTE: The address ranges are in the form of [start, end) where
// The range is closed on the start and open on the end address
// The interval tree uses closed intervals. Store the range as [start, end-1]

// This function creates an interval tree for functions and inlines
// Params:
	// model: the model object
	// fnInlineList: Array of functions and inline nodes. The object is computed using 
		// d3 tree layout. Contains the original object in the "ref" field.
		// Also conatins the "depth", "parent", "children", "id" and "type" field 
// Returns an interval tree for the functions and inlines 
function createFnInlineIntervalTree(model, fnInlineList){

	var intervalTree = new IntervalTree();

	// From the node list, we extract the intervals for each node
	// Every interval will have the reference to the node as well
	// Add it to the interval tree
	for(var i = 0; i<fnInlineList.length; i++){
		var thisNode = fnInlineList[i];
		if(thisNode.type == "root"){
			continue;
		}
		var thisObj = thisNode.ref;
		var ranges;
		if(thisNode.type == strTypes.function){
			ranges = thisObj.basicblocks;
		}	else if (thisNode.type==strTypes.inline){
			ranges = thisObj.ranges;
		}		

		for(var j=0; j<ranges.length; j++){
			var thisRng = ranges[j];
			var thisIntvl = {"interval": [thisRng.start, thisRng.end - 1], "val": 
				{"parentNode": thisNode, "obj": thisRng}};
			intervalTree.insert(thisIntvl.interval, thisIntvl.val);
		}
	}
	return intervalTree;
}

// NOTE: The address ranges are in the form of [start, end) where
// The range is closed on the start and open on the end address
// The interval tree uses closed intervals. Store the range as [start, end-1]

// This function creates an interval tree for source code lines
// Params:
//    lines: Array of mapping from lines to address ranges
//            (single line can have multiple mappings)
// Returns an interval tree for source to binary mapping
function createSourceIntervalTree(lines){

  var intervalTree = new IntervalTree();
  for(var i=0; i<lines.length; i++){
    intervalTree.insert([lines[i].from, lines[i].to - 1], lines[i]);
  }
  return intervalTree;

}

// NOTE: The address ranges are in the form of [start, end) where
// The range is closed on the start and open on the end address
// The interval tree uses closed intervals. Store the range as [start, end-1]

// This function creates an interval tree for basic blocks
// Params:
//    lines: Array of basic blocks
// Returns an interval tree for basic blocks
function createBBIntervalTree(bblocks){

  var intervalTree = new IntervalTree();
  Object.values(bblocks).forEach(value => {
    intervalTree.insert([value.start, value.end - 1], value);
  });
  return intervalTree;
}


// This function updates data associated with all the data structures in the model
//  based on the selected address ranges
function updateAllData(dataSource, selectedAddrRanges){
    updateSourceLines(dataSource, selectedAddrRanges);
    updateDisassemblyLines(dataSource, selectedAddrRanges);
    updateCFG(dataSource, selectedAddrRanges);
    updateFnsandCallGraph(dataSource, selectedAddrRanges);
    updateLoops(dataSource, selectedAddrRanges);
}

// This function updates the data Structure for the source code
function updateSourceLines(dataSource, selectedAddrRanges){
  var lineNums = getSourceLinesFromAddrRanges(dataSource, selectedAddrRanges);
 
  for(var i = 0; i<dataSource.sourceArray.length; i++){
    dataSource.sourceArray[i].highlight = false;
  }

  for(var i=0; i<lineNums.length; i++){
    if(dataSource.sourceArray[lineNums[i]]){
      dataSource.sourceArray[lineNums[i]].highlight = true; 
    }
  }

}

// This function updates the data Structure for the disassembly code
function updateDisassemblyLines(dataSource, selectedAddrRanges){

  for(var i=0; i<dataSource.assemblyArray.length; i++){
    dataSource.assemblyArray[i].highlight = false; 
  }

  // For all the address ranges, get the index of the starting address
  // Loop till we encounter the ending address
  for(var i=0; i<selectedAddrRanges.length; i++){
    var thisRng = selectedAddrRanges[i];
    var index = binarySearch(dataSource.assemblyArray, "id",  0, dataSource.assemblyArray.length-1, thisRng[0]);

    // TODO: Make this binary search nearest search instead of exact search
    // assert(index != -1, "Starting address for this range does not match any instruction address");
    if(index == -1){
    	for(var j=0; j<dataSource.assemblyArray.length; j++){
    		if(dataSource.assemblyArray[j].id >= thisRng[0] && dataSource.assemblyArray[j].id <= thisRng[1]){
    			dataSource.assemblyArray[j].highlight = true;
    		}
    	}
    	continue;
    }

    while(index<dataSource.assemblyArray.length && dataSource.assemblyArray[index].id <= thisRng[1]){
      dataSource.assemblyArray[index].highlight = true;
      index++;
    }
 
  }

}

// This function updates the data Structure for the CFG
function updateCFG(dataSource, selectedAddrRanges){

  var bblocks = getBBlocksFromAddrRanges(dataSource, selectedAddrRanges);

  var bbIds = dataSource.graphNoLabel.nodes();

  for(var i=0; i<bbIds.length; i++){

      var bid = bbIds[i];
      dataSource.graphNoLabel.node( bid ).highlight = false;
      g.node(bid).highlight = false;
  }

  for(var i=0; i<bblocks.length; i++){

      var bid2 = "B" + bblocks[i].id;
      dataSource.graphNoLabel.node( bid2 ).highlight = true;
      g.node( bid2 ).highlight = true;
  }

}

// This function updates the data Structure for the call graph and function/inlines
function updateFnsandCallGraph(dataSource, selectedAddrRanges){

  var result = getFnsFromAddrRanges(dataSource, selectedAddrRanges);
  var fnNames = result["names"];

  // console.log(result);

  dataSource.filteredfnInlineTree = result["root"];

  var cgNodes = dataSource.callGraph.nodes();
  for(var i=0; i<cgNodes.length; i++){
    dataSource.callGraph.node(cgNodes[i]).highlight = false;
  }

  for(var i=0; i<fnNames.length; i++){
    if(dataSource.callGraph.hasNode(fnNames[i])){
      dataSource.callGraph.node(fnNames[i]).highlight = true;
    }
  }

}

// This function updates the data Structure for the loops
function updateLoops(dataSource, selectedAddrRanges){

  dataSource.filteredloopFnTree = getLoopsFromAddrRanges(dataSource, selectedAddrRanges);

}

// This function returns the matched functions as an array of tree nodes
// Get the leaves from the tree
function getCurrFunctions(dataSource, returnLeaves){
  var fnList;
  var fnTree = dataSource.filteredfnInlineTree;
  if(returnLeaves){
    fnList = getLeaves(fnTree);
  } else {
    fnList = d3.layout.tree().nodeSize([0, 20]).nodes(fnTree);
  }
  return fnList;
}

// This function handles the highlight function and range selection
function handleHighlightandRange(args, isRange, _dataStore, _observers){

    switch(args.dataType){
      case dataTypes.sourceCodeLine:

      	var start, end;
        var arr = [];
        if(isRange){
          var selectionObj = args.selectionObj;
          start = selectionObj.currStart;
          end = selectionObj.currEnd;

          var hasMatchingAssembly = false;
          for(var i=start; i<=end; i++){
            // check if any of the lines have a matching assembly 
            // If none of them have, then perform no action
            if(_dataStore.sourceArray[i].hasMatchingAssembly){  
              arr.push(i);
            }
          }
          // empty array; no lines have matching assembly
          if(arr.length == 0){
            return;
          }

        } else {

          // Check if there is a matching assembly to the source code
          // If not perform no action
          if(!(_dataStore.sourceArray[args.i].hasMatchingAssembly)){
            return;
          }
          arr.push(args.i);
        }

        var selectedAddrRanges = getAddrRangesFromSrcLines(_dataStore, arr);
        _dataStore.selectedAddrRanges = selectedAddrRanges;

        clearAllSelected(_dataStore);
        if(isRange){
          setSelectedSrc(_dataStore, [start, end]);
        }
        updateAllData(_dataStore, selectedAddrRanges);
        _observers.notify();

        break;
      case dataTypes.assemblyInstr:
        var start, end;
        if(isRange){
          var selectionObj = args.selectionObj;
          start = selectionObj.currStart;
          end = selectionObj.currEnd;
          _dataStore.selectedAddrRanges = [[_dataStore.assemblyArray[start].id, _dataStore.assemblyArray[end].id]];
        } else {
          _dataStore.selectedAddrRanges = [[args.d.id, args.d.id]];
        }

        clearAllSelected(_dataStore);
        if(isRange){
          setSelectedAssembly(_dataStore, [start, end]);
        }
        updateAllData(_dataStore, _dataStore.selectedAddrRanges);
        _observers.notify();

        break;
        
      case dataTypes.graphNode:
        var bbIds;
        if(isRange){
          bbIds = args.nodeList.slice();
        } else {
          bbIds = [args.d];
        }

        // remove the prefix "B" from the nodeIds and convert the ids into integers
        for(var i = 0; i<bbIds.length; i++){
          bbIds[i] = parseInt(bbIds[i].substr(1), 10);
        }
        _dataStore.selectedAddrRanges = getAddrRangesFromBBs(_dataStore, bbIds);
        clearAllSelected(_dataStore);
        if(isRange){
          setSelectedBBs(_dataStore, args.nodeList);
        }
        updateAllData(_dataStore, _dataStore.selectedAddrRanges);
        _observers.notify();

        break;
      case dataTypes.callGraphNode:
        var fnName = args.d;
        var fns = [];
        // get the function object using the name
        for(var i=0; i<_dataStore.fnInlineList.length;i++){
          if(fnName === _dataStore.fnInlineList[i].name){
            fns.push(_dataStore.fnInlineList[i]);
          }
        }
        _dataStore.selectedAddrRanges = getAddrRangesFromFns(_dataStore, fns);
        clearAllSelected(_dataStore);
        updateAllData(_dataStore, _dataStore.selectedAddrRanges);
        _observers.notify();
        break;

      case dataTypes.loopTreeNode:
        var loops = [args.d];
        _dataStore.selectedAddrRanges = getAddrRangesFromLoops(_dataStore, loops);
        clearAllSelected(_dataStore);
        updateAllData(_dataStore, _dataStore.selectedAddrRanges);
        _observers.notify();
        break;

      case dataTypes.fnTreeNode:
        var fns = [args.d];
        _dataStore.selectedAddrRanges = getAddrRangesFromFns(_dataStore, fns);
        clearAllSelected(_dataStore);
        updateAllData(_dataStore, _dataStore.selectedAddrRanges);
        _observers.notify();
        break;
    }
}

// Clears the selected items for source code, disassembly, and CFG
function clearAllSelected(dataSource){

  // clear selected from source code
  for(var i = 0; i<dataSource.sourceArray.length; i++){
    dataSource.sourceArray[i].selected =false;
  }
  // clear selected from disassembly code
  for(var i=0; i<dataSource.assemblyArray.length; i++){
    dataSource.assemblyArray[i].selected = false;
  }
  // clear selected from graph nodes
  var nodes = dataSource.graphNoLabel.nodes();
  for(var i=0; i<nodes.length; i++){
    dataSource.graphNoLabel.node(nodes[i]).selected = false;
  }
}

// This function sets selected to all src lines within range selection
// setSelectedSrc(_dataStore, [start, end])
function setSelectedSrc(dataSource, range){
	for(var i=range[0]; i<=range[1]; i++){
		dataSource.sourceArray[i].selected = true;
	}
}

// This function sets selected to all assembly lines within range selection
// setSelectedAssembly(_dataStore, [start, end])
function setSelectedAssembly(dataSource, range){
	for(var i =range[0]; i<=range[1]; i++){
		dataSource.assemblyArray[i].selected = true;
	}
}

// This function sets selected to all basic blocks within group selection
// setSelectedBBs(_dataStore, nodeList);
function setSelectedBBs(dataSource, list){
  for(var i=0; i<list.length; i++){
		dataSource.graphNoLabel.node(list[i]).selected = true;
	}
}

// This function is used for semantic filtering.
// This function adds nodes from the top level loops to the set of nodes
// Returns the updated set of nodes
function addContainingLoops(model, setOfNodes){
  
  // the loops containing this set is already computed during the highlight operation
  // and stored in a filtered tree. 

  var filteredTree = model.get("filteredloopFnTree");

  if((filteredTree == null) || isEmptyObj(filteredTree)){
    return setOfNodes;
  }

  assert(filteredTree.type == "root", "The top level node must be root node");
  
  setOfNodes = new Set(setOfNodes);

  // iterate through the functions if they exist
  var fns = filteredTree.children;
  for(var i=0; i<fns.length; i++){
    var loops = fns[i].children;
    // Top level loops
    for(var j=0; j<loops.length; j++){
      var blocks = loops[j]["ref"]["blocks"];
      for(var k=0; k<blocks.length; k++){
        // Add the prefix "B" since the basic blocks in graph have the prefix
        setOfNodes.add("B" + blocks[k]);
      }
    }
  }

  setOfNodes = Array.from(setOfNodes);
  return setOfNodes;

}

// This function creates the loops array used by the loopify_dagre module
// The format of the array is as follows:
//    Each entry in the array is a loop object with the format: {
//      "backedge": [from, to],
//      "nodes": [nodeIds],
//      "parent": index_in_the_array or "" (if none)
//    }
// Returns the loops array
function getLoopifyTree(model){

  var loopsObj = [];
  // convert the tree into a list
  var tree = d3.layout.tree().nodeSize([0,20]);

  var filteredTree = model.get("filteredloopFnTree");

  if((filteredTree == null) || isEmptyObj(filteredTree)){
    return loopsObj;
  }
  assert(filteredTree.type == "root", "The top level node must be root node");

  var loops = tree.nodes(filteredTree);

  // assign an index for each of the object equal to the loop index
  var counter = 0;
  for(var i=0; i<loops.length; i++){
    var thisNode = loops[i];
    if(thisNode.type != "loop"){
      continue;
    }
    thisNode._indexLoopify = counter;
    
    // construct the loop objects for loopify_dagre 
    // Add each loop item for each backedge
    var backedges = thisNode.ref.backedges;
    for(var j=0; j<backedges.length; j++){

    	var newObj = {};
	    newObj["backedge"] = ["B" + backedges[j].from, 
	        "B" + backedges[j].to];
	    
	    var blocks = thisNode.ref.blocks.map( function(val){
	      return "B" + val;
	    });
	    newObj["nodes"] = blocks;
	    
	    // store the parent element for now
	    // On the next pass, we convert it into the integer index in the array 
	    assert("parent" in thisNode, "loop node must have a parent");
	    newObj["parent"] = thisNode["parent"];
	    loopsObj[counter] = newObj;
	    ++counter;

	}

  }

  // Update the parent elements
  for(var i=0; i<loopsObj.length; i++){
    
    var thisObj = loopsObj[i];
    var parent = thisObj["parent"];
    if(("_indexLoopify" in parent) && parent.type == "loop"){
      parent = parent._indexLoopify;
    } else {
      parent = "";
    }
    thisObj["parent"] = parent;
  }
  return loopsObj;

}
