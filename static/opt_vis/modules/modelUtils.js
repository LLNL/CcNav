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
 callGraphNode: 'CALLGRAPH_NODE'
};

var viewTypes = {
  viewVarRenamer: 'VAR_RENAMER_VIEW',
  viewDisassembly: 'DISASSEMBLY_VIEW',
  viewCallGraph: 'CALLGRAPH_VIEW' 
};

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

        if(ctNodes >= maxNodes){
          return graphToReturn;
        }

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
  }

  // console.log(queues);

  return graphToReturn;

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