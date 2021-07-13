// This function makes the code view for the disassembly of the program 
var makeDisassemblyView = function(model, viewId, divId){

  var selectionObj = {
    isMouseDownCurr: false,
    currStart: -1,
    currEnd: -1
  };

  var assemblyArray = model.get('assemblyArray');
  // var list_registers = model.get('list_registers');

  var _observers = makeSignaller();
  var prevFnName = "";

  var _highlightEvent = function(d,i) {
    _observers.notify({
      type: signalType.highlight,
      dataType: dataTypes.assemblyInstr,
      d: d,
      i: i
    });

  };  

  var _fireFocusEvent = function(d,i) {
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

  var _clickEvent = function(d,i){
    _observers.notify({
      type: signalType.click,
      dataType: dataTypes.assemblyInstr,
      d: d,
      i: i
    });
  };

  var _jump_spanly = function( the_cl, d ) {

    var start = "";
    var end = "";
    var span = "<span class='jump_spanly" + the_cl + "'>0x" + the_cl + ": " + d.code + '</span>';

    if( d.startBlock ) {

      start = "<div class='starting_block_label' " +
          "starting_block_label='" + d.blockId + "'>" + d.blockId + '</div>' +
          '<div class="begin"></div>';
    }

    if( d.endBlock ) {
      end = "<div class='end'></div>";
    }

    return start + span + end;
  };


  var _mouseupEvent = function(d, i, selectionObj){
    _observers.notify({
      type: signalType.mouseup,
      dataType: dataTypes.assemblyInstr,
      d: d,
      i: i,
      selectionObj: selectionObj
    })
  };

  var _highlightSelected = function(lines, selectionObj){
    lines.filter(function(d,i){return (i>=selectionObj.currStart && i<=selectionObj.currEnd);})
      .classed("selected", true);
  }

  // #text_assembly
  var _render = function(){

  	  var lines = d3.select("#" + viewId)
		// .html(null)  // clear the element
	    .selectAll("p")
	    .data(assemblyArray);
  	  
	   lines.enter().append("p")
			.html(function(d, i){

			  var the_cl = d.id.toString(16);

			  return _jump_spanly( the_cl, d );
			})
      .classed("highlight", function(d) {return d.highlight;})
      .classed("selected", function(d) {return d.selected;})
      .on("mouseover", function(d, i){
        _fireFocusEvent(d,i);
       })
       .on("mouseout", function(d, i){
        _fireFocusOutEvent(d,i);
       })
       .on("click", function(d, i){
        // _clickEvent(d,i);
        _highlightEvent(d,i);
       })
       .on("mousedown", function(d,i){
        // if(d3.event.shiftKey){
          selectionObj.isMouseDownCurr = true;
          // console.log("start item: " + i);
          selectionObj.currStart = i;
          selectionObj.currEnd = i;

          // model.highlight(data, selectionObj.currStart, selectionObj.currEnd);
          // update(divId, data, selectionObj);

          _highlightSelected(lines, selectionObj);

        // }
      })
      .on("mouseup", function(d,i){
        if(selectionObj.isMouseDownCurr){
          selectionObj.isMouseDownCurr = false;
          // console.log("end item: " + i);
          selectionObj.currEnd = i;

          // model.highlight(data, selectionObj.currStart, selectionObj.currEnd);
                 
          _highlightSelected(lines, selectionObj);
          _mouseupEvent(d,i, selectionObj);
          
        }
      })
    .on("mouseenter", function(d, i){
      if(selectionObj.isMouseDownCurr){
        // console.log("item: " + i);
        selectionObj.currEnd = i;

        // model.highlight(data, selectionObj.currStart, selectionObj.currEnd);
        
        _highlightSelected(lines, selectionObj);

        // detect if a scroll is detected in the window that you are currently looking at
        // Use the immediate mousedown/mouseup as the end index whichever occurs first 

      }
    });

    lines.exit().remove();
		
		lines
        // .classed("empty", function(d){ return !(d.hasMatchingSource);})
        .classed("highlight", function(d) {return d.highlight;})
        .classed("selected", function(d) {return d.selected;});

	  hljs.initHighlightingOnLoad();
	    
  }

  /*
  var _replaceRegNames = function(lines, nonEmptyRegs){

    // lines.text(function(d,i){return "0x" + d.id.toString(16) + ": " + d.code;})
    // go through each line in the disassembly code

    lines.each(function(d){

      var codeStr = d.code; 
      // Iterate through the non empty registers
      // Replace the register name with the source code name
      for(var i = 0; i<nonEmptyRegs.length; i++){

        var pattern = new RegExp(nonEmptyRegs[i].rname, 'gi');
        // codeStr = codeStr.replace(pattern, nonEmptyRegs[i].sname);
        codeStr = codeStr.replace(pattern, "<span class='highlight'>" +
          nonEmptyRegs[i].sname + "</span>");
      }

      this.innerHTML = "0x" + d.id.toString(16) + ": " + codeStr;
      // d3.select(this).text(function(d){return "0x" + d.id.toString(16) + ": " + codeStr; });

    });

  };
  */

  var _replaceVarNames = function(lines, args){

    var currFn = model.getCurrFn();
    
    // If no extra args passed
    // This function was not called because of a change in the variable names or locations
    // To optimize, we can skip re-rendering if we are in the same function
    if(!args){
      // If it is the same function, do not re-render
      if(currFn.name == prevFnName){
        return;
      }
    }

    var currFnVars = currFn.vars;
    if(!currFnVars){
      return;
    } 

    // Disable the reset of variable annotations
    // lines.text(function(d){return "0x" + d.id.toString(16) + ": " + d.code;});

    lines.each(function(d){

      var codeStr = d.code;
      var seen = {};
      var first_loc = false;
      var new_html = "";

      // Iterate through the variables
      // Replace the location with variable name
      for(var i=0; i<currFnVars.length; i++){

        var currVar = currFnVars[i];
        var pattern;

        for(var j=0; j<currVar.locations.length; j++){

          var currLoc = currVar.locations[j];

          // If the code falls under a valid range  
          // NOTE: The range is [closed, open)        
          if( d.id >= parseInt(currLoc.start, 16) && d.id < parseInt(currLoc.end, 16)){

            // If you want to skip matching the register string when its part of a register offset string
            // capture the substring before and after the register name
            // detect if it is part of a register offset
            // perform no substitution for register offsets
            // var patternStr = "([ ,]?\(?)" + currLoc.location + "(\)?)";

            //  only show each highlight "phi" or "phidata", at most once.
            if( !seen[currVar.name] ) {

              pattern = new RegExp(currLoc.location, 'gi');

              if( codeStr.indexOf(currLoc.location) > -1 ) {

                //var strike = new_html === "" ? strike_str : "";
                new_html += "<span class='highlight'>" + currVar.name + "</span> ";
              }
              //codeStr = codeStr.replace(pattern, "<span class='strikethrough'>" + currLoc.location + "</span> " +
              //    "<span class='highlight'>" + currVar.name + "</span>");

              seen[currVar.name] = true;
            }
          }
        }

        //codeStr += new_html;
      }

      var cLoc = currLoc ? (currLoc.location || "") : "";
      var strike_span = "<span class='strikethrough'>" + cLoc + "</span> ";
      var repl = strike_span + new_html;

      if( currLoc && codeStr.indexOf(currLoc.location) > -1) {
        console.log('found it');
        codeStr = codeStr.replace( currLoc.location, repl );
      }

      d.code = codeStr;
    });

    // Perform the rendering at once
    lines.html(function(d){

      return _jump_spanly( d.id.toString(16), d );
    });

    prevFnName = currFn.name;
  };


  var _highlight = function(args){

    var lines = d3.selectAll("#" + viewId + " p");
    
    // get the non-empty registers
    // var nonEmptyRegs = model.getNonEmptyRegNames(list_registers);
    // Replace the register names with the source code names
    // _replaceRegNames(lines, nonEmptyRegs);

    _replaceVarNames(lines, args);

    var found_highlight = false;

  	// d3.selectAll("#" + viewId + " p")
    lines
  		// .data(assemblyArray)
  		.classed("highlight", function(d) {
        if(d.highlight){
          if(!found_highlight){
            found_highlight = true;
            scrollToElement(divId, this);
          }
        }
       return d.highlight;});

  };

  _render();

  return {
    render: function(){
      _render();
      _highlight();
    },

    highlight: function(args){
      _highlight(args);	
    },

    register: function(fxn) {
      _observers.add(fxn);
    }

  };

};
