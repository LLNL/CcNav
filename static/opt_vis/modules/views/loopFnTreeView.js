// This function makes the tree view to list the loops and functions in the program
var makeLoopFnTreeView = function(model, loopId, inlineId, divId){
	
	// var graph;
	
	// These trees are stored in the model now
	// var loopTree = model.get("loopFnTree");
	// var fnInlineTree = model.get("fnInlineTree");
	// var filteredloopFnTree = model.get("filteredloopFnTree");
 	// var filteredfnInlineTree = model.get("filteredfnInlineTree");
	
	// var loopDataLoaded = false;
	var _observers = makeSignaller();
	
	// variables for loop tree
	var margin, barHeight, i, duration, root, tree, diagonal, svg;
	
	// variables for inline tree
	var margin2, barHeight2, i2, duration2, root2, tree2, diagonal2, svg2;

	// Array of functions and inlines. The object is computed using d3 tree layout. 
	// Contains the original object in the "ref" field. Also conatins the "depth" field. 
	// var fnInlineList;
	// Similarly with loop and function nodes
	// var loopFnList;
	
	var server_dir;

	var _highlightEvent = function(d,i,dataType){
		_observers.notify({
			type: signalType.highlight,
			dataType: dataType,
			d: d,
			i: i
		});
	};

	var _reset = function(){

		// loopDataLoaded = false;
		model.set("loopFnTree", {});
		model.set("fnInlineTree", {});
		model.set("filteredloopFnTree", null);
		model.set("filteredfnInlineTree", null);

		_setupViewToggles();
		_init(loopId, "loop");
		_init(inlineId, "inline");
		_setupResetButton();

	}

	_reset();

	// This function sets up the reset button. Different from the reset function used 
	// to initialize the view during creation.
	function _setupResetButton(){	
		d3.select("#" + divId + " .btnReset").on("click", function(){
			// console.log("Reset button clicked");
			// set the filtered trees to the full trees
			model.set("filteredfnInlineTree", model.get("fnInlineTree"));
			model.set("filteredloopFnTree", model.get("loopFnTree"));

			_dataChanged();
	  		_render(loopId, "loop");
	  		_render(inlineId, "inline");

		});
	}

	function _setupViewToggles(){
		d3.selectAll("#" + divId + " h3")
	    .on("dblclick", function(){
	      
	      	var thisView = d3.select(this);
	    	var id = thisView.attr('id');
	    	thisView.classed("collapsed", !thisView.classed("collapsed"));
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
		model.set("loopFnTree", loopTree);
		loopTree.x0 = 0;
		loopTree.y0 = 0;

		_render(loopId);
	}
	*/

	function _render(viewId, type){
		if(type=="loop"){
			root = model.get("filteredloopFnTree");
			root.x0 = 0;
  			root.y0 = 0;
			update(root, viewId, type, root, margin, barHeight, i, duration, tree, diagonal, svg);

		}	else if(type=="inline") {
			root2 = model.get("filteredfnInlineTree");
			root2.x0 = 0;
  			root2.y0 = 0;
			update(root2, viewId, type, root2, margin2, barHeight2, i2, duration2, tree2, diagonal2, svg2);
		}
	}

	function _dataChanged(){
		i = 0;
		i2 = 0;
		svg.selectAll(".treeNode").remove();
		svg2.selectAll(".treeNode").remove();
	}

    function _init(viewId, type){

    	if(type == "loop"){
	    	margin = {top: 0, right: 10, bottom: 10, left: 5};
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

		    var loopTree = createFnLoopTree(model);
		    model.set("loopFnTree", loopTree);
		    model.set("filteredloopFnTree", loopTree);

		    var loopFnList = tree.nodes(loopTree);
		    for(var k=0; k<loopFnList.length; k++){
		    	loopFnList[k].id = k;	
		    }
		    model.set("loopFnList", loopFnList);

		    var loopFnIntTree = createLoopFnIntervalTree(model, loopFnList);
		    model.set("loopFnIntervalTree", loopFnIntTree);

		    _render(viewId, type);

		}	else if(type=="inline") {

			margin2 = {top: 0, right: 10, bottom: 10, left: 5};
		  	barHeight2 = 20;

		  	i2 = 0, duration2 = 400, root2;

		  	tree2 = d3.layout.tree()
		    	.nodeSize([0, 20]);

		  	diagonal2 = d3.svg.diagonal()
		    	.projection(function(d) { return [d.y, d.x]; });

		    svg2 = d3.select("#" + viewId + " g")
		    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		    var fnInlineTree = createFnInlineTree(model);
		    model.set("fnInlineTree", fnInlineTree);
		    model.set("filteredfnInlineTree", fnInlineTree);

		    var fnInlineList = tree2.nodes(fnInlineTree);
		    for(var k=0; k<fnInlineList.length; k++){
		    	fnInlineList[k].id = k;	
		    }
		    model.set("fnInlineList", fnInlineList);
		    _setupAutocomplete(fnInlineList);

		    var fnInlineIntTree = createFnInlineIntervalTree(model, fnInlineList);
		    model.set("fnInlineIntervalTree", fnInlineIntTree);

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
		     	}

	     	});
	    
	    input.addEventListener("awesomplete-selectcomplete", function(e){
	    	// console.log(e);
	    	var d;
	    	var fnInlineList = model.get("fnInlineList");
	    	for(var i = 0; i<fnInlineList.length; i++){
	    		if(fnInlineList[i].name === e.text.label){
	    			d = fnInlineList[i];
	    			console.log(d);
	    			_highlightEvent(d, null, dataTypes.fnTreeNode);
	    			return;
	    		} 
	    		
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

    	//var width = d3.select("#" + divId).node().clientWidth;
	    //var barWidth = (width - margin.left - margin.right) * 0.8;

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

	    var dblclickHndlr, clickHndlr;

	    if(type=="loop"){    
	        dblclickHndlr = dblclickLoop;
	        clickHndlr = clickLoop;
	    }   else if (type=="inline"){
	    	dblclickHndlr = dblclickInline;
	    	clickHndlr = clickInline;
	    }

	    // Enter any new nodes at the parent's previous position.
	    nodeEnter.append("rect")
	        .attr("y", -barHeight / 2)
	        .attr("height", barHeight)
	        .attr("width", function(data) {

	        	var wid = data.name.length * 9;
	        	return wid; //barWidth;
			})
	        .style("fill", color)
	        .on("click", clickHndlr)
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
	        .classed("invisible", function(d){return d.type == "root";})
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

  function clickInline(d, i) {
  	// console.log(i);
  	// console.log(d);
  	_highlightEvent(d,i,dataTypes.fnTreeNode);
  }

  // highlight and navigate to the loop in the CFG
  function clickLoop(d, i) {
  	// console.log(i);
  	// console.log(d);
  	if(d.type == "loop"){
  		_highlightEvent(d,i, dataTypes.loopTreeNode);	
  	}	else {
  		_highlightEvent(d,i, dataTypes.fnTreeNode);
  	}
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
  		_dataChanged();
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
	
	var loopTree = {name: "root", ref: null, children: [], type: "root"};
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
	var fnInlineTree = {name: "root", ref: null, children: [], type:"root"};
	
	for(var i=0; i<functions.length; i++){
		fnInlineTree.children.push(addFnInlineNode(functions[i], "function"));
	}

	return fnInlineTree;

}

// This function recursively adds children nodes to the curr node of the tree
// params:
//  currObj: the curr obj
function addFnInlineNode(currObj, type="inline"){
	var thisNode = {name: currObj["name"], ref:currObj, children:[], type:type};
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
	var fnLoopTree = {name: "root", ref: null, children: [], type: "root"};
	
	for(var i=0; i<functions.length; i++){
		fnLoopTree.children.push(addLoopNode(functions[i], "function"));
	}

	return fnLoopTree;

}

// This function recursively adds children nodes to the curr node of the tree
// params:
//  currObj: the curr obj
function addLoopNode(currObj, type="loop"){
	var thisNode = {name: currObj["name"], ref:currObj, children:[], type: type};
	if(currObj["loops"] && currObj["loops"].length > 0){
		for(var i=0; i<currObj["loops"].length; i++){
			thisNode.children.push(addLoopNode(currObj["loops"][i]));
		}
	}
	return thisNode;
}


