var OV = {};

OV.GetFileChoices = function() {

    var input_files_;

    var success_ = function( dat ) {

        input_files_ = dat.input_files;
        var selects = "";

        var lines = dat.json.lines;
        var done = {};

        for( var x=0; x < lines.length; x++ ) {

            var file = lines[x].file;

            if( !done[ file ]) {
                selects += '<option>' + file + '</option>';
                done[file] = 1;
            }
        }

        var sel = '<select class="file_select">' + selects + '</select>' +
            ReusableView.button('SUBMIT', 'submit_file_choice');

        ReusableView.modal({header: "Select a file", body: "files: " + sel });

        $('.submit_file_choice').unbind('click').bind('click', file_submitted_);
    };


    var file_submitted_ = function() {

        //  Load file contents into containers.
        //  We'll need to modify loadFile such that it can handle the file
        //  content loaded directly from file, rather than through the file loader.
        var file_select = $('.file_select').val();

        submit_file_choice_( file_select );
    };


    var submit_file_choice_ = function( file_select ) {

        var dat = "file_select=" + file_select + "&input_files=" + JSON.stringify( input_files_ );

        Ajax.call({
            url: 'ajax/SubmitFileChoices.cgi',
            type: "GET",
            data: dat,
            success: file_submitted_done_,
            error: file_submitted_done_
        });
    };

    var file_submitted_done_ = function( file_contents ) {

        console.dir( file_contents );
        //loadFile_( file_contents );
    };

    var loadFile_ = function( fc ) {

        // Loads the files selected from the menu
        if(f_src_file.files[0] == undefined){
            alert("Please provide the source code file");
            return;
        }
        if(f_dot_file.files[0] == undefined){
            alert("Please provide the dot file");
            return;
        }
        if(f_json_file.files[0] == undefined){
            alert("Please provide the json analysis file");
            return;
        }

        SRC_FILENAME = f_src_file.files[0].name;

        fr1.readAsText(f_json_file.files[0]);
        fr1.onloadend=function(){
            JSON_DATA = JSON.parse(this.result);

            // d3.json(prefix + JSON_FILENAME, function(data) {
            // JSON_DATA = data;
            console.log(JSON_DATA);

            // convert the line numbers to integers
            var lines = JSON_DATA.lines;
            var filtered_lines = [];

            var regex1 = RegExp(SRC_FILENAME);

            // Filter by the filename
            for(var i =0; i<lines.length; i++){
                //convert the line numbers to 0-based index
                lines[i].line = parseInt(lines[i].line) - 1;
                // If the file contains the filename
                if(regex1.test(lines[i].file)) {
                    filtered_lines.push(lines[i]);
                }
            }

            lines = JSON_DATA.lines = filtered_lines;

            /*
             // convert the line numbers to 0-based index
             for(var i=0; i<lines.length; i++){
             lines[i].line = parseInt(lines[i].line) - 1;
             }
             */

            // shallow copy the lines object since its composed of only string literals
            // and integers
            // linesAssembly stores the correspondence between source and assembly in
            // the sorted order of assembly ranges (i.e. it is sorted on the "from" property
            // of the object)

            // Deep copy of lines array
            //var linesAssembly = lines.map(a => Object.assign({}, a));

            // Shallow copy of lines array
            var linesAssembly = lines.slice(0);

            JSON_DATA.linesAssembly = linesAssembly;


            // sort the lines array based on line number of source code
            lines.sort(function(a, b) {
                return a.line - b.line;
            });

            // sort the linesAssembly array based on the from field
            linesAssembly.sort(function(a,b){
                return a.from - b.from;
            });

            fr2.readAsText(f_src_file.files[0]);
            fr2.onloadend=function(){
                SRC_DATA = this.result;

                // d3.text(prefix + SRC_FILENAME, function(data){
                //   SRC_DATA = data;

                SRC_CODE_ARRAY = SRC_DATA.split('\n');

                for(var i = 0 ; i < SRC_CODE_ARRAY.length; i++){
                    SRC_CODE_ARRAY[i] = {code: SRC_CODE_ARRAY[i], lineNum: i};
                }

                // Check if this line number has any mapping to assembly instructions
                for(var i = 0; i < lines.length; i++){
                    SRC_CODE_ARRAY[lines[i].line].hasMatchingAssembly = true;
                }

                // console.log(SRC_DATA);
                // console.log(SRC_CODE_ARRAY);

                fr3.readAsText(f_dot_file.files[0]);
                fr3.onloadend=function(){
                    DOT_FULL_DATA = this.result;

                    // d3.text(prefix + DOT_FILENAME_FULL, function(data){
                    // DOT_FULL_DATA = data;

                    DOT_FULL_DATA = DOT_FULL_DATA.replace(/\\l/g, "\n");

                    // d3.text(prefix + DOT_FILENAME, function(data){
                    //   DOT_DATA = data;
                    //   DOT_DATA = DOT_DATA.replace(/\\l/g, "\n");

                    // console.log(DOT_DATA);

                    g_full = graphlibDot.parse(DOT_FULL_DATA);
                    console.log(g_full);

                    // Create a copy of the graph
                    g = graphlibDot.parse(DOT_FULL_DATA);

                    // To copy the graph directly from another graph
                    // var g3 = graphlib.json.read(graphlib.json.write(g));
                    // To copy a graph from a string
                    // var g2 = graphlib.json.read(JSON.parse(str));

                    // Make the label of the graph the basic block name plus the function name
                    var graph_nodes = g.nodes();
                    var label;

                    for(var i = 0; i<graph_nodes.length; i++){
                        label = g.node(graph_nodes[i]).label;
                        g.node(graph_nodes[i]).label = graph_nodes[i] + ": " + getFunctionFromLabel(label);
                    }


                    ASSEMBLY_ARRAY = getAssemblyInstrs();
                    console.log(ASSEMBLY_ARRAY);

                    // tree_data = createInlineTree();
                    // NOTE: Replacement for the complete inlining tree
                    tree_data = createLinearTree();

                    console.log(tree_data);

                    model = makeModel();
                    view_source = makeSourceCodeView(model, 'text_src', 'left');
                    view_inline_tree = makeTreeListView(model, 'assemblyContainer', 'middle');
                    view_graph = makeCFGGraphView(model, 'graphContainer', 'right');
                    view_highlighted_items = makeHighlightedItemsView(model, 'highlightList');

                    controller = makeController(model);

                    // model.register(view_source.render);
                    model.register(view_source.highlight);
                    model.register(view_inline_tree.highlight);
                    model.register(view_graph.highlight);
                    model.register(view_highlighted_items.render);

                    view_source.register(controller.dispatch);
                    view_inline_tree.register(controller.dispatch);
                    view_graph.register(controller.dispatch);

                };

            };
        }

    };


    var get_ = function() {

        Ajax.call({
            url: 'ajax/GetFileChoices.cgi',
            type: "GET",
            success: success_,
            error: success_
        });
    };

    return {
        get: get_
    }
}();


$(document).ready(OV.GetFileChoices.get);