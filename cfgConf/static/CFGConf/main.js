class Model {
	origCFGConfJSON;
	CFGConfJSON;
	graph;
	filteredGraph;
	dotString;
	filteredDotString;
	graphWithAuxNodes;
}

var cfgConfModel = new Model();
var cfgView = new CFGView(cfgConfModel, "graphContainer", "gDiv");

var cfgConfPrefix = "cfgConf/static/CFGConf/files/";
// var cfgConfFile = "ltimes_cfg_conf_no_graph.json";
// var cfgConfFile = "ltimes_cfg_conf_no_graph_lines171-181.json";
// var cfgConfFile = "ltimes_cfg_conf_no_graph_lines226-235.json";
// var cfgConfFile = "ltimes_cfg_conf_no_graph_lines1029-1082.json";
// var cfgConfFile = "ltimes_cfg_conf_no_graph_lines1391-1396.json";
// var cfgConfFile = "ltimes_cfg_conf_no_graph_aux_rules.json";
// var cfgConfFile = "singlefile_cfg_gd_sample_wo_graph.json";
// var cfgConfFile = "singlefile_cfg_gd_no_graph_w_structure.json";

function runCFGConf(){
	d3.json(cfgConfPrefix + "init.json", function(initFileJSON) {
		var cfgConfPrefix = initFileJSON["PathPrefix"];
		var jsonPath = cfgConfPrefix + initFileJSON["JSONFileName"];
		// d3.json(cfgConfPrefix + cfgConfFile, function(cfgConfJSON) {
		d3.json(jsonPath, function(cfgConfJSON) {	
			cfgConfModel.CFGConfJSON = cfgConfJSON;
			// make a copy of the json spec
			cfgConfModel.origCFGConfJSON = JSON.parse(JSON.stringify(cfgConfModel.CFGConfJSON));
			cfgConfModel.graph = new graphlibNew.Graph({ directed: true, compound: true});
			console.log(cfgConfModel.CFGConfJSON);
			console.log(cfgConfModel.graph);

			if("data" in cfgConfModel.CFGConfJSON){

				if(!("graphFile" in cfgConfModel.CFGConfJSON["data"])){
					alert("No graph file provided");
					throw "No graph file provided";
				}
				var graphFile = cfgConfModel.CFGConfJSON["data"]["graphFile"];

				var graphFormat;
				if(!("graphFormat" in cfgConfModel.CFGConfJSON["data"])){
					if(graphFile.endsWith(".dot")){
						graphFormat = "dot";
					}	else if (graphFile.endsWith(".json")){
						graphFormat = "json";
					}	else {
						alert("Graph format not provided");
						throw "Graph format not provided";
					}

				}	else {
					graphFormat = cfgConfModel.CFGConfJSON["data"]["graphFormat"];
				}
				
				var structureFileType = null;
				if("structureFile" in cfgConfModel.CFGConfJSON["data"]){
					structureFileType = "structure";
				}	else if ("analysisFile" in cfgConfModel.CFGConfJSON["data"]){
					structureFileType = "dyninstAnalysis";
				}
				
				if(graphFormat === "dot"){
					d3.text(cfgConfPrefix + cfgConfModel.CFGConfJSON["data"]["graphFile"], function(dotString){
						FileUtils.addFromDotFile(dotString, cfgConfModel.CFGConfJSON);
						if(structureFileType === "dyninstAnalysis"){
							d3.json(cfgConfPrefix + cfgConfModel.CFGConfJSON["data"]["analysisFile"], function(anlsJSON) {
								FileUtils.addFromJSONAnlsFile(anlsJSON, cfgConfModel.CFGConfJSON);
								initGraph(cfgConfModel.CFGConfJSON, cfgConfModel.graph, cfgConfModel);
							})	
						}	else if (structureFileType === "structure"){
							d3.json(cfgConfPrefix + cfgConfModel.CFGConfJSON["data"]["structureFile"], function(strucJSON) {
								FileUtils.addFromStructuresFile(strucJSON, cfgConfModel.CFGConfJSON);
								initGraph(cfgConfModel.CFGConfJSON, cfgConfModel.graph, cfgConfModel);
							})
						} else {
							initGraph(cfgConfModel.CFGConfJSON, cfgConfModel.graph, cfgConfModel);
						}
					})
				}
				else if (graphFormat === "json") {
					d3.json(cfgConfPrefix + cfgConfModel.CFGConfJSON["data"]["graphFile"], function(graphJSON){
						FileUtils.addFromGraphJSON(graphJSON, cfgConfModel.CFGConfJSON);
						if(structureFileType === "dyninstAnalysis"){
							d3.json(cfgConfPrefix + cfgConfModel.CFGConfJSON["data"]["analysisFile"], function(anlsJSON) {
								FileUtils.addFromJSONAnlsFile(anlsJSON, cfgConfModel.CFGConfJSON);
								initGraph(cfgConfModel.CFGConfJSON, cfgConfModel.graph, cfgConfModel);
							})	
						}	else if (structureFileType === "structure"){
							d3.json(cfgConfPrefix + cfgConfModel.CFGConfJSON["data"]["structureFile"], function(strucJSON) {
								FileUtils.addFromStructuresFile(strucJSON, cfgConfModel.CFGConfJSON);
								initGraph(cfgConfModel.CFGConfJSON, cfgConfModel.graph, cfgConfModel);
							})
						} else {
							initGraph(cfgConfModel.CFGConfJSON, cfgConfModel.graph, cfgConfModel);
						}
					}) 
				}
			}
				else {
				initGraph(cfgConfModel.CFGConfJSON, cfgConfModel.graph, cfgConfModel);
			}

		});
	});
}

runCFGConf();

function initGraph(json, graph, model){
	addNodes(graph, json["nodes"], json["rendering"]);
	addEdges(graph, json["edges"]);
	if(json["functions"]){
		addFns(graph, json["functions"], json["rendering"]);	
	}
	if(json["loops"]){
		addLoops(graph, json["loops"], json["functions"]);
	}
	if(json["constraints"]){
		addConstraints(graph, json["constraints"]);
	}

	initLayoutOpts(json, "rendering");
	applyLayoutOpts(graph, json["rendering"]);
	
	initFiltering(graph, json, "filtering");
	
	// initAuxNodeRules(graph, json, "auxRules");
	
	if(json["encodings"]){
		initEncodings(graph, json["encodings"]);
	}

	var filteredGraph = applyGraphFilter(graph, json["filtering"], json);
	console.log("Filtered graph: ");
	console.log(filteredGraph);
	// store the filtered graph and its dot string in the model
	model.filteredGraph = filteredGraph;
	model.dotString = convertToDot(graph);
	model.filteredDotString = convertToDot(filteredGraph);

	// NOTE: Moved to cfgView.js
	// var graphWithAuxNodes = applyAuxRules(filteredGraph, json["rendering"]["function"]["collapsingRules"]);
	// console.log("Graph with Aux Nodes: ");
	// console.log(graphWithAuxNodes);
	// model.graphWithAuxNodes = graphWithAuxNodes;
	// End Move
	
	cfgView.renderGraph();
}

// NOTE: Any JSON object inside the node/edge object e.g. 'data'
// if you write to a dot file will be lost and stored as "[object Object]"
// Be sure to copy the object attributes to the top level before converting 
// the graph into dot format.

function addNodes(g, nodes, layoutOpts){
	nodes.forEach(function(node) {
		// populate the label attribute if not exists
		if(!("label" in node)){
			node["label"] = node["id"];
		}

		node["tooltip"] = node["label"];

		if(layoutOpts){
			if(layoutOpts["node"]){
				if(layoutOpts["node"]["label"] === "id"){
					node["label"] = node["id"];
				}
			}
		}
		
		// NOTE: Any JSON object inside the node/edge object e.g. 'data'
		// if you write to a dot file will be lost and stored as "[object Object]"
		// Be sure to copy the object attributes to the top level before converting 
		// the graph into dot format.
		g.setNode(node["id"], node);
		
	});
}

function addEdges(g, edges){
	edges.forEach(function(edge) {
		g.setEdge(edge["source"], edge["target"], edge);
	});
}

function addFns(g, fns, layoutOpts){
	fns.forEach(function(fn){
		fn["penwidth"] = 2;
		fn["pencolor"] = "deepskyblue2"; 
		if(!("label" in fn)) {
			fn["label"] = fn["id"];
		}
		if(layoutOpts){
			if(layoutOpts["function"]){
				if(layoutOpts["function"]["boundary"]){
					// add the prefix "cluster_" to the id
					fn["id"] = "cluster_" + fn["id"];	
				}
			}
		}
		// set the type as "function"
		fn.type = nodeTypes.fn;
		
		// add the function as another node
		g.setNode(fn["id"], fn);
		
		// set the parents of nodes inside the function
		fn["nodes"].forEach(function(nodeId){
			// add the nodes if not already added
			if(!g.hasNode(nodeId)){
				g.setNode(nodeId);
			}
			g.setParent(nodeId, fn["id"]);

		});
		//  handle the data and layout.node and layout.edge properties
	});
}

function addLoops(g, loops, fns){
	loops.forEach(function(loop){
		// Add the loop to the graph
		// These loops are top level loops i.e. the parent is either a function 
		// or null if no function found
		var parent = findParent(loop, fns);
		addLoop(g, loop, parent);
	});
}

// Find the parent function for the loop
function findParent(loop, fns){
	if(!fns){
		return null;
	}
	for(var i=0; i<fns.length; i++){
		if(checkLoopinFn(loop, fns[i])){
			return fns[i];
		}
	}	
	return null;
}

// Check if the loop is inside the function
function checkLoopinFn(loop, fn){
	// check if all the nodes in the loop are contained by the fn
	return Utils.isSubset(new Set(fn["nodes"]), new Set(loop["nodes"]));
}

// recursive function to add loops
function addLoop(g, loop, parent){
	
	// add the loop as another node
	loop.type = nodeTypes.loop;
	g.setNode(loop["id"], loop);
	if(!("label" in loop)) {
		loop["label"] = loop["id"];
	}

	if(parent){
		g.setParent(loop["id"], parent["id"]);
	}

	// set the parents of nodes inside the loop to be this loop
	loop["nodes"].forEach(function(nodeId){
		// add the nodes  if not already added
		if(!g.hasNode(nodeId)){
			g.setNode(nodeId);
		}
		g.setParent(nodeId, loop["id"]);

	});

	// NOTE: When converting to dot file,
	// Add the backedge from and to as separate values
	// Handle the data and layout.node and layout.edge properties

	if(loop["loops"]){
		loop["loops"].forEach(function(childLoop){
			addLoop(g, childLoop, loop);
		});
	}
}

function initLayoutOpts(json, optsKey){
	// Fill with default values
	var layoutOpts = json[optsKey];
	if(!layoutOpts){
		json[optsKey] = layoutOpts = {};
	}
	Utils.fillDefaultDeep(layoutOpts, Defaults.LayoutOpts);
}

// NOTE: For complete implementation,
// apply the global attributes to the nodes and edges
// Start with the global attributes; Move down to the subgraph
// attribs and end with individual attributes
// For loops handle the whole hierarchy

function applyLayoutOpts(g, layoutOpts){
	// populate the node and edge attributes for individual nodes and edges
	// based on the global values
	let nodeOpts = layoutOpts["node"];
	let edgeOpts = layoutOpts["edge"];
	for(let nodeId of Filtering.leaves(g)){
		let node = g.node(nodeId);
		for(const [prop, val] of Object.entries(nodeOpts)){
			if(!(prop in node)){
				node[prop] = val;
			}
		}
	}
	for(let edgeId of g.edges()){
		let edge = g.edge(edgeId);
		for(const [prop, val] of Object.entries(edgeOpts)){
			if(!(prop in edge)){
				edge[prop] = val;
			}
		}
	}
}

/*
function initAuxNodeRules(g, json, optsKey){
	var auxRulesOpts = json[optsKey];
	if(!auxRulesOpts){
		json[optsKey] = auxRulesOpts = {};
	}
	Utils.fillDefault(auxRulesOpts, Defaults.AuxRulesOpts);
}
*/


// Initializes the filtering options
// If options not set, fills with the default values
function initFiltering(g, json, optsKey){
	var filterOpts = json[optsKey];
	if(!filterOpts){
		json[optsKey] = filterOpts = {};
	}
	Utils.fillDefault(filterOpts, Defaults.FilterOpts);
}

function applyGraphFilterOrig(g, filterOpts, json){
	var filteredGraph;
	var selectedNodes = filterOpts["selectedNodes"];
	if(filterOpts["isLoopFilterOn"]){
		selectedNodes = Filtering.loopFiltering(selectedNodes, json["loops"], g);
		// TODO: Comment the above line and uncomment below once loop depth based filtering is implemented
		// selectedNodes = Filtering.loopFiltering(selectedNodes, json["loops"], g, filterOpts["loopDepth"]);
	}
	
	//TODO: Uncomment once the filtering utility functions are implemented
	// if function filtering is on
	// if(filterOpts["isFunctionFilterOn"]){
	// 	// Use the original set of nodes instead of the extended set of nodes
	// 	// with loops
	// 	fnSelectedNodes = Filtering.fnFiltering(filterOpts["selectedNodes"], json["functions"]);
	// 	selectedNodes = selectedNodes.concat(fnSelectedNodes);
	// }

	if(filterOpts["isHopFilterOn"]){
		filteredGraph = Filtering.getKHopGraph(g, selectedNodes, filterOpts["maxHops"], filterOpts["minNodes"], "both");
	} 
	else {
		if(filterOpts["isLoopFilterOn"] || filterOpts["isFunctionFilterOn"]){
			//TODO: Implement this
			// Create the filtered graph if no Khop flag but there is loop filter
			// or function filter or both since they only return a set of nodes
			filteredGraph = Filtering.getSubGraphFromNodes(selectedNodes, g);
		}
		
		else {
			// If none of the filtering flags set, return the original graph
			filteredGraph = g;
		}
	}
	return filteredGraph;
}

// This function supports a simplified version of filtering where
// the khop filtering flag determines if the filtering is 
// enabled and loop filtering flag supplements the khop filtering
// Function based filtering as well as filtering with a given loop depth 
// is not implemented   
function applyGraphFilter(g, filterOpts, json){
	var filteredGraph;
	var selectedNodes = filterOpts["selectedNodes"];
	if(filterOpts["isHopFilterOn"]){
		if(filterOpts["isLoopFilterOn"]){
			selectedNodes = Filtering.loopFiltering(selectedNodes, json["loops"], g);
		}
		filteredGraph = Filtering.getKHopGraph(g, selectedNodes, filterOpts["maxHops"], filterOpts["minNodes"], "both");
	}
	else {
			filteredGraph = g;
	}
	return filteredGraph;
}

// NOTE: Any JSON object inside the node/edge object e.g. 'data'
// if you write to a dot file will be lost and stored as "[object Object]"
// Be sure to copy the object attributes to the top level before converting 
// the graph into dot format.

// Convert the file to dot
function convertToDot(g){
	// For Loops
	// Add the backedge from and to as separate values
	// For loops and functions
	//  handle the data and layout.node and layout.edge properties
	var dotString = graphlibDotNew.write(g);
	const regex = /cluster_main /ig;
	// const regex = /cluster_/ig;
	return dotString;
	// return dotString.replace(regex, 'main ');
	// return dotString.replace(regex, '');
}






