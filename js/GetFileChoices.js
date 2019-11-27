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
        loadFile_( file_contents );
    };


    var loadFile_ = function( fc ) {

        // Loads the files selected from the menu
        if( !fc.f_dot ){
            alert("I was expecting an f_dot JSON object but did not get one.");
            return;
        }

        if( !fc.f_json ){
            alert("I was expecting an f_json JSON object but did not get one.");
            return;
        }

        if( !fc.f_src ){
            alert("I was expecting an f_src JSON object but did not get one.");
            return;
        }

        JSON_DATA = JSON.parse(fc.f_json);
        console.log(JSON_DATA);

        var SRC_FILENAME = "lulesh.cc";

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

        SRC_DATA = fc.f_src;

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

        console.log(SRC_DATA);
        console.log(SRC_CODE_ARRAY);

        DOT_FULL_DATA = fc.f_dot;

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

        var model = makeModel();
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

        ReusableView.close();
    };


    var get_ = function() {

        Ajax.call({
            url: 'ajax/GetFileChoices.cgi',
            type: "GET",
            success: success_,
            error: success_
        });
    };


    $(document).ready( function() {

        $('#file_chooser').unbind('click').bind('click', OV.GetFileChoices.get);

        show_executable_input_();
        //callOptParser_();
    });

    var show_executable_input_ = function() {

        $("body").append('<div class="executable_input">' +
            '<div class="enter_exe">Enter executable input dir / name: <br>(for example /g/g0/pascal/a.out)</div>' +
            '<input type="text" class="exe_filename" value="/g/g0/pascal/a.out"/>' +
            ReusableView.button('GET', 'get') +
            '<div class="sel_gen"></div>' +
            '</div>');

        $('.executable_input .get').unbind('click').bind('click', callOptParser_);
    };


    var callOptParser_ = function() {

        var executable = $('.exe_filename').val();
        var command = '/usr/gapps/spot/optvis/optparser.py open ' + executable;
        //command = 'optparser.py open /g/g0/pascal/a.out';

        var comm22 = "command=/usr/gapps/spot/dev_spot.py getData /usr/gapps/spot/datasets/lulesh_gen/1000 ";
        var comm = "command=" + command + "&route=/command/oslic&via=post";

        $.getJSON("https://lc.llnl.gov/lorenz/lora/lora.cgi/jsonp?" + comm + "&callback=?", after_);

        //  Once we get the return blocking problem worked out we can make those 3 JSONP requests we talked about.
        $('.sel_gen').html( get_dropdown_() );
        $('.source_viewer').change( source_selected_ );
    };

    var get_dropdown_ = function() {

        var ht = "";
        for( var x in STUB0.sourcefiles ) {
            ht += '<option>' + STUB0.sourcefiles[x].file + '</option>';
        }

        return '<select class="source_viewer">' + ht + '</select>';
    };

    var source_selected_ = function() {

        var see_sourcecode = $(this).val();
        console.log(see_sourcecode);

        var dat = "see_sourcecode=" + see_sourcecode;

        Ajax.call({
            url: 'ajax/GetFile.cgi',
            type: "GET",
            data: dat,
            success: after_,
            error: after_
        });
    };

    var after_ = function( json ) {

        alert( json.see_sourcecode );
    };

    return {
        get: get_
    }
}();
