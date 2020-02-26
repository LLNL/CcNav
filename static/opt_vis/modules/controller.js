var makeController = function(model) {

  var _highlight = function(args){
    model.highlight(args);
  }

  var _focus = function (args) {
    model.focus(args);
  }

  var _focusOut = function (args) {
    model.focusOut(args);
  }

  var _click = function(args) {
    model.click(args);
  }

  var _change = function(args){
  	model.change(args);
  }

  var _add = function(args){
    model.add(args);
  }

  var _rangeSelect = function(args){
    model.rangeSelect(args);
  }

  return {

    dispatch: function(evt){
    
      switch(evt.type) {

        case signalType.highlight:
          _highlight(evt);
          break;

        case signalType.focus:
          _focus(evt);
          break;

        case signalType.focusOut:
          _focusOut(evt);
          break;

        case signalType.click:
          _click(evt);
          break;

        case signalType.change:
        	_change(evt);
        	break;

        case signalType.add:
          _add(evt);
          break;

        case signalType.mouseup:
          _rangeSelect(evt);
          break;

        case signalType.brushEndEvent:
          _rangeSelect(evt);
          break;

        default:
          console.log('Unknown Event Type: ', evt);
      }
    }
  };

}