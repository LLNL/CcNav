var SRC_FILENAME = 'test.c'
var JSON_FILENAME = 'libtest.so.json'
var DOT_FILENAME = 'libtest.so.dot'

var prefix = "/static/opt_vis/";

var JSON_DATA = {};
var SRC_DATA = "";
var DOT_DATA = "";

var SRC_CODE_ARRAY = [];

// var c10 = d3.schemeCategory10;
// var c10 = d3.scale.category10();

// var f_src_file = document.getElementById('fi_src');
// var f_json_file = document.getElementById('fi_json');
// var f_dot_file = document.getElementById('fi_dot');

// var fr1 = new FileReader();
// var fr2 = new FileReader();
// var fr3 = new FileReader();

Split(['#left', '#right']);

// d3.select("#loadFile")
//   .on("click", function(){
//         loadFile();
//   });

d3.json(prefix + JSON_FILENAME).then(function(data) {
  
  JSON_DATA = data;
  console.log(JSON_DATA);

  d3.text(prefix + SRC_FILENAME).then(function(data){
  	SRC_DATA = data;
  	
  	SRC_CODE_ARRAY = SRC_DATA.split('\n');
  	
  	// console.log(SRC_DATA);
  	console.log(SRC_CODE_ARRAY);

  	d3.text(prefix + DOT_FILENAME).then(function(data){
  		DOT_DATA = data;
  		console.log(DOT_DATA);

  		setupSource();
  		setupAssembly();

  	});

  });

});
 
function setupSource(){

	function_color = {27: {name: "doloop", color:0}, 19: {name:"dosum", color:1},
	 14: {name: "mult3", color:2}, 4: {name:"mult1", color:3}, 9: {name:"mult2", color:4}};

	d3.select("#text_src")
	  .selectAll("p")
	  .data(SRC_CODE_ARRAY)
	  .enter()
	  .append("p")
	  .text(function(d){
	    return d;
	  });

	hljs.initHighlightingOnLoad();

	d3.selectAll("#text_src p")
	  .each(function(d,i){
	      // {p:d3.select(this), start:this.offsetTop, end: this.offsetTop + this.clientHeight};
		if(i in function_color){
			d3.select(this).style("border-color", function(){return categ_color(function_color[i]['color'])})
			.style("border-width", "3px")
			.style("border-style", "solid");
			
		}
	  })
	  .on("mouseover", function(d){
	    
	  })
	  .on("mouseout", function(d){

	  })
	  .on("click", function(d){

	  });
	 

}

function setupAssembly()
{

	// var window_width = 600;
	// var window_height = 750;

	var window_width = d3.select("#right").node().clientWidth;
	// var window_width = d3.select("#right").node().getBoundingClientRect().width;
	var window_height = d3.select("#right").node().clientHeight;
	// var window_height = d3.select("#right").node().getBoundingClientRect().height;

	var indent_margin = 30;
	var indent_margin1 = 10;

	var code_domain = [704, 1039];
	var y_range = [0, window_height*1.3];
	
	var assembly_data = [
		{start:704, end: 1039, name:"doLoop", level:0, funcId: 0},
		
		{start:714, end: 856, name:"dosum", level:1, funcId: 1},
		{start:901, end: 1007, name:"dosum", level:1, funcId: 1},
		
		{start:719, end: 801, name:"mult3", level:2, funcId: 2},
		{start:910, end: 915, name:"mult3", level:2, funcId: 2},
		{start:967, end: 1002, name:"mult3", level:2, funcId: 2},

		{start:714, end: 719, name:"mult1", level:2, funcId: 3},
		{start:801, end: 856, name:"mult1", level:2, funcId: 3},
		{start:905, end: 910, name:"mult1", level:2, funcId: 3},
		{start:915, end: 920, name:"mult1", level:2, funcId: 3},
		{start:930, end: 935, name:"mult1", level:2, funcId: 3},

		{start:901, end: 905, name:"mult2", level:2, funcId: 4},
		{start:920, end: 930, name:"mult2", level:2, funcId: 4},
		{start:935, end: 962, name:"mult2", level:2, funcId: 4}

	];


	var y_scale = d3.scaleLinear()
    .domain(code_domain)
    .range(y_range);

	d3.select("#assemblyContainer g")
		.selectAll("rect")
		.data(assembly_data)
		.enter()
		.append("rect")
		.attr("x", function(d){return d.level*indent_margin})
		.attr("y", function(d){return y_scale(d.start)})
		.attr("width", function(d){return window_width - d.level*indent_margin})
		.attr("height", function(d){return y_scale(d.end) - y_scale(d.start)})
		.attr("fill", "none")
		.attr("stroke", function(d,i){return categ_color(d.funcId)})
		.attr("stroke-width", 5);
		
	d3.select("#assemblyContainer g")
		.selectAll("text")
		.data(assembly_data)
		.enter()
		.append("text")
		.attr("x", function(d){return d.level*indent_margin + 5 })
		.attr("y", function(d){return y_scale(d.start) + 12})
		.attr("stroke", function(d,i){return categ_color(d.funcId)})
		.text( function(d) {return d.name})
		.attr("stroke-width", 1);
		
	d3.select("#assemblyContainer g")
		.append("g")
		.attr("id", "start_range")
		.selectAll("text")
		.data(assembly_data)
		.enter()
		.append("text")
		.attr("x", function(d){return window_width - d.level*30  })
		.attr("y", function(d){return y_scale(d.start) + 12})
		.attr("stroke", function(d,i){return categ_color(d.funcId)})
		.text( function(d) {return d.start})
		.attr("stroke-width", 1);
	
	d3.select("#assemblyContainer g")
		.append("g")
		.attr("id", "end_range")
		.selectAll("text")
		.data(assembly_data)
		.enter()
		.append("text")
		.attr("x", function(d){return window_width - d.level*30 })
		.attr("y", function(d){return y_scale(d.end) + 12})
		.attr("stroke", function(d,i){return categ_color(d.funcId)})
		.text( function(d) {return d.end})
		.attr("stroke-width", 1);
		
	

}

function categ_color(n) {
  var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colors[n % colors.length];
}

  


  
