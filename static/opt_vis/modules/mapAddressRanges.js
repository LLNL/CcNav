// This class represents a node in the inline or loop tree
function TreeNode(name, ref, children, type){
	this.name = name;
	this.ref = ref;
	this.children = children;
	this.type = type;
}

// This function gets the source lines from address ranges
// Params: 
// 		dataSource: store of data
//		addrRanges: the array of ranges where each range is of the form [low, high]
// Returns an array of source code line numbers
function getSourceLinesFromAddrRanges(dataSource, addrRanges){
	var intervalTree = dataSource["srcIntervalTree"];
	var lines = new Set();

	addrRanges.forEach(range => {
		intervalTree.search(range).forEach(val => {
			lines.add(val.line);
		});
	});

	lines = Array.from(lines);
	return lines;
}

// This function gets basicblocks from addrranges
// Params: 
// 		dataSource: store of data
//		addrRanges: the array of ranges where each range is of the form [low, high]
// Returns an array of basicblocks
function getBBlocksFromAddrRanges(dataSource, addrRanges){
	var intervalTree = dataSource["bbIntervalTree"];
	var bblocks = new Set();

	addrRanges.forEach(range => {
		intervalTree.search(range).forEach(val => {
			bblocks.add(val);
		});
	});

	bblocks = Array.from(bblocks);
	return bblocks;
}

// This function gets the tree for either fn/loops or fn/inlines from address ranges
// Params: 
// 		dataSource: store of data
//		addrRanges: the array of ranges where each range is of the form [low, high]
//	 	type: either strTypes.loop or strTypes.function
// Return:
//	IF type is strTypes.loop - Returns a filtered tree of fn/loops
// 	IF type is strTypes.function - Returns an object 
//		- "root" field contains the filtered tree of fn/inlines
//		- "names" field contains the array of fn/inline names

function getTreeFromAddrRanges(dataSource, addrRanges, type){

	var intervalTree;
	if(type==strTypes.loop){
		intervalTree = dataSource["loopFnIntervalTree"];
	}	else if(type == strTypes.function){
		intervalTree = dataSource["fnInlineIntervalTree"];
	}
	var resultIds = new Set();
	var result = [];

	// Perform query with the addrRanges
	for(var i = 0; i< addrRanges.length; i++){
		var matchIntvls = intervalTree.search(addrRanges[i]);
		for (var j=0; j<matchIntvls.length; j++){
			if(!(resultIds.has(matchIntvls[j]["parentNode"].id))){
				resultIds.add(matchIntvls[j]["parentNode"].id);
				result.push(matchIntvls[j]["parentNode"]);
			}
		}
	}

	// Given the set of nodes, we convert it into an array
	// result = Array.from(result);

	// console.log(result);

	var nameList;
	if (type == strTypes.function){
		nameList = [];
		for (var k = 0; k<result.length; k++){
			nameList.push(result[k].name);
		}
	}

	// Now we create a new tree which is the filtered version of the original tree
	// The map stores the nodes which are keyed by the ids of the nodes
	// As we encounter new ids, we create new nodes and populate their "children" field
	// We also store the reference to the root node  
	var map = {};
	// var root = null;
	var root = {};

	for (var k = 0; k<result.length; k++){
		var node = result[k];
		if(!map[node.id]){	
			map[node.id] = new TreeNode(node.name, node.ref, [], node.type);
		}
		if(!map[node.parent.id]){
			map[node.parent.id] = new TreeNode(node.parent.name, node.parent.ref, [], node.parent.type);
			if(node.parent.type == "root"){
				root = map[node.parent.id];
			}
		}

		map[node.parent.id].children.push(map[node.id]);
	}

	// assert(root, "No root found for the filtered tree");

	if(type == strTypes.loop){
		return root;
	}	else if(type == strTypes.function){
		return {"root": root, "names": nameList};
	}

}

// This function gets fn/loops from address ranges
// Params: 
// 		dataSource: the data store
//		addrRanges: the array of ranges where each range is of the form [low, high]
// Returns a filtered tree of functions and loops based on intersections with 
// the addrRanges
function getLoopsFromAddrRanges(dataSource, addrRanges){
	return getTreeFromAddrRanges(dataSource, addrRanges, strTypes.loop);
}

// This function gets fn/inlines from address ranges
// Params: 
// 		dataSource: the data store
//		addrRanges: the array of ranges where each range is of the form [low, high]
// Returns a filtered tree of functions and inlines based on intersections with 
// the addrRanges
function getFnsFromAddrRanges(dataSource, addrRanges){
	return getTreeFromAddrRanges(dataSource, addrRanges, strTypes.function);
}

// This function gets address ranges from source line numbers
function getAddrRangesFromSrcLines(dataSource, lineNums){

	var addrRanges = [];
	// allLines is sorted on line numbers; can use binary search on it
	var allLines = dataSource.jsonData.lines;

	for(var i=0; i<lineNums.length; i++){
		var index = binarySearch(allLines, "line", 0, allLines.length - 1, lineNums[i]);
		if(index != -1){
			// found a match;
			// add this mapping and find other mappings for the same line
			// NOTE: binary search only finds one matching instance 
			// We are scanning to the left and right of this index till we 
			// see the same value or we are out of bounds

			var thisMap = allLines[index];
			// var thisRange = new AddrRange(thisMap.from, thisMap.to - 1);
			var thisRange = [thisMap.from, thisMap.to - 1];
			addrRanges.push(thisRange);
			var o_index = index;

			index++;
			while( (index < allLines.length) && allLines[index].line == lineNums[i] ){
				// keep adding these ranges
				thisMap = allLines[index];
				// thisRange = new AddrRange(thisMap.from, thisMap.to - 1);
				thisRange = [thisMap.from, thisMap.to - 1];
				addrRanges.push(thisRange);
				index++;
			}

			index = o_index;
			index--;
			while( (index >= 0) && allLines[index].line == lineNums[i] ){
				// keep adding these ranges
				thisMap = allLines[index];
				// thisRange = new AddrRange(thisMap.from, thisMap.to - 1);
				thisRange = [thisMap.from, thisMap.to - 1];
				addrRanges.push(thisRange);
				index--;
			}
		}
	}

	return addrRanges;

}

// This function gets the ranges of instructions from list of basicblock ids
function getAddrRangesFromBBs(dataSource, bblockIds){

	// addr ranges to return
	var addrRanges = [];
	var allBblocks = dataSource.bblocks;
	
	// loop through the bblock ids
	// add the addrRange objects to the list
	for(var i = 0; i<bblockIds.length; i++){
		
		// var index = binarySearch(allBblocks, "id" , 0, allBblocks.length - 1, bblockIds[i]);
		// assert(index != -1, "No matching basicblocks found for this id");
		// var thisBBItem = allBblocks[index];
		
		var thisBBItem = allBblocks[bblockIds[i]];

		// var thisAddrRange = new AddrRange(thisBBItem.start, thisBBItem.end - 1);
		var thisAddrRange = [thisBBItem.start, thisBBItem.end - 1];
		addrRanges.push(thisAddrRange);
		
	}	
	return addrRanges;
}

// This function gets address ranges from list of functions
function getAddrRangesFromFns(dataSource, fns){

	var addrRanges = [];
	for(var i=0; i<fns.length; i++){
		var thisFn = fns[i];
		var type = thisFn.type;
		var accessor = "basicblocks";
		if(type == "function"){
			accessor = "basicblocks";
		}	else if(type == "inline"){
			accessor = "ranges";
		}

		var ref = thisFn.ref;
		var ranges = ref[accessor];

		for(var j=0; j<ranges.length; j++){
			// var thisAddrRange = new AddrRange(ranges[j].start, ranges[j].end - 1);
			var thisAddrRange = [ranges[j].start, ranges[j].end - 1];
			addrRanges.push(thisAddrRange);
		}
	}
	
	return addrRanges;
}

// This function gets address ranges from list of loops
function getAddrRangesFromLoops(dataSource, loops){

	var bblockIds = [];

	// get the list of basicblocks from the loops
	for(var i=0; i<loops.length; i++){
		var thisIds = loops[i].ref.blocks;
		bblockIds = bblockIds.concat(thisIds);
	}

	// remove the duplicates by converting it into a set

	bblockIds = new Set(bblockIds);
	bblockIds = Array.from(bblockIds);

	// get the list of address ranges from basic block ids
	// console.log(getAddrRangesFromBBs(dataSource, bblockIds));

	return getAddrRangesFromBBs(dataSource, bblockIds);

}



