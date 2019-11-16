var makeModel = function() {

  /*
  var list_registers = ["rax", "rdx", "rcx", "rbx", "rsi", "rbp", "rsp", "rdi", 
    "eax", "edx", "ecx", "ebx", "esi", "ebp", "esp", "edi",
    "r8", "r9", "r10", "r11", "r12", "r13", "r14", "r15", 
    "xmmm0", "xmmm1", "xmmm2", "xmmm3", "xmmm4", "xmmm5", "xmmm6", "xmmm7", 
    "xmmm8", "xmmm9", "xmmm10", "xmmm11", "xmmm12", "xmmm13", "xmmm14", "xmmm15"];
  */

  var list_registers = [{rname:"rax", sname:""}, {rname:"rdx", sname:""}, {rname:"rcx", sname:""}, {rname:"rbx", sname:""}, 
    {rname:"rsi", sname:""}, {rname:"rbp", sname:""}, {rname:"rsp", sname:""}, {rname:"rdi", sname:""}, 
    {rname:"eax", sname:""}, {rname:"edx", sname:""}, {rname:"ecx", sname:""}, {rname:"ebx", sname:""},
    {rname:"esi", sname:""}, {rname:"ebp", sname:""}, {rname:"esp", sname:""}, {rname:"edi", sname:""},
    {rname:"r8", sname:""}, {rname:"r9", sname:""}, {rname:"r10", sname:""}, {rname:"r11", sname:""}, 
    {rname:"r12", sname:""}, {rname:"r13", sname:""}, {rname:"r14", sname:""}, {rname:"r15", sname:""}, 
    {rname:"xmmm0", sname:""}, {rname:"xmmm1", sname:""}, {rname:"xmmm2", sname:""}, {rname:"xmmm3", sname:""},
    {rname:"xmmm4", sname:""}, {rname:"xmmm5", sname:""}, {rname:"xmmm6", sname:""}, {rname:"xmmm7", sname:""}, 
    {rname:"xmmm8", sname:""}, {rname:"xmmm9", sname:""}, {rname:"xmmm10", sname:""}, {rname:"xmmm11", sname:""},
    {rname:"xmmm12", sname:""}, {rname:"xmmm13", sname:""}, {rname:"xmmm14", sname:""}, {rname:"xmmm15", sname:""}];

  // Our state is the values in the _dataStore array
	// and the highlight/unhighlight state

  // This function returns all the registers with non-empty names
  var getNonEmptyRegNames = function(list_registers){
    var toReturn = [];
    for(var i=0; i<list_registers.length; i++){
      if(list_registers[i].sname!=""){
        toReturn.push(list_registers[i]);
      }
    }

    return toReturn;
  }; 

  var getHighlightedNodes = function(g){

    var highlighted_nodes = [];

    var graph_nodes = g.nodes();
    for(var i = 0; i<graph_nodes.length; i++){
      if(g.node(graph_nodes[i]).highlight){
        highlighted_nodes.push(graph_nodes[i]);
      }
    }

    return highlighted_nodes;

  };

  // get the function with the currently highlighted basic block
  var getCurrFn = function(){
    // get current highlighted basic blocks
    // pick the first block and return the function object
    // [NOTE]: Can support multiple functions in the future version

    var g = _dataStore.graphNoLabel;
    var g_full = _dataStore.graph;
    var highlighted_nodes = getHighlightedNodes(g);
    
    if(highlighted_nodes.length == 0){
      return {};
    }

    var fnName = getFunctionFromLabel(g_full.node(highlighted_nodes[0]).label);

    var allFunctions = _dataStore.jsonData.functions;
    var toReturn = {};

    // [NOTE]: Make another map from function name to array entry if the
    // number of functions is too high to loop over them
    for(var i=0; i<allFunctions.length; i++){
      if(allFunctions[i].name == fnName){
        toReturn = allFunctions[i];
        break;
      }
    }
    return toReturn;

  };

  var getCurrFnName = function(){
    var g = _dataStore.graphNoLabel;
    var g_full = _dataStore.graph;
    var highlighted_nodes = getHighlightedNodes(g);
    
    if(highlighted_nodes.length == 0){
      return "";
    }

    var fnName = getFunctionFromLabel(g_full.node(highlighted_nodes[0]).label);
    return fnName;
  };

  var addEmptyVar = function(currFnVars){
    var newVar = {name:"", file:"", line:"", locations:[]};
    currFnVars.push(newVar);
  };

  var addEmptyLocation = function(currVarLocs){
    var newLoc = {start:"", end:"", location:""};
    currVarLocs.push(newLoc);
  };

  var _updateCGHighlight = function(){
    var currFnName = getCurrFnName();
    var callGraph = _dataStore.callGraph;
    var callgraph_nodes = callGraph.nodes();

    for(var i=0; i<callgraph_nodes.length; i++){
      
      if(callgraph_nodes[i] == currFnName){
        callGraph.node(callgraph_nodes[i]).highlight = true; 
      } else {
        callGraph.node(callgraph_nodes[i]).highlight = false;
      }
    }
  }; 

  var _dataStore = {
    assemblyArray: ASSEMBLY_ARRAY,
    graph: g_full,
    jsonData: JSON_DATA,
    sourceArray: SRC_CODE_ARRAY,
    nodesAll: nodesAll,
    edgesAll: edgesAll,
    edgeLabelsAll: edgeLabelsAll,
    inlineTree: tree_data,
    graphNoLabel: g,
    isTooltipEnabled: true,
    callGraph: {},

    // loopsObj: loopsObj,
    // dotFile: dotFile,

    list_registers: list_registers 
  };

  // List of views that will listen for changes
  var _observers = makeSignaller();

  return {
    highlight: function(args){

      // This is the object that the event is executed on
    	var d = args.d;
      // This is the datatype of the object that the event is executed on
      var dataType = args.dataType;
      
      switch (dataType) {
      	case dataTypes.sourceCodeLine:

      		// Instead of the source code object, we use the index of the object in the array
      		// (or line number - 1)
      		d = args.i;

      		for(var i = 0; i < _dataStore.sourceArray.length; i++){
      			_dataStore.sourceArray[i].highlight = false;
      		}

      		_dataStore.sourceArray[d].highlight = true;

          // The list of assembly instructions that correspond to the 
          // given line of source code
      		var highlighted_assembly = getAssemblyFromSource(d, _dataStore);

      		// console.log(highlighted_assembly);

          // The list of graph nodes that correspond to the given line of source code
      		var highlighted_nodes = getNodesFromSource(d, _dataStore, highlighted_assembly);

      		// Reset the highlight of every items
      		
      		for(var i = 0; i < _dataStore.assemblyArray.length; i++){
      			_dataStore.assemblyArray[i].highlight = false;
      		}

      		for (var i = 0; i< highlighted_assembly.length; i++){
      			highlighted_assembly[i].highlight = true;
      		}

      		var graph_nodes = _dataStore.graphNoLabel.nodes();

      		// Reset the highlight of every items
      		for(var i = 0; i < graph_nodes.length; i++){
      			_dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
      		}

      		for (var i = 0; i< highlighted_nodes.length; i++){
      			_dataStore.graphNoLabel.node(highlighted_nodes[i]).highlight = true;
      		}

      		_updateCGHighlight();

      	break;

      	case dataTypes.assemblyInstr:

      		// d = _dataStore.assemblyArray[d.index];
          
          // TODO: This should be handled during the event handling
          // if(!d) {
          //   return;
          // }

      		for(var i=0; i < _dataStore.assemblyArray.length; i++){
      			_dataStore.assemblyArray[i].highlight = false;
      		}

          
      		d.highlight = true;

          // The list of source code lines that correspond to the 
          // given line of assembly code  
      		var highlighted_source = getSourceFromAssembly(d, _dataStore);
          // The list of graph nodes that correspond to the 
          // given line of assembly code
      		var highlighted_nodes = getNodesFromAssembly(d, _dataStore);

      		// Reset the highlight of every items
      		
      		for(var i = 0; i < _dataStore.sourceArray.length; i++){
      			_dataStore.sourceArray[i].highlight = false;
      		}

      		for (var i = 0; i< highlighted_source.length; i++){
      			highlighted_source[i].highlight = true;
      		}

      		var graph_nodes = _dataStore.graphNoLabel.nodes();

      		// Reset the highlight of every items
      		for(var i = 0; i < graph_nodes.length; i++){
      			_dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
      		}

      		for (var i = 0; i< highlighted_nodes.length; i++){
      			_dataStore.graphNoLabel.node(highlighted_nodes[i]).highlight = true;
      		}

          _updateCGHighlight();

      	break;

      	case dataTypes.graphNode:

      		var graph_nodes = _dataStore.graphNoLabel.nodes();

      		for(var i=0; i < graph_nodes.length; i++){
      			_dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
      		}

          _dataStore.graphNoLabel.node(d).highlight = true;

          
      		// The list of assembly code that correspond to the given graph node
          var highlighted_assembly = getAssemblyFromGraphNode(d, _dataStore);
          // The list of source code lines that correspond to the 
          // given graph node
          var highlighted_source = getSourceFromGraphNode(d, _dataStore, highlighted_assembly);
          // console.log(highlighted_source);

      		// Reset the highlight of every items
      		
      		for(var i = 0; i < _dataStore.sourceArray.length; i++){
      			_dataStore.sourceArray[i].highlight = false;
      		}

      		for (var i = 0; i< highlighted_source.length; i++){
      			highlighted_source[i].highlight = true;
      		}

      		// Reset the highlight of every items
      		for(var i = 0; i < _dataStore.assemblyArray.length; i++){
      			_dataStore.assemblyArray[i].highlight = false;
      		}

      		for (var i = 0; i< highlighted_assembly.length; i++){
      			highlighted_assembly[i].highlight = true;
      		}

          _updateCGHighlight();

      	break;

        case dataTypes.callGraphNode:

          var callgraph_nodes = _dataStore.callGraph.nodes();
          for(var i=0; i<callgraph_nodes.length; i++){
            _dataStore.callGraph.node(callgraph_nodes[i]).highlight = false;
          }

          // if(_dataStore.callGraph.node(d)){
            _dataStore.callGraph.node(d).highlight = true;
          // }

          // Only update the callGraph view
          _observers.notifyWithTag(viewTypes.viewCallGraph);
          return;
          break;

      	default:
      		return;
      		break;
      }

      _observers.notify();
    },

    rangeSelect: function(args){

      
      switch(args.dataType){

        case dataTypes.sourceCodeLine:
          var selectionObj = args.selectionObj;
          var currStart = selectionObj.currStart;
          var currEnd = selectionObj.currEnd;

          for(var i=0; i<_dataStore.sourceArray.length; i++){
            if(i>= currStart && i<=currEnd){
              _dataStore.sourceArray[i].highlight = true;
              _dataStore.sourceArray[i].selected = true;
            } else {
              _dataStore.sourceArray[i].highlight = false;
              _dataStore.sourceArray[i].selected = false;
            }
          }

          // The list of assembly instructions that correspond to the given lines of source code
          var highlighted_assembly = getAssemblyFromSourceLines(currStart, currEnd, _dataStore);
          // The list of graph nodes that correspond to the given lines of source code
          var highlighted_nodes = getNodesFromSourceLines(currStart, currEnd, _dataStore, highlighted_assembly);

          // Reset the highlight and selected of every items

          for(var i=0; i < _dataStore.assemblyArray.length; i++){
            _dataStore.assemblyArray[i].highlight = false;
            _dataStore.assemblyArray[i].selected = false;
          }

          for(var i=0; i<highlighted_assembly.length; i++){
            highlighted_assembly[i].highlight = true;

          }

          var graph_nodes = _dataStore.graphNoLabel.nodes();

          // Reset the highlight and selected of every items
          for(var i = 0; i < graph_nodes.length; i++){
            _dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
            _dataStore.graphNoLabel.node(graph_nodes[i]).selected = false;
          }

          for (var i = 0; i< highlighted_nodes.length; i++){
            _dataStore.graphNoLabel.node(highlighted_nodes[i]).highlight = true;
          }

          _updateCGHighlight();

          _observers.notify();

          break;

        case dataTypes.assemblyInstr:
          var selectionObj = args.selectionObj;
          var currStart = selectionObj.currStart;
          var currEnd = selectionObj.currEnd;

          for(var i=0; i<_dataStore.assemblyArray.length; i++){
            if(i >= currStart && i<=currEnd){
              _dataStore.assemblyArray[i].highlight = true;
              _dataStore.assemblyArray[i].selected = true;
            } else {
              _dataStore.assemblyArray[i].highlight = false;
              _dataStore.assemblyArray[i].selected = false;
            }
          }

          // The list of source code lines that correspond to the given lines of assembly code
          var highlighted_source = getSourceFromAssemblyLines(currStart, currEnd, _dataStore);
          // The list of graph nodes that correspond to the given lines of assembly code
          var highlighted_nodes = getNodesFromAssemblyLines(currStart, currEnd, _dataStore);

          // Reset the highlight and selected of every items
          for(var i=0; i<_dataStore.sourceArray.length; i++){
            _dataStore.sourceArray[i].highlight = false;
            _dataStore.sourceArray[i].selected = false;
          }

          for(var i=0; i<highlighted_source.length; i++){
            highlighted_source[i].highlight = true;
          }

          var graph_nodes = _dataStore.graphNoLabel.nodes();

          // Reset the highlight and selected of every nodes
          for(var i=0; i<graph_nodes.length; i++){
            _dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
            _dataStore.graphNoLabel.node(graph_nodes[i]).selected = false;
          }

          for(var i=0; i<highlighted_nodes.length; i++){
            _dataStore.graphNoLabel.node(highlighted_nodes[i]).highlight = true;
          }

          _updateCGHighlight();
          _observers.notify();

          break;

        case dataTypes.graphNode:

          var graph_nodes = _dataStore.graphNoLabel.nodes();

          var selected_nodeList = args.nodeList;

          for(var i=0; i<graph_nodes.length; i++){
            _dataStore.graphNoLabel.node(graph_nodes[i]).highlight = false;
            _dataStore.graphNoLabel.node(graph_nodes[i]).selected = false;
          }

          for(var i=0; i<selected_nodeList.length; i++){
            _dataStore.graphNoLabel.node(selected_nodeList[i]).highlight = true;
            _dataStore.graphNoLabel.node(selected_nodeList[i]).selected = true;
          }

          // The list of assembly code that correspond to the given graph node
          var highlighted_assembly = getAssemblyFromGraphNodeList(selected_nodeList, _dataStore);
          // The list of source code lines that correspond to the given graph nodes
          var highlighted_source = getSourceFromGraphNodeList(selected_nodeList, _dataStore, highlighted_assembly);

          // Reset the highlight and selected of every items
          for(var i = 0; i < _dataStore.sourceArray.length; i++){
            _dataStore.sourceArray[i].highlight = false;
            _dataStore.sourceArray[i].selected = false;
          }

          for (var i = 0; i< highlighted_source.length; i++){
            highlighted_source[i].highlight = true;
          }

          // Reset the highlight of every items
          for(var i = 0; i < _dataStore.assemblyArray.length; i++){
            _dataStore.assemblyArray[i].highlight = false;
            _dataStore.assemblyArray[i].selected = false;
          }

          for (var i = 0; i< highlighted_assembly.length; i++){
            highlighted_assembly[i].highlight = true;
          }

          _updateCGHighlight();
          _observers.notify();

          break;

        case dataTypes.callGraphNode:

          break;

        default:

          break;

      }

    }

    ,

    focus: function(args){

    	// TODO: Implement the focus logic here

      // _observers.notify();
    },

    focusOut: function(args){


      // TODO: Implement the focus out logic here	
      // _observers.notify();
    }, 

    click: function(args){

    	// TODO: Implement the click logic here
    	// _observers.notify();
    },

    change: function(args){

    	var dataType = args.dataType;

    	switch(dataType){
    		case dataTypes.registerName:
		    	var d = args.d;
		    	d.sname = args.value.trim();
          // console.log(d.rname + ": " + d.sname );
		    	
          // Only re-render the disassembly view because register renaming only changes
          // the disassembly
          _observers.notifyWithTag(viewTypes.viewDisassembly, {"changed":true});

      		break;

        case dataTypes.varName:
          var d = args.d;
          var elemType = args.elemType;

          switch(elemType){
            case elemTypes.location:
              d.location = args.value.trim();
              break;

            case elemTypes.start:
              d.start = args.value.trim();
              break;

            case elemTypes.end:
              d.end = args.value.trim();
              break;

            case elemTypes.name:
              d.name = args.value.trim();
              break;
          }

          // Only re-render the disassembly view because variable renaming only changes
          // the disassembly
          _observers.notifyWithTag(viewTypes.viewDisassembly, {"changed":true});

          break;  

      		default:
      			// return;
      			break;
      	}

      // Do not re-render every view
    	// _observers.notify();

    },

    add: function(args){
      
      var dataType = args.dataType;

      switch(dataType){
        case dataTypes.varName:
          var elemType = args.elemType;
          switch(elemType){
            case elemTypes.name:
              addEmptyVar(args.currElem);
              break;
            case elemTypes.location:
              addEmptyLocation(args.currElem);
              break;
          }
          // Only re-render the variable renaming window
          _observers.notifyWithTag(viewTypes.viewVarRenamer, {"added":true});
          break;

      }
    },

    getHighlightedNodes: getHighlightedNodes,

    getNonEmptyRegNames: getNonEmptyRegNames,

    getCurrFn: getCurrFn,

    get: function(key) {
      return _dataStore[key];
    },

    set: function(key, val){
      _dataStore[key] = val;
    },

    register: function(fxn) {
      _observers.add(fxn);
    },

    registerWithTag: function(fxn, tag){
      _observers.addWithTag(fxn, tag);
    }

  };

}