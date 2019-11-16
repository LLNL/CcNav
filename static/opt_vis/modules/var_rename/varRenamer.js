var elemTypes = {
	location: "LOCATION",
	start: "START",
	end: "END",
	name: "NAME"
};

// This function creates the variable renaming window
// var makeVarRenamingView = function(model, viewId, divId){
var makeVarRenamingView = function(model, viewId){	
	var _observers = makeSignaller();

	// var list_registers = model.get('list_registers');
	
	var _changeEvent = function(d,i,value, elemType){
		_observers.notify({
			type:signalType.change,
			dataType:dataTypes.varName,
			d:d,
			i:i,
			value:value,
			elemType:elemType
		});
	};

	var _addEvent = function(elemType, currElem){
		_observers.notify({
			type:signalType.add,
			dataType:dataTypes.varName,
			elemType:elemType,
			currElem:currElem
		});
	};

	var prevFnName = "";

	// #reg_rename
	var _render = function(args){

		/*
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
	    */

	    var currFn = model.getCurrFn();
	    // console.log(currFn);

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

		var fnWindow = d3.select("#" + viewId);
		fnWindow.select("#fnName")
			.text(currFn.name);

		fnWindow.select("#btnAddVar")
			.on("click", function(){
				_addEvent(elemTypes.name, currFnVars);
			});

		fnWindow.select(".varsHolder")
			.selectAll(".var").data([]).exit().remove();

		var varsSelection = fnWindow.select(".varsHolder")
			.selectAll(".var")
			.data(currFnVars);

		varsSelection.enter()
			.append("div")
			.classed("var", true)
			.html( d3.select(".template_var").node().innerHTML) // .replace(/invisible/g, ''))
			.select(".varName")
			// .text(function(d){ return d.name;})
			.property("value", function(d){return d.name;})
			.on("change", function(d,i){
				_changeEvent(d,i,this.value, elemTypes.name);
			});
		
		// To avoid cyclic event triggering, the property 'value' is not 
		// rewritten on every update
		/*
		varsSelection
			.select(".varName")
			// .text(function(d){ return d.name;})
			.property("value", function(d){return d.name;});
		*/

		varsSelection
			.select(".btnAddLoc")
			.on("click", function(d, i){
				console.log("Add location clicked");
				console.log(d);
				console.log(i);
				_addEvent(elemTypes.location, d.locations);
			});

		varsSelection.exit().remove();

		var varLocsSelection = varsSelection.select(".locationsHolder")
			.selectAll("div")
			.data(function(d){ return d.locations; });

		varLocsSelection.enter()
			.append("div")
			.html( d3.select(".template_locHolder").node().innerHTML) // .replace(/invisible/g, ''))
			.classed("template_locHolder", true);
		
		varLocsSelection
			.select(".location")
			// .text(function(d){return d.location;});
			.property("value", function(d){return d.location;})
	        .on("change", function(d,i){
	          _changeEvent(d,i,this.value, elemTypes.location);
	        });

		varLocsSelection			
			.select(".start")
			// .text(function(d){return d.start;});
			.property("value", function(d){return d.start;})
	        .on("change", function(d,i){
	          _changeEvent(d,i,this.value, elemTypes.start);
	        });

		varLocsSelection
			.select(".end")
			// .text(function(d){return d.end;});
			.property("value", function(d){return d.end;})
	        .on("change", function(d,i){
	          _changeEvent(d,i,this.value, elemTypes.end);
	        });

		varLocsSelection.exit().remove();
		
		prevFnName = currFn.name;

	}

	_render();

	return {
		render: function(args){
			_render(args);
		},

		register: function(fxn){
			_observers.add(fxn);
		}
	};

}