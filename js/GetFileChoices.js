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

    var cached_fc_ = null;

    //  this is based on main_with_mvc_goldenlayout.js
    var loadFile_ = function( fc ) {

        if( !fc ) {
            //  For when we need to reload.
            fc = cached_fc_;
        }

        cached_fc_ = fc;

        SRC_FILENAME = fc.source_filename;
        console.log(SRC_FILENAME);

        //[NOTE]: SRC_FILENAME is hardcoded here; Change it to reflect the actual filename


        /***** Edit Comment for load menu ********/
        //d3.json(prefix + JSON_FILENAME, function(data) {
        JSON_DATA = fc.f_json;
        /***** Edit Comment for load menu ********/

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

        SRC_DATA = fc.f_src;

        SRC_CODE_ARRAY = SRC_DATA.split('\n');

        for(var i = 0 ; i < SRC_CODE_ARRAY.length; i++){
            SRC_CODE_ARRAY[i] = {code: SRC_CODE_ARRAY[i], lineNum: i};
        }

        // Check if this line number has any mapping to assembly instructions
        for(var i = 0; i < lines.length; i++){

            var lin = lines[i].line;

            if( SRC_CODE_ARRAY[lin]) {
                SRC_CODE_ARRAY[lin].hasMatchingAssembly = true;
            } else {
                console.log('Warning.  Line # not found: ' + lin);
            }
        }

        // console.log(SRC_DATA);
        // console.log(SRC_CODE_ARRAY);

        /***** Edit Comment Out for load menu ********/
        /*
        fr3.readAsText(f_dot_file.files[0]);
      fr3.onloadend=function(){
          DOT_FULL_DATA = this.result;
          */
        /***** Edit Comment Out for load menu ********/

        /***** Edit Comment for load menu ********/
        //d3.text(prefix + DOT_FILENAME_FULL, function(data){
        DOT_FULL_DATA = fc.f_dot;
        /***** Edit Comment Out for load menu ********/

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
        // tree_data = createLinearTree();
        // console.log(tree_data);

        var callGraph = makeCallGraph(JSON_DATA);
        // console.log(graphlibDot.write(callGraph));
        console.log(callGraph);

        model = makeModel();
        model.set("callGraph", callGraph);

        view_source = makeSourceCodeView(model, 'text_src', 'left');

        // view_inline_tree = makeTreeListView(model, 'assemblyContainer', 'middle');
        view_disassembly = makeDisassemblyView(model, 'text_assembly', 'middle');

        //  this won't load parts of the "model.filteredGraph".  runCFGConf sets up the model first.
        //var cfgView = new CFGView( model, 'graphContainer', 'right');
        //cfgView.renderGraph();

        /*var cfgConfModel = {};

        cfgConfModel.CFGConfJSON = cfgConfJSON;
        // make a copy of the json spec
        cfgConfModel.CFGConfJSON["data"]["graphFile"] = DOT_FULL_DATA;
        cfgConfModel.origCFGConfJSON = JSON.parse(JSON.stringify(cfgConfModel.CFGConfJSON));
        cfgConfModel.graph = new graphlibNew.Graph({ directed: true, compound: true});
        console.log(cfgConfModel.CFGConfJSON);
        console.log(cfgConfModel.graph);*/

        runCFGConf();
        //initGraph( json, callGraph, model);

        //view_graph = makeCFGGraphView(model, 'graphContainer', 'right');
        view_highlighted_items = makeHighlightedItemsView(model, 'highlightList');

        // view_register_renamer = makeRegRenamingView(model, 'reg_rename');
        view_var_renamer = makeVarRenamingView(model, 'var_rename_window');
        view_callgraph = makeCallGraphView(model, 'callGraphContainer' , 'call_graph');

        view_navBar_Loops = makeLoopFnTreeView(model, 'loopsView', 'fnInlineView', 'fn_loopView');

        controller = makeController(model);

        model.register(view_source.render);
        model.register(view_source.highlight);

        // model.register(view_inline_tree.highlight);
        model.register(view_disassembly.highlight);

        model.register(cfgView.highlight);
        model.register(view_highlighted_items.render);
        // model.register(view_register_renamer.render);
        model.register(view_var_renamer.render);
        model.register(view_callgraph.highlight);

        model.registerWithTag(view_disassembly.highlight, viewTypes.viewDisassembly);
        model.registerWithTag(view_var_renamer.render, viewTypes.viewVarRenamer);
        model.registerWithTag(view_callgraph.highlight, viewTypes.viewCallGraph);

        view_source.register(controller.dispatch);

        // view_inline_tree.register(controller.dispatch);
        view_disassembly.register(controller.dispatch);


        cfgView.register( controller.dispatch );
        //view_graph.register(controller.dispatch);
        // view_register_renamer.register(controller.dispatch);
        view_var_renamer.register(controller.dispatch);
        view_callgraph.register(controller.dispatch);
    };


    var get_ = function() {

        Ajax.call({
            url: 'ajax/GetFileChoices.cgi',
            type: "GET",
            success: success_,
            error: success_
        });
    };

    var init_ = function() {

        $('#file_chooser').unbind('click').bind('click', OV.GetFileChoices.get);
        $('#enter_exec .get').unbind('click').bind('click', callOptParser_);
    };

    $(document).ready( init_ );


    var after_ = function( output_obj ) {

        var key = output_obj.output.command_out;
        OV.opt_result = {};
        OV.opt_result.key = output_obj.output.command_out;

        Common.spinner("Getting dot ...");
        Common.clear();

        $.getJSON( command_("dot", key ), function( out ) {

            OV.opt_result.dot = out.output.command_out;
            Common.spinner("Getting parse ...");
            Common.error( out );

            $.getJSON( command_("parse", key ), function( out2 ) {

                OV.opt_result.parse = out2.output.command_out;
                Common.spinner("Getting sourcefiles ...");
                Common.error( out2 );

                $.getJSON( command_("sourcefiles", key ), function( out3 ) {

                    OV.opt_result.sourcefiles = out3.output.command_out;
                    console.dir( OV.opt_result );
                    Common.spinner(false);
                    Common.error( out3 );

                    $.getJSON(command_("close", key));
                    pre_html_();
                });
            });
        });
    };


    var command_ = function( type, executable ) {

        var command = '/usr/gapps/spot/optvis/optparser.py ' + type + ' ' + executable;
        //command = 'optparser.py open /g/g0/pascal/a.out';
        //var command = '/bin/bash -c "' + command_prev + '"';

        var host = Common.on_rz() ? "rzslic9" : "oslic8";
        //host = "oslic8";

        var comm = "command=" + command + "&route=/command/" + host + "&via=post";

        return Common.get_url() + "/lorenz/lora/lora.cgi/jsonp?" + comm + "&callback=?";
    };

    //  GET button pressed.
    var callOptParser_ = function() {

        var executable = $('#enter_exec .exe_filename').val();
        //var comm22 = "command=/usr/gapps/spot/dev_spot.py getData /usr/gapps/spot/datasets/lulesh_gen/1000 ";

        Common.spinner("Open call.  getting key.");
        $.getJSON(command_("open", executable), after_);
    };

    var get_result_ = function( res ) {

        var wrap = JSON.parse('{' + res.sourcefiles + '}');

        return {
            key: res.key,
            dot: res.dot,
            parse: JSON.parse(res.parse),
            sourcefiles: wrap.sourcefiles
        };
    };


    var pre_html_ = function() {

        var model = get_result_( OV.opt_result );
        console.dir( model );

        //  Once we get the return blocking problem worked out we can make those 3 JSONP requests we talked about.
        $('.sel_gen').html( get_dropdown_( model ) );
        $('.source_viewer').change( source_selected_ );

        var source_filename = model.sourcefiles[0].file;

        get_source_( source_filename, function( json ) {

            console.log('source got = ' + json.see_sourcecode );

            loadFile_({
                f_dot: model.dot,
                f_json: model.parse,
                f_src: json.see_sourcecode,
                source_filename: source_filename
            });
        });
    };


    var get_dropdown_ = function( model ) {

        var ht = "";
        for( var x in model.sourcefiles ) {
            ht += '<option>' + model.sourcefiles[x].file + '</option>';
        }

        return '<select class="source_viewer">' + ht + '</select>';
    };


    var source_selected_ = function() {

        var see_sourcecode = $(this).val();

        get_source_( see_sourcecode, function( json ) {

            //  We've received the actual source code and can load the editor now.
            console.log( json.see_sourcecode );

            //var model = makeModel();
            //view_source = makeSourceCodeView(model, 'text_src', 'left');
            var model = get_result_( OV.opt_result );

            loadFile_( {
                f_dot: model.dot,
                f_json: model.parse,
                f_src: json.see_sourcecode,
                source_filename: see_sourcecode
            } );
        } );
    };


    var get_source_ = function( see_sourcecode, callback ) {

        var dat = "see_sourcecode=" + see_sourcecode;

        Ajax.call({
            url: 'ajax/GetFile.cgi',
            type: "GET",
            data: dat,
            success: callback,
            error: callback
        });
    };


    return {
        get: get_,
        init: init_,
        loadFile: loadFile_
    }
}();