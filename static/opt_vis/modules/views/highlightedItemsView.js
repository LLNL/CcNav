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

    src_selection.text(function(d){return (d.item.lineNum + 1) + ": " + d.item.code;});
    src_selection.classed("start", function(d) {return d.start;});
    src_selection.exit().remove();

    assembly_selection.enter()
      .append("p")
      .text(function(d){return "0x" + d.item.id.toString(16) + ": " + d.item.code});

    assembly_selection.text(function(d){return "0x" + d.item.id.toString(16) + ": " + d.item.code});
    assembly_selection.classed("start", function(d) {return d.start;});
    assembly_selection.exit().remove();

    graphNode_selection.enter()
      .append("p")
      .text(function(d){return d});

    graphNode_selection.text(function(d){return d});
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