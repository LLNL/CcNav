// This function clears the given svg
// The input svg can be obtained as document.getElementById(svgId) 
// or d3.select('#' + svgId).node()
// or using the 'this' keyword inside the d3's event handlers or 'each' function call

function clearSVG(svg){
  while (svg.firstChild) {
    svg.removeChild(svg.firstChild);
  }
}

function categ_color(n) {
  var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", 
  "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", 
  "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colors[n % colors.length];
}

// This function scrolls the container to the position of the given element
// Params: containerId: id of the containing element (e.g. top-level panel)
//         node: the html node of the element we are scrolling to
function scrollToElement(containerId, node){
  d3.select("#" + containerId).node().scrollTop = node.offsetTop - 8;
}

// This function scrolls the container to the position of the given element
// in the treeView
// Params: containerId: id of the containing element (e.g. top-level panel)
//         node: the html node of the element we are scrolling to
function scrollToElemTreeView(containerId, node, marginTop, marginLeft){
  var transform = d3.transform(d3.select(node).attr("transform"));
  // var translateX = transform.translate[0];
  var translateY = transform.translate[1];
  d3.select("#" + containerId).node().scrollTop = marginTop + translateY - 12;
}

// axis-aligned rectangle collision
function doesBrushIntersect(extent, x, y, width, height){
  return doRectsIntersect(extent, [[x,y], [x+width, y+height]]);
}

// rect1 and rect2 defined as [[x0,y0], [x1,y1]]
// where x0 <= x1 and y0 <= y1
// axis-aligned rectangle collision
function doRectsIntersect(rect1, rect2){
  return (rect2[0][0] < rect1[1][0] && rect2[1][0] > rect1[0][0]
      && rect2[0][1] < rect1[1][1] && rect2[1][1] > rect1[0][1]);
}

// returns translate and scale given the element
// returns {translate: [tx,ty], scale: [scalex, scaley]}
function getParsedTransform(elem){
  var transformText = elem.attr("transform");
  var translate = d3.transform(transformText).translate;  // [tx,ty]
  var scale = d3.transform(transformText).scale;
  return {translate: translate, scale:scale};

}

// returns [[x0,y0], [x1,y1]]
// where x0 <= x1 and y0 <= y1
function getRectPoints(rect){
  var x = Number(rect.attr("x"));
  var y = Number(rect.attr("y"));
  var height = Number(rect.attr("height"));
  var width = Number(rect.attr("width"));

  return [[x,y], [x+width, y+height]];

}

// transforms the rectpoints as follows:
// x = x*scale + tx
// y = y*scale + ty
// returns the transformed points
// modifies the input points
function transformRectPoints(rectPts, parsedTransform){
  rectPts[0][0] = rectPts[0][0] * parsedTransform.scale[0] + parsedTransform.translate[0];
  rectPts[1][0] = rectPts[1][0] * parsedTransform.scale[0] + parsedTransform.translate[0];

  rectPts[0][1] = rectPts[0][1] * parsedTransform.scale[0] + parsedTransform.translate[1];
  rectPts[1][1] = rectPts[1][1] * parsedTransform.scale[0] + parsedTransform.translate[1];

  return rectPts;

}


// This function checks if the website is hosted inside LLNL servers. Checks the hostname
// for the string "llnl"
function isHostLLNL(){
  return document.location.hostname.includes('llnl');
}

// This function checks if the website is hosted using XAMPP. Checks the pathname for 
// the string "xampp"
function isXAMPP(){
  return document.location.pathname.includes("xampp");
}

var is_lc = function() {
  return location.origin.indexOf("lc.llnl.gov") > -1;
};

// This function takes an array of intervals and finds the max and min of the endpoints
// Params: 
//		arrIntervals: array of intervals
//		highAccessor: the field for accessing the high value 
//		lowAccessor: the field for accessing the low value 
// Returns [min, max] array
function getBoundingRange(arrIntervals, highAccessor, lowAccessor){

	var minVal = Infinity;
	var maxVal = -Infinity;

	for(var i=0; i<arrIntervals.length; i++){
		minVal = Math.min(minVal, arrIntervals[i][lowAccessor]);
		maxVal = Math.max(maxVal, arrIntervals[i][highAccessor]);
	}
	return [minVal, maxVal];
}

// This function takes two intervals and returns true if they intersect 
function isIntersectIntervals(interval1, interval2, highAccessor, lowAccessor){
	// x2 >= y1 and y2 >= x1
	return (interval1[highAccessor] >= interval2[lowAccessor] 
		&& interval2[highAccessor] >= interval1[lowAccessor]);
}

// This function takes an interval and a point and returns true if they intersect
function isPtIntersectInteval(interval, highAccessor, lowAccessor, pt){
	return (pt >= interval[lowAccessor] && pt <= interval[highAccessor]);
}

// This function asserts whether a condition is true
// Throws an error when the condition is false
function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

// This utility returns the leaves from a tree
function getLeaves(tree){

  var leafList = [];
  addLeaf(tree, leafList);
  return leafList;

}

// This function adds the leaves recursively to an array
function addLeaf(node, leafList){
  if(node == null){
    return;
  }
  if(!(node.children)){
    leafList.push(node);
  }
  else {
    for(var i = 0; i<node.children.length; i++){
      addLeaf(node.children[i], leafList);
    }
  }
}

function stripHTMLTags(str){
  return str.replace(/(<([^>]+)>)/ig,"");
}