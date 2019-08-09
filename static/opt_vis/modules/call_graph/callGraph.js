var callTypes = {
	call: "CALL",
	inline: "INLINE"
}

// This function creates the callGraph from calls and inline information in the json file
// Returns the callgraph
var function = makeCallGraph(jsonData){
	var callGraph;
	var functions = jsonData["functions"];
	for(var i=0; i<functions.length; i++){
		var thisFunction = functions[i];
		var fnName = thisFunction["name"];
		var calls = thisFunction["calls"];

		for(var j=0; j<calls.length; j++){
			if(calls[j]["target"] != 0 && calls[j]["target_func"]){
				addCallEdge(callGraph, fnName, calls[j]);
			}
		}

		var inlines = functions["inlines"];
		for (var k=0; k<inlines.length; k++){
			addInlineEdge(callGraph, fnName, inlines[k], false);
			processCallsInline(inlines[k]);
		}
	}

	return callGraph;

}

// This function recursively processes the inline trees
var function = processCallsInline(callGraph, inline){
	if(inline["inlines"]){
		var children = inline["inlines"];
		for(var k =0; k<children.length; k++ ){
			addInlineEdge(callGraph, inline, children[k], true);
			processCallsInline(callGraph, children[k]);
		}
	}
}

// This function adds call edge to the callGraph
var function = addCallEdge(callGraph, fnName, call){
	var target_funcs = call["target_func"];
	for(var i=0; i<target_funcs.length; i++){
		if(!callGraph.hasNode(fnName)){
			callGraph.addNode(fnName);
		}

		if(!callGraph.hasNode(target_funcs[i])){
			callGraph.addNode(target_funcs[i]);
		}

		var callObj = {type: callTypes.call, sourceAddr: call["address"], targetAddr: call["target"]};
		callGraph.addEdge(fnName, target_funcs[i], callObj);

	}
}

// This function adds inline edges to the callGraph
// The source can be a top-level function or an inlined function
var function = addInlineEdge(callGraph, source, target, isBothInline){
	var sourceName = source;
	if(isBothInline){
		sourceName = source.name;
	}
	if(!callGraph.hasNode(sourceName)){
		callGraph.addnode(sourceName);
	}

	var targetName = target.name;
	if(!callGraph.hasNode(targetName)){
		callGraph.addNode(targetName);
	}

	var callObj = {type: callTypes.inline, targetAddr: target["ranges"][0]["start"], 
		callsite_file: target["callsite_file"], callsite_line: target["callsite_line"] };

	callGraph.addEdge(sourceName, targetName, callObj);	
		
}

var function = addEdge(g,u,v,val){

}

var function = makeCallGraphView(model, viewId){
	
}