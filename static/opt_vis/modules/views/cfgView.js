
 
var makeCFGGraphView = function(model, svgId, divId) {

  var g = model.get('graphNoLabel');
  var g_full = model.get('graph');
  var _observers = makeSignaller();
  var svg;
  var inner;
  var zoom;

  var isBrushEnabled = false; // Brushing does not work well with panning and zooming
                              // Disabled by default

  var brushInitialized = false;                      

  // var numHops = 10;
  // var numHops = 5;
  var numHops = 3;
  var maxNodes = 20;

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

  var _brushEndEvent = function(nodeList){
    _observers.notify({
      type:signalType.brushEndEvent,
      dataType: dataTypes.graphNode,
      nodeList: nodeList

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
    d3.selectAll("#" + svgId + " g.node.enter")
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

      /***** Edit code for stacked bar chart starts here ****/
      
      
      /*** End edit for stacked bar chart **/

      _configureBrush(svg, inner, zoom);

  };

  var _configureBrush = function(svg, inner, zoom){

	// d3.select("#enableBrush_cfg").on("change", function(){
  //    isBrushEnabled = this.checked;

  d3.selectAll("input[name='cfgBrush']").on("change", function(){
      if(this.value === "enableBrush"){
        isBrushEnabled = true;
      } else {
        isBrushEnabled = false;
      }

    if(isBrushEnabled ){
      if(!brushInitialized){
        _setupBrush(svg,inner);
        brushInitialized = true;
      } else {
        _reEnableBrush(svg,zoom);
      }
    } 
    else {
    	_disableBrush(svg,zoom);
    }

  	});

  };

  var _disableBrush = function(svg,zoom){
    svg.call(zoom).on("dblclick.zoom", null);
    svg.select(".brush")
      .classed("invisible", true);
  }

  var _reEnableBrush = function(svg, zoom){
    svg.call(zoom).on("dblclick.zoom", null)
            .on("mousedown.zoom", null)
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);

    svg.select(".brush").classed("invisible", false);

  };

  var _setupBrush = function(svg, inner){

  	svg.call(zoom).on("dblclick.zoom", null)
        .on("mousedown.zoom", null)
        .on("touchstart.zoom", null)
        .on("touchmove.zoom", null)
        .on("touchend.zoom", null);

    var bbox = svg.node().getBBox();
    // console.log("svg bbox");
    // console.log(bbox);

    // var x = d3.scale.linear()
    // .range([0, bbox.width]);
    var x = d3.scale.identity().domain([0, bbox.width]);

    // var y = d3.scale.linear()
    // .range([0, bbox.height]);
    var y = d3.scale.identity().domain([0, bbox.height]);

    // var brush = d3.brush()
    //     .extent([[0,0], [bbox.width, bbox.height]])
    //     .on('brush', _brushed)
    //     .on('end', _brushEnd);

    var brush = d3.svg.brush()
      .x(x)
      .y(y)
      // .on("brush", _brushed)
      .on("brushend", _brushEnd);

    // create svg group with class brush and call brush on it
    // var brushg = inner.append('g')
    var brushg = svg.append('g')
      .attr('class', 'brush')
      .call(brush);

    
    function _brushed(){
      // console.log("brush move");
      // console.log('Brush extent: ' +  brush.extent() );
    };

    function _brushEnd(){
      // console.log('brushend');
      // console.log('Brush empty: ' + brush.empty());
      // console.log('Brush Extent: ' +  brush.extent() );
      // brush.clear();


      var extent = d3.event.target.extent();

      brushg.call(brush.clear());

      var nodeList = [];

      var nodes = svg.selectAll("g.node.enter");

      nodes.classed("selected", function(d){
      	var rect = d3.select(this).select("rect");

      	var parsedTransform = getParsedTransform(d3.select(this));
      	
      	var rectPts = getRectPoints(rect);
      	var transformedRectPts = transformRectPoints(rectPts, parsedTransform);

      	var parsedInnerTransform = getParsedTransform(inner);
      	transformedRectPts = transformRectPoints(transformedRectPts, parsedInnerTransform);

      	// console.log(d);
      	// console.log(transformedRectPts);
      	// console.log("extent: " + extent);
      	// console.log(doRectsIntersect(extent, transformedRectPts));

      	if(doRectsIntersect(extent, transformedRectPts)){
      		nodeList.push(d);
          return true;
      	}
      	return false;

      });

      _brushEndEvent(nodeList);
      
    };

  };

  

  

  var _renderFiltered = function(){

  	// Get the highlighted nodes in the graph
  	var setOfNodes = model.getHighlightedNodes(g);

  	// If the highlighted set is empty, set the first node of the graph as the filtering set
  	if(setOfNodes.length == 0){
  		setOfNodes = [g.nodes()[0]];
  	}

  	// console.log("setOfNodes");
  	// console.log(setOfNodes);

  	var filtered_graph = getKHopGraph(g, setOfNodes, numHops, maxNodes);
  	// console.log(filtered_graph);

  	svg = d3.select('#' + svgId);
    inner = d3.select('#' + svgId + ' g');
    clearSVG(inner.node());

    // Render the graphlib object using d3.
    var renderer = new dagreD3.Renderer();
    // renderer.run(g, d3.select("#graphContainer g"));

    // Render the modified file (output from loopified code) i.e. 
    // the file with invisible edges, ports etc.

    var is_lc = function() {
      return location.origin.indexOf("lc.llnl.gov") > -1;
    };

    // var server_dir = is_lc() ? "ajax/findLoops.cgi" : "../findLoops/";

    var server_dir = "";
    if(is_lc()){
      server_dir = "ajax/findLoops.cgi";
    } else if(isXAMPP()){
      server_dir = "ajax/findLoops_xampp.cgi";
    } else {
      server_dir = "../findLoops/";
    }

    /*** loopify dagre ***/
    d3.xhr( server_dir )
        .header("Content-Type", "text/plain")
        // .post(dotFile,
        // .post(graphlibDot.write(g),
        .post(graphlibDot.write(filtered_graph),
          
          function(err, result){
          	loopsObj = JSON.parse(result.responseText);
            // model.set("loopsObj",loopsObj);
            // console.log(loopsObj);
            
            // dotFile = graphlibDot.write(g);
            dotFile = graphlibDot.write(filtered_graph);
            // model.set("dotFile", dotFile);
            // console.log(dotFile);
            
            // loopify_dagre.init(dotFile, loopsObj, model.get("nodesAll"), 
            // 	model.get("edgesAll"), model.get("edgeLabelsAll"));
            loopify_dagre.init(dotFile, loopsObj);
            var modifiedDotFile = loopify_dagre.modifiedDotFile;
            // console.log(modifiedDotFile);
            graph_to_display = graphlibDot.parse(modifiedDotFile);

            // renderer.run(filtered_graph, d3.select('#' + svgId + ' g'));
            renderer.run(graph_to_display, d3.select('#' + svgId + ' g'));

            // fillNodesandEdges(filtered_graph, svgId);
            fillNodesandEdges(graph_to_display, svgId);

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
            d3.selectAll('#' + svgId + " g.node.enter")
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

            loopify_dagre.addBackground("bgFill", "graphContainer");

              // .call(drag);

              _highlight();

              /***** Edit code for stacked bar chart starts here ****/
              
              
              /*** End edit for stacked bar chart **/

              _configureBrush(svg, inner, zoom);

            });

    /******/

  };

  var _highlight = function(){

    var graph_nodes = g.nodes();
    var found_highlight = false;

    // Note: Does caching this d3 selection and storing it in the view
    // make it faster?
    d3.selectAll('#' + svgId + " g.node.enter")
    	// .data(graph_nodes, function(d){return d;})
    	.classed("highlight", function(d){
        if (g.node(d).highlight){

          if(!found_highlight) {
            found_highlight = true;
            _centerToNode(d3.select(this));
          }
        }
    		return g.node(d).highlight;
    	})
    	.classed("selected", function(d){
    		return g.node(d).selected;
    	})
    	;

    // _highlightBackEdges();

  };

  var _highlightBackEdges = function(){

    var loopsObj = model.get("loopsObj");
    var edgesAll = model.get("edgesAll");

    console.log(loopsObj);
    console.log(edgesAll);
    
    d3.selectAll('#' + svgId + " g.edgePath.enter")
      .classed("backedge", false);

    for(var i=0; i<loopsObj.length; i++){
      backedge = loopsObj[i].backedge;
      edgeId = g.outEdges(backedge[0], backedge[1])[0];
      edgesAll[edgeId].classed("backedge", true);
    }

  }

  // _render();
  _renderFiltered();

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
        .select("#tp_value")
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
      
      // _render();
      _renderFiltered();
      // _highlight();  // This is done inside the render function since it uses an async call
  },

    highlight: function(){
      
      _renderFiltered();
      // _highlight();  // This is done inside the render function since it uses an async call
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

  // model.set("nodesAll", {});
  // model.set("edgesAll", {});
  // model.set("edgeLabelsAll", {});

  // var nodesAll = model.get("nodesAll");
  // var edgesAll = model.get("edgesAll");
  // var edgeLabelsAll = model.get("edgeLabelsAll");

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

    d3.selectAll('#' + svgId + " g.node.enter")
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

    d3.selectAll('#' + svgId + " g.edgePath.enter")
      .each(function(d){

      	//[BUG]: Found a bug when removing invisible edges (created by loopify module) in CFGExplorer 
        // if(!(g.hasEdge(d))){
        //   d3.select(this).remove(); 
        //   return;
        // }

        if(g.edge(d).style === "invis"){
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

    d3.selectAll('#' + svgId + " g.edgeLabel.enter")
      .each(function(d){
        
        //[BUG]: Found a bug when removing invisible edges (created by loopify module) in CFGExplorer 
        // if(!(g.hasEdge(d))){
        //   d3.select(this).remove(); 
        //   return;
        // }

        if(g.edge(d).style === "invis"){
        	d3.select(this).remove();
        	return;
        }

        edgeLabelsAll[d] = d3.select(this);
      }); 

}



