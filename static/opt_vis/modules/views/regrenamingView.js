// This function creates the register renaming window
// var makeRegRenamingView = function(model, viewId, divId){
var makeRegRenamingView = function(model, viewId){	
	var _observers = makeSignaller();

	var list_registers = model.get('list_registers');

	var _changeEvent = function(d,i,value){
		_observers.notify({
			type:signalType.change,
			dataType:dataTypes.registerName,
			d:d,
			i:i,
			value:value
		});
	};

	// #reg_rename
	var _render = function(){

		// <p> rax: <input type="text" name="rax" value=""> </p>

		var reg_selection = d3.select("#" + viewId)
	      .selectAll("p")
	      .data(list_registers);

	    reg_selection.enter()
	    	.append("p")
	        .text(function(d){return d.rname + ": ";})
	        .append("input")
	        .attr("name", function(d){ return d.rname; })
	        .attr("type", "text")
	        .property("value", function(d){return d.sname;})
	        .on("change", function(d,i){
	          _changeEvent(d,i,this.value);
	          // d.sname = this.value;
	        });
	
		// To avoid cyclic event triggering, the property 'value'
		// is not rewritten on every update

	    // reg_selection.select("input")
	    // 	.property("value", function(d){return d.sname;});
	    
	    reg_selection.exit().remove();

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