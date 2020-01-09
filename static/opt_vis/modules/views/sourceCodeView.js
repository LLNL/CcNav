var makeSourceCodeView = function(model, viewId, divId){

  var selectionObj = {
    isMouseDownCurr: false,
    currStart: -1,
    currEnd: -1
  };

  var sourceArray = model.get('sourceArray');
  var _observers = makeSignaller();

  var _highlightEvent = function(d,i) {
    _observers.notify({
      type: signalType.highlight,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i
    });

  };  

  var _fireFocusEvent = function(d,i) {
    _observers.notify({
      type: signalType.focus,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i
    });

  };

  var _fireFocusOutEvent = function(d,i) {
    _observers.notify({
      type:signalType.focusOut,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i
    });
  };

  var _clickEvent = function(d,i){
    _observers.notify({
      type: signalType.click,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i
    });
  };

  var _mouseupEvent = function(d, i, selectionObj){
    _observers.notify({
      type: signalType.mouseup,
      dataType: dataTypes.sourceCodeLine,
      d: d,
      i: i,
      selectionObj: selectionObj
    })
  };

  var _highlightSelected = function(lines, selectionObj){
  	lines.filter(function(d,i){return (i>=selectionObj.currStart && i<=selectionObj.currEnd);})
  		.classed("selected", true);
  }

  // #text_src
  var _render = function(){

      //  get rid of all the old <p> so that new ones can be updated.
      d3.select("#" + viewId + "").remove();

      $('#left pre').append('<code id="' + viewId + '" class="js"></code>');

      var lines = d3.select("#" + viewId)
    // .html(null)  // clear the element
      .selectAll("p")
      .data(sourceArray);


     lines.enter().append("p")
      .text(function(d, i){

        return (i+1) + ": " + d.code;
      })
      .classed("empty", function(d){ return !(d.hasMatchingAssembly);})
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
        .classed("empty", function(d){ return !(d.hasMatchingAssembly);})
        .classed("highlight", function(d) {return d.highlight;})
        .classed("selected", function(d) {return d.selected;});

    hljs.initHighlightingOnLoad();
      
  }

  var _highlight = function(){

    var found_highlight = false;

    d3.selectAll("#" + viewId + " p")
      .data(sourceArray)
      .classed("highlight", function(d) {
        if(d.highlight){
          if(!found_highlight){
            found_highlight = true;
            scrollToElement(divId, this);
          }
        }
       return d.highlight;})
      .classed("selected", function(d) {return d.selected;});

  };

  _render();

  return {
    render: function(){
      _render();
      _highlight();
    },

    highlight: function(){
      _highlight(); 
    },

    register: function(fxn) {
      _observers.add(fxn);
    }

  };

}