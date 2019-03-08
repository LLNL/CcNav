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

Split(['#left', '#middle' ,'#right'], {
    sizes: [40, 20, 40]
});

// d3.select("#loadFile")
//   .on("click", function(){
//         loadFile();
//   });

var src_p_all = [];
var assembly_p_all = [];

var matching_assembly_for_src = {};
var matching_src_for_assembly = {};


var function_color = {27: {name: "doloop", color:0}, 19: {name:"dosum", color:1},
	 14: {name: "mult3", color:2}, 4: {name:"mult1", color:3}, 9: {name:"mult2", color:4}};

var ASSEMBLY_ARRAY = [
		{id:0x2c0, code: "mov %edi,0xfffffffffffffff0(%rsp)", block:0, startBlock:true},
		{id:0x2c4, code: "movd 0xfffffffffffffff0(%rsp),%xmm7", block:0},
		{id:0x2ca, code: "mov $0x1,%esi", block:0},
		{id:0x2cf, code: "pcmpeqd %xmm0,%xmm0", block:0},
		{id:0x2d4, code: "movdqa 0x143(%rip),%xmm3", block:0},
		{id:0x2dd, code: "mov 0x200d14(%rip),%rax", block:0},
		{id:0x2e4, code: "movdqa 0x143(%rip),%xmm2", block:0},
		{id:0x2ed, code: "pshufd %xmm7,$0x0,%xmm7", block:0},
		{id:0x2f2, code: "movdqa 0x115(%rip),%xmm4", block:0},
		{id:0x2fb, code: "movdqa %xmm7,%xmm1", block:0},
		{id:0x300, code: "lea 0x1000(%rax),%rcx", block:0},
		{id:0x307, code: "lea 0x401000(%rax),%r8", block:0},
		{id:0x30e, code: "psrlq $0x20,%xmm1 1, 0", block:0, endBlock:true},

		{id:0x314, code: "mov %esi,0xfffffffffffffff4(%rsp)", block:1, startBlock:true},
		{id:0x318, code: "movd 0xfffffffffffffff4(%rsp),%xmm4", block:1},
		{id:0x31e, code: "lea 0xfffffffffffffffe(%rsi),%edx", block:1},
		{id:0x321, code: "movdqa %xmm4,%xmm2", block:1},
		{id:0x326, code: "mov %edx,0xfffffffffffffff0(%rsp)", block:1},
		{id:0x32a, code: "lea 0xfffff000(%rcx),%rdx", block:1},
		{id:0x331, code: "pshufd %xmm4,$0x0,%xmm3", block:1},
		{id:0x336, code: "movd 0xfffffffffffffff0(%rsp),%xmm4", block:1},
		{id:0x33c, code: "movdqa %xmm3,%xmm6", block:1},
		{id:0x340, code: "pshufd %xmm4,$0x0,%xmm4", block:1},
		{id:0x345, code: "psrlq $0x20,%xmm6", block:1},
		{id:0x34a, code: "movdqa %xmm4,%xmm5", block:1},
		{id:0x34e, code: "psrlq $0x20,%xmm5", block:1},
		{id:0x353, code: "nop 0x0(%rax,%rax,1) 1, 0", block:1, endBlock:true},

		{id:0x358, code: "movdqa %xmm2,%xmm1", block:2, startBlock:true},
		{id:0x35c, code: "movdqa %xmm7,%xmm0", block:2},
		{id:0x360, code: "add $0x10,%rdx", block:2},
		{id:0x364, code: "psrlq $0x20,%xmm1", block:2},
		{id:0x369, code: "pmuludq %xmm2,%xmm0", block:2},
		{id:0x36d, code: "paddd %xmm3,%xmm2", block:2},
		{id:0x372, code: "pmuludq %xmm1,%xmm1", block:2},
		{id:0x377, code: "pshufd %xmm0,$0x8,%xmm0", block:2},
		{id:0x37c, code: "pshufd %xmm1,$0x8,%xmm1", block:2},
		{id:0x381, code: "punpcklqd %xmm1,%xmm0", block:2},
		{id:0x385, code: "movdqa %xmm3,%xmm1", block:2},
		{id:0x389, code: "movdqa %xmm0,%xmm5", block:2},
		{id:0x38e, code: "paddd %xmm0,%xmm0", block:2},
		{id:0x393, code: "paddd %xmm2,%xmm5", block:2},
		{id:0x398, code: "movdqa %xmm5,%xmm6", block:2},
		{id:0x39d, code: "pmuludq %xmm5,%xmm1", block:2},
		{id:0x3a2, code: "paddd %xmm3,%xmm5", block:2},
		{id:0x3a7, code: "psrlq $0x20,%xmm6", block:2},
		{id:0x3ad, code: "pmuludq %xmm6,%xmm6", block:2},
		{id:0x3b2, code: "pshufd %xmm1,$0x8,%xmm1", block:2},
		{id:0x3b7, code: "pshufd %xmm6,$0x8,%xmm6", block:2},
		{id:0x3bd, code: "punpcklqd %xmm6,%xmm1", block:2},
		{id:0x3c2, code: "paddd %xmm5,%xmm1", block:2},
		{id:0x3c7, code: "movdqa %xmm0,%xmm5", block:2},
		{id:0x3cc, code: "psrlq $0x20,%xmm0", block:2},
		{id:0x3d1, code: "pmuludq %xmm4,%xmm5", block:2},
		{id:0x3d6, code: "pmuludq %xmm5,%xmm0", block:2},
		{id:0x3da, code: "pshufd %xmm5,$0x8,%xmm5", block:2},
		{id:0x3e0, code: "pshufd %xmm0,$0x8,%xmm0", block:2},
		{id:0x3e5, code: "punpcklqd %xmm0,%xmm5", block:2},
		{id:0x3ea, code: "paddd %xmm5,%xmm1", block:2},
		{id:0x3ef, code: "movaps %xmm1,0xfffffffffffffff0(%rdx)", block:2},
		{id:0x3f3, code: "cmp %rdx,%rcx", block:2},
		{id:0x3f6, code: "jnz 0xffffff62(%rip) 1, 0", block:2, endBlock:true},

		{id:0x3fc, code: "add $0x1000,%rcx", block:3, startBlock:true},
		{id:0x403, code: "add %edi,%esi", block:3},
		{id:0x405, code: "cmp %r8,%rcx", block:3},
		{id:0x408, code: "jnz 0xffffff0c(%rip) 1, 0", block:3, endBlock:true},

		{id:0x40e, code:"ret near (%rsp) 1, 0", block:4, startBlock:true, endBlock:true}

	];

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
  		// setupAssembly();
  		setupLines();
  		matchCodeLines();

  	});

  });

});


 
function setupSource(){

	d3.select("#text_src")
	  .selectAll("p")
	  .data(SRC_CODE_ARRAY)
	  .enter()
	  .append("p")
	  .text(function(d,i){
	    return (i+1) + " " + d;
	  });

	hljs.initHighlightingOnLoad();

	d3.selectAll("#text_src p")
	  .each(function(d,i){
	      // {p:d3.select(this), start:this.offsetTop, end: this.offsetTop + this.clientHeight};
		// if(i in function_color){
		// 	d3.select(this).style("border-color", function(){return categ_color(function_color[i]['color'])})
		// 	.style("border-width", "3px")
		// 	.style("border-style", "solid");
			
		// }

		src_p_all[i] = d3.select(this);

	  })
	  .on("mouseover", function(d,i){
	    d3.select(this).classed("active", true);
	    // console.log(d);

	    var this_src_line = matching_assembly_for_src[i];
	    if(this_src_line)	{
		    for(var j = 0; j < this_src_line.length; j++){
		    	this_src_line[j][0].classed("highlight", true);
		    	this_src_line[j][1].classed("highlight", true);

		    	this_src_line[j]['path'].classed("highlight", true);

		    	var start_index = this_src_line[j].start_index;
		    	var end_index = this_src_line[j].end_index;

		    	for(var k = start_index; k<=end_index; k++ ){
		    		assembly_p_all[ASSEMBLY_ARRAY[k].id].classed("highlight", true);
		    	}

		    }
		}


	  })
	  .on("mouseout", function(d, i){
	  	d3.select(this).classed("active", false);

	    var this_src_line = matching_assembly_for_src[i];
	    if(this_src_line)	{
		    for(var j = 0; j < this_src_line.length; j++){
		    	this_src_line[j][0].classed("highlight", false);
		    	this_src_line[j][1].classed("highlight", false);

		    	this_src_line[j]['path'].classed("highlight", false);

			    var start_index = this_src_line[j].start_index;
		    	var end_index = this_src_line[j].end_index;

		    	for(var k = start_index; k <= end_index; k++ ){
		    		assembly_p_all[ASSEMBLY_ARRAY[k].id].classed("highlight", false);
		    	}

		    }
		}



	  })
	  .on("click", function(d){

	  });
	 

}

function setupLines(){

	
	d3.select("#text_assembly")
		.selectAll("p")
		.data(ASSEMBLY_ARRAY)
		.enter()
		.append("p")
		.text(function(d){
			return d.id + ": " + d.code;
		})
		.style("padding-top", function(d){return d.startBlock ? "10px": "5px"})
		.style("padding-bottom", function(d){return d.endBlock ? "10px": "5px"})
		// .style("background-color", function(d){return categ_color(d.block)})
		.style("border-top", function(d){return d.startBlock ? "1px solid " + categ_color(d.block) : ""})
		.style("border-bottom", function(d){return d.endBlock ? "1px solid " + categ_color(d.block) : ""})
		.style("border-left", function(d){return "1px solid " + categ_color(d.block)})
		.style("border-right", function(d){return "1px solid " + categ_color(d.block)})
		;

	d3.selectAll("#text_assembly p")
		.each(function(d,i){
			assembly_p_all[d.id] = d3.select(this);
		})
		.on("mouseover", function(d){
	    	d3.select(this).classed("active", true);
	  	})
	  	.on("mouseout", function(d){
	  		d3.select(this).classed("active", false);
	  	})
	  	.on("click", function(d){

	  	});


}

function matchCodeLines(){

	// var middledle_pane_width = 200;
	// var middle_pane_width = d3.select("#middle").node().clientWidth;
	var middle_pane_width = d3.select("#middle").node().getBoundingClientRect().width;

	var lines_array = JSON_DATA['lines'];
	for(var i=0; i<lines_array.length; i++){
		// console.log(lines_array[i].line);
		
		var thisItem = lines_array[i];
		var start = thisItem.from;
		var end = thisItem.to;
		var line = parseInt(thisItem.line) - 1;

		// default values
		var start_index = 0;
		var end_index = ASSEMBLY_ARRAY.length - 1;

		for (var j=0; j<ASSEMBLY_ARRAY.length; j++){
			if(start == ASSEMBLY_ARRAY[j].id){
				start_index = j;

			}
			if(end == ASSEMBLY_ARRAY[j].id){
				end_index = j;
			}		
		}

		if(!(line in matching_assembly_for_src)){
			matching_assembly_for_src[line] = [];
		}
		matching_assembly_for_src[line].push({start_index: start_index, 
			end_index: end_index});

		var match_no = matching_assembly_for_src[line].length - 1;

		for(var k = start_index; k<=end_index; k++){
			matching_src_for_assembly[ASSEMBLY_ARRAY[k].id] = {line_num: line};
		}

		var l1x1 = 0;
		var l2x1 = 0;
		var l1x2 = middle_pane_width;
		var l2x2 = middle_pane_width;

		var l1y1 = src_p_all[line].node().getBoundingClientRect().y + 5;
		var l2y1 = l1y1 + 10;
		var l1y2 = assembly_p_all[ASSEMBLY_ARRAY[start_index].id].node().getBoundingClientRect().y + 10;
		var l2y2 = assembly_p_all[ASSEMBLY_ARRAY[end_index].id].node().getBoundingClientRect().y + 10;

		drawLines(line, l1x1, l1y1, l1x2, l1y2, l2x1, l2y1, l2x2, l2y2, match_no);

	}

}

function drawLines(line_num, l1x1, l1y1, l1x2, l1y2, l2x1, l2y1, l2x2, l2y2, match_no){
	
	var data = [ {line_num:line_num, pos:0, x1:l1x1, y1:l1y1, x2:l1x2, y2:l1y2},
	 {line_num:line_num, pos:1, x1:l2x1, y1:l2y1, x2:l2x2, y2:l2y2} ];

	 /*
	d3.select("#lineContainer g")
		.selectAll("line")
		.data(data)
		.enter()
		.append("line")
		.attr("x1", function(d){return d.x1})
		.attr("y1", function(d){return d.y1})
		.attr("x2", function(d){return d.x2})
		.attr("y2", function(d){return d.y2})
		.attr("stroke-width", 3)
		.attr("stroke", function(d){return categ_color(d.line_num)})
		.each(function(d){
			matching_assembly_for_src[line_num][d.pos] = d3.select(this);
		});
	*/

	

	var first_line = d3.select("#lineContainer g")
		.append("line")
		.datum(data[0])
		.attr("x1", function(d){return d.x1})
		.attr("y1", function(d){return d.y1})
		.attr("x2", function(d){return d.x2})
		.attr("y2", function(d){return d.y2})
		//.attr("stroke-width", 3)
		.attr("stroke", function(d){return categ_color(d.line_num)});

	matching_assembly_for_src[line_num][match_no][0] = first_line;

	var second_line = d3.select("#lineContainer g")
		.append("line")
		.datum(data[1])
		.attr("x1", function(d){return d.x1})
		.attr("y1", function(d){return d.y1})
		.attr("x2", function(d){return d.x2})
		.attr("y2", function(d){return d.y2})
		// .attr("stroke-width", 3)
		.attr("stroke", function(d){return categ_color(d.line_num)});

	matching_assembly_for_src[line_num][match_no][1] = second_line;
	

	var path = d3.select("#lineContainer g")
		.append("path")
		.datum(data)
		.attr("d",function(d){return "M " + d[0].x1 + " " + d[0].y1 + " L " + d[0].x2 + " " + d[0].y2 +
		  " L " + d[1].x2 + " " + d[1].y2 +
		  " L " + d[1].x1 + " " + d[1].y1 +
		  + " Z"})
		.attr("fill", function(d){return categ_color(d[0].line_num)})
		.attr("stroke", "transparent");

	matching_assembly_for_src[line_num][match_no]['path'] = path;

	/*
	var this_src_line = matching_assembly_for_src[line_num][match_no];
	src_p_all[line_num].style("background-color", function(d){return categ_color(d[0].line_num)});
    	
    	var start_index = this_src_line.start_index;
    	var end_index = this_src_line.end_index;

    	for(var k = start_index; k<=end_index; k++ ){
    		assembly_p_all[ASSEMBLY_ARRAY[k].id].style("background-color", function(d){return categ_color(d[0].line_num)});
    	}
	*/
    
	

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
	var y_range = [0, window_height];
	
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
