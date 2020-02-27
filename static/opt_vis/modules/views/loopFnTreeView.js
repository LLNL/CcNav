// This function makes the tree view to list the loops and functions in the program
var makeLoopFnTreeView = function(model, loopId, inlineId, divId){
	
	// var graph;
	var loopTree = {};
	var fnInlineTree = {};
	// var loopDataLoaded = false;
	var _observers = makeSignaller();
	
	// variables for loop tree
	var margin, barHeight, i, duration, root, tree, diagonal, svg;
	
	// variables for inline tree
	var margin2, barHeight2, i2, duration2, root2, tree2, diagonal2, svg2;

	// Array holding the list of functions and inlines. The object is computed using d3 tree layout. 
	// Contains the original object in the "ref" field. Also conatins the "depth" field. 
	var fnInlineList;
	
	var server_dir;

	var _highlightEvent = function(d,i){
	// 	_observers.notify({
	// 		type: signalType.highlight,
	// 		dataType: dataTypes.loopTreeObject,
	// 		d: d,
	// 		i: i
	// 	});
	};

	var _reset = function(){
		// loopDataLoaded = false;
		loopTree = {};
		fnInlineTree = {};
		_setupViewToggles();
		_init(loopId, "loop");
		_init(inlineId, "inline");
	}

	_reset();

	function _setupViewToggles(){
		d3.selectAll("#" + divId + " h3")
	    .on("dblclick", function(){
	      
	    	var id = d3.select(this).attr('id');
	    	if(id == "fnHeader"){
	    		var treeHolder = d3.select("#" + inlineId);
	    		treeHolder.classed("hidden", !treeHolder.classed("hidden"));
	    	} else if(id == "loopHeader"){
	    		var treeHolder = d3.select("#" + loopId);
	    		treeHolder.classed("hidden", !treeHolder.classed("hidden"));
	    	}

	      

	    });
	}

	/*
	function onLoadFinished(err, result){

		// loopDataLoaded = true;

		var loopsObj = JSON.parse(result.responseText);
		model.set("loopsObj", loopsObj);
		console.log(loopsObj);

		var roots = [];
		populateChildrenandRoots(loopsObj, roots);
		loopTree = makeTree(loopsObj, roots);
		loopTree.x0 = 0;
		loopTree.y0 = 0;

		_render(loopId);
	}
	*/

	function _render(viewId, type){
		if(type=="loop"){
			root = loopTree;
			update(root, viewId, type, root, margin, barHeight, i, duration, tree, diagonal, svg);

		}	else if(type=="inline") {
			root2 = fnInlineTree;
			update(root2, viewId, type, root2, margin2, barHeight2, i2, duration2, tree2, diagonal2, svg2);
		}
	}

    function _init(viewId, type){

    	if(type == "loop"){
	    	margin = {top: 10, right: 10, bottom: 10, left: 5};
		  	barHeight = 20;

		  	i = 0, duration = 400, root;

		  	tree = d3.layout.tree()
		    	.nodeSize([0, 20]);

		  	diagonal = d3.svg.diagonal()
		    	.projection(function(d) { return [d.y, d.x]; });

		    svg = d3.select("#" + viewId + " g")
		    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		    // server_dir = "";
		    // if(is_lc()){
		    //   server_dir = "ajax/findLoops.cgi";
		    // } else if(isXAMPP()){
		    //   server_dir = "ajax/findLoops_xampp.cgi";
		    // } else {
		    //   server_dir = "../findLoops/";
		    // }

		    // graph = model.get('graphNoLabel');

		    // if(!loopDataLoaded){
		    // 	loadLoopAnalysis();
		    // }

		    loopTree = createFnLoopTree(model);
		    _render(viewId, type);

		}	else if(type=="inline") {

			margin2 = {top: 10, right: 10, bottom: 10, left: 5};
		  	barHeight2 = 20;

		  	i2 = 0, duration2 = 400, root2;

		  	tree2 = d3.layout.tree()
		    	.nodeSize([0, 20]);

		  	diagonal2 = d3.svg.diagonal()
		    	.projection(function(d) { return [d.y, d.x]; });

		    svg2 = d3.select("#" + viewId + " g")
		    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		    fnInlineTree = createFnInlineTree(model);
		    fnInlineList = tree2.nodes(fnInlineTree);
		    _setupAutocomplete(fnInlineList);

		    _render(viewId, type);

		}

    }

	function _setupAutocomplete(list){
    
	     var input = document.getElementById("searchFnText");
	     new Awesomplete(input, 
	     	{
	     		list:list, 
		     	data: function(item, input){
		     		return {label: item.name, value:item.name};
		     	},
		     	selectcomplete: function(text, originalEvent){
		     		console.log(text);
		     		console.log(originalEvent);
		     	}

	     	});


    }

    /*
    function loadLoopAnalysis(){

    	d3.xhr( server_dir )
	        .header("Content-Type", "text/plain")
	        .post(graphlibDot.write(graph), onLoadFinished);

    }
    */

    function update(source, viewId, type, root, margin, barHeight, i, duration, tree, diagonal, svg) {

    	var width = d3.select("#" + divId).node().clientWidth;
	    var barWidth = (width - margin.left - margin.right) * 0.8;

	    // Compute the flattened node list.
	    // var nodes = root.descendants();

	    var nodes = tree.nodes(root);
	    
	    var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

	    d3.select("#" + viewId)
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

	    var dblclickHndlr;

	    if(type=="loop"){    
	        dblclickHndlr = dblclickLoop;
	    }   else if (type=="inline"){
	    	dblclickHndlr = dblclickInline;
	    }

	    // Enter any new nodes at the parent's previous position.
	    nodeEnter.append("rect")
	        .attr("y", -barHeight / 2)
	        .attr("height", barHeight)
	        .attr("width", barWidth)
	        .style("fill", color)
	        .on("click", click)
	        .on("dblclick", dblclickHndlr);

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
	        .classed("invisible", function(d){return d.name == "root";})
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

	    /* Start code for links */
	    /*

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

		*/
	    /* End Code for link */ 

	    // Stash the old positions for transition.
	    // root.each(function(d) {
	    nodes.forEach(function(d) {
	      d.x0 = d.x;
	      d.y0 = d.y;
	    });
  }

  // Toggle children on dblclick.
  function dblclickLoop(d, i) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    
    // update(d);
    update(d, loopId, "loop", root, margin, barHeight, i, duration, tree, diagonal, svg);

  }

  function dblclickInline(d, i){
	if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    // update(d);  
    update(d, inlineId, "inline", root2, margin2, barHeight2, i2, duration2, tree2, diagonal2, svg2);	
  }

  // highlight and navigate to the loop in the CFG
  function click(d, i) {
  	_highlightEvent(d,i);
  }

  function color(d) {
    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
  }

  var _highlight = function(){

  	svg.selectAll(".treeNode")
  		.classed("highlight", function(d){
  			// navigateToLoop(d);
  			return d.ref.highlight;
  		});

  }

  return {
  	render: function(){
  		_render(loopId, "loop");
  		_render(inlineId, "inline");
  		// _highlight();
  	},

  	highlight: function(){
  		// _highlight();
  	},

  	reset: function(){
  		_reset();
  	},

  	register: function(fxn) {
  		_observers.add(fxn);
  	}

  }

}

// Creates the nesting hierarchy of the loops
// Note: Assumption is that loops are properly nested
// populates the 'roots' array, and 'children' array for each of the loop
// in "loopsObj" 
function populateChildrenandRoots(loopsObj, roots){
  var node, parent;
  for(var i = 0; i<loopsObj.length; i++) {
    node = loopsObj[i];
    if(node.parent != ""){
      parent = loopsObj[parseInt(node.parent)];   
      if(!("children" in parent)){
          parent.children = [i];
        } else {
          parent.children.push(i);
        }
    } else {
        roots.push(i);
    }
  }
}

// Creates the tree which can be used as input to the indented collapsible tree view
// params: 
//	loopsObj: the list of loop objects each with children property
//	roots: the list of root-level loops
// returns: 
//	loopTree: the tree which can be used as input to the indented collapsible tree view.
// 		Each node of the tree has the following fields.
//		'name': name of the loop
// 		'ref': reference of the loop object 
//		'children': children of the loop

function makeTree(loopsObj, roots){
	
	var loopTree = {name: "root", ref: null, children: []};
	var counter = {count:0};

	for(var i=0; i<roots.length; i++){
		loopTree.children.push(addNode(loopTree, loopsObj[roots[i]], counter, loopsObj));
	}

	return loopTree;
}

// This function recursively adds children nodes to the curr node of the loopTree
// params:
// 	currObj: the curr obj in the loopsObj variable
//  counter: stores the visited order of the loop
//   used to give names to loops based on visit order

function addNode(currObj, counter, loopsObj){

	++(counter.count);

	var thisNode = {name: "loop" + counter.count, ref: currObj, children: []};
	
	if(currObj.children && currObj.children.length >= 0)	{

		for(var i=0; i<currObj.children.length; i++){
			thisNode.children.push(addNode(thisNode, loopsObj[currObj.children[i]], counter, loopsObj));
		}
	}

	return thisNode;

}

// This function creates a tree with functions and inlined calls
// The roots of the tree are functions
function createFnInlineTree(model){

	var functions = model.get("jsonData").functions;
	var fnInlineTree = {name: "root", ref: null, children: []};
	
	for(var i=0; i<functions.length; i++){
		fnInlineTree.children.push(addFnInlineNode(functions[i]));
	}

	return fnInlineTree;

}

// This function recursively adds children nodes to the curr node of the tree
// params:
//  currObj: the curr obj
function addFnInlineNode(currObj){
	var thisNode = {name: currObj["name"], ref:currObj, children:[]};
	if(currObj["inlines"] && currObj["inlines"].length > 0){
		for(var i=0; i<currObj["inlines"].length; i++){
			thisNode.children.push(addFnInlineNode(currObj["inlines"][i]));
		}
	}
	return thisNode;
}

// This function creates a tree with functions and loops from the json analysis
function createFnLoopTree(model){

	var functions = model.get("jsonData").functions;
	var fnLoopTree = {name: "root", ref: null, children: []};
	
	for(var i=0; i<functions.length; i++){
		fnLoopTree.children.push(addLoopNode(functions[i]));
	}

	return fnLoopTree;

}

// This function recursively adds children nodes to the curr node of the tree
// params:
//  currObj: the curr obj
function addLoopNode(currObj){
	var thisNode = {name: currObj["name"], ref:currObj, children:[]};
	if(currObj["loops"] && currObj["loops"].length > 0){
		for(var i=0; i<currObj["loops"].length; i++){
			thisNode.children.push(addLoopNode(currObj["loops"][i]));
		}
	}
	return thisNode;
}


