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