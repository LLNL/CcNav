var callTypes = {
	call: "CALL",
	inline: "INLINE"
};

// This function creates the callGraph from calls and inline information in the json file
// Returns the callgraph
var makeCallGraph = function(jsonData){
	// var callGraph = graphlibDot.parse("digraph {}");
	var callGraph = graphlibDot.parse("strict digraph {}");
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

		if(thisFunction["inlines"]){
			var inlines = thisFunction["inlines"];
			for (var k=0; k<inlines.length; k++){
				addInlineEdge(callGraph, fnName, inlines[k], false);
				processCallsInline(callGraph, inlines[k]);
			}
		}
	}

	return callGraph;

};

// This function recursively processes the inline trees
var processCallsInline = function(callGraph, inline){
	if(inline["inlines"]){
		var children = inline["inlines"];
		for(var k =0; k<children.length; k++ ){
			addInlineEdge(callGraph, inline, children[k], true);
			processCallsInline(callGraph, children[k]);
		}
	}
};

// This function adds call edge to the callGraph
var addCallEdge = function(callGraph, fnName, call){
	var target_funcs = call["target_func"];
	for(var i=0; i<target_funcs.length; i++){
		if(!callGraph.hasNode(fnName)){
			callGraph.addNode(fnName, {label:fnName, shape: "box", style: "solid"});
		}

		if(!callGraph.hasNode(target_funcs[i])){
			callGraph.addNode(target_funcs[i], {label:target_funcs[i], shape: "box", style: "solid"});
		}

		var callObj = {type: callTypes.call, sourceAddr: call["address"], targetAddr: call["target"], label:""};
		
		// IF no edge exists, then add this edge
		var outEdges = callGraph.outEdges(fnName, target_funcs[i]);	
		if(outEdges.length == 0){
			
			callGraph.addEdge(null, fnName, target_funcs[i], callObj);
		}	else if (outEdges.length == 1 && outEdges[0].type == callTypes.inline){
			console.log("Already exists inline");
			callGraph.addEdge(null, fnName, target_funcs[i], callObj);
		}	else if(outEdges.length >= 2){
			console.log("Already exists 2 edges");
		}

	}
};

// This function adds inline edges to the callGraph
// The source can be a top-level function or an inlined function
var addInlineEdge = function(callGraph, source, target, isBothInline){
	var sourceName = source;
	if(isBothInline){
		sourceName = source.name;
	}
	if(!callGraph.hasNode(sourceName)){
		callGraph.addNode(sourceName, {label:sourceName, shape: "box", style: "solid"});
	}

	var targetName = target.name;
	if(!callGraph.hasNode(targetName)){
		callGraph.addNode(targetName, {label:targetName, shape: "box", style: "solid"});
	}

	var callObj = {type: callTypes.inline, targetAddr: target["ranges"][0]["start"], 
		callsite_file: target["callsite_file"], callsite_line: target["callsite_line"], label:"", style:"dashed", color:"red" };

	// IF no edge exists, then add this edge
	var outEdges = callGraph.outEdges(sourceName, targetName);	
	if(outEdges.length == 0){
		callGraph.addEdge(null, sourceName, targetName, callObj);	
	}	else if (outEdges.length == 1 && outEdges[0].type == callTypes.call){
		console.log("Already exists call");
		callGraph.addEdge(null, sourceName, targetName, callObj);	
	}	else if(outEdges.length >= 2){
		console.log("Already exists 2 edges");
	}

};

var makeCallGraphView = function(model, svgId, divId){

	var callGraph = model.get('callGraph');

	var _observers = makeSignaller();
	var svg;
	var inner;
	var zoom;

	// var numHops = 5;
	var numHops = 3;
	var maxNodes = 20;

	var _highlightEvent = function(d,i){
		_observers.notify({
			type: signalType.highlight,
			dataType: dataTypes.callGraphNode,
			d:d,
			i:i
		});
	};

	var _render = function(isShowFilter){

		var graph_nodes = callGraph.nodes();
		// clear the width and height of the nodes for a fresh layout
		for(var i=0; i<graph_nodes.length; i++){
			delete callGraph.node(graph_nodes[i]).width;
			delete callGraph.node(graph_nodes[i]).height;
		}

		// clear the width and height of the edges for a fresh layout
		var graph_edges = callGraph.edges();
		// console.log(callGraph.edges());
		for(var i=0; i<graph_edges.length; i++){
			delete callGraph.edge(graph_edges[i]).width;
			delete callGraph.edge(graph_edges[i]).height;
		}

		var graph_to_display = callGraph;
		if(isShowFilter){
		
			// Get the highlighted nodes in the graph	
			var setOfNodes = model.getHighlightedNodes(callGraph);
			
			// If the highlighted set is empty, set the first node of the graph as the filtering set
  			if(setOfNodes.length == 0){
		  		setOfNodes = [callGraph.nodes()[0]];
		  	}

		  	// graph_to_display = getKHopGraph(callGraph, setOfNodes, numHops, maxNodes);
		  	// graph_to_display = getKHopGraphDirected(callGraph, setOfNodes, numHops, maxNodes, "up");
		  	graph_to_display = getKHopGraphDirected(callGraph, setOfNodes, numHops, maxNodes, "both");
			
		}

		svg = d3.select('#' + svgId);
		inner = d3.select('#' + svgId + ' g');
		clearSVG(inner.node());

		var renderer = new dagreD3.Renderer();
		// renderer.run(callGraph, d3.select('#' + svgId + ' g'));
		// if( graph_to_display._nodes._init ) {
		// 	console.dir(graph_to_display._nodes._init.value.width);
		// }

		renderer.run(graph_to_display, d3.select('#' + svgId + ' g'));

		_fillCGNodesandEdges(callGraph,svgId);

		var bbox = svg.node().getBBox();

		// Since the callgraph is very wide compared to height, we auto-resize to the height
		// var graph_svg_width = bbox.width;
		// var initialScale = parseInt(svg.style("width"), 10) / graph_svg_width;

		var graph_svg_height = bbox.height;
		var initialScale = parseInt(svg.style("height"), 10) / graph_svg_height;

		// initialScale = 1;
		// console.log( "initialScale=" + initialScale );

		 zoom = d3.behavior.zoom().on("zoom", function() {

		 	// console.log( "d3.event.scale=" + d3.event.scale );
		 	// console.dir(d3.event.translate);

		 	// inner.attr("transform", "translate(" + d3.event.translate + ")" +
	                                  // "scale(" + 1 + ")");
		 	inner.attr("transform", "translate(" + d3.event.translate + ")" +
	                                  "scale(" + d3.event.scale + ")");
	    });
	    
	    svg.call(zoom).on("dblclick.zoom", null);

		// .translate([0 , 20])

	    zoom.scale(initialScale)
	        .event(svg);

	    // Setup event listeners    
	    d3.selectAll("#" + svgId + " g.node.enter")
	        // .on("mouseover", function(d, i){
	          // _showTooltip(d, i, divId, this);
	          // _fireFocusEvent(d,i);
	        // })
	        // .on("mouseout", function(d, i){
	          // _hideTooltip();
	          // _fireFocusOutEvent(d,i);

	        // })
	        .on("click", function(d, i){
	          // _clickEvent(d,i);
	          _highlightEvent(d,i);
	        })
	      // .call(drag);

	      _highlight();

	};

	var _highlight = function(){

	    var graph_nodes = callGraph.nodes();
	    var found_highlight = false;

	    d3.selectAll("#" + svgId + " g.node.enter")
	    	// .data(graph_nodes, function(d){return d;})
	    	.classed("highlight", function(d){
	        // if (callGraph.node(d).highlight){

	        //   if(!found_highlight) {
	        //     found_highlight = true;
	        //    // _centerToNode(d3.select(this));
	        //   }
	        // }
	    		return callGraph.node(d).highlight;
	    	});
    };

    // _render();
    _render(true);

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
	    zoom.translate([nodetX , nodetY])
	      .event(svg);

  	};

  	function _fillCGNodesandEdges(g, svgId) {

  		d3.selectAll("#" + svgId + " g.edgePath.enter")
  			.classed("inline", function(d){
  				return g.edge(d).type == callTypes.inline;
  			});
	}

  	return {
	    render: function(){
	      // _render();
	      _render(true);
		},

	    highlight: function(){
	      // _highlight();
	      _render(true);  
	    },

	    register: function(fxn) {
	      _observers.add(fxn);
	    }

  	};

};


