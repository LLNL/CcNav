OV.CheckboxWindowManager = function() {

    var init_ = function() {

        $('body').append('<div class="CheckboxWindowManager">' + boxes_() + "</div>" +
            "<div class='checkbox_open_close'> > </div>");

        $('[type="checkbox"]').unbind('click').bind('click', checked_ );
        $('.checkbox_open_close').unbind('click').bind('click', open_close_ );

        bind_lm_handlers_();
    };

    var bind_lm_handlers_ = function() {

        $('.lm_close_tab').unbind('click').bind('click', closed_clicked_ );
        $('.lm_header .lm_controls>li').css({"display": "none"});
    };


    var closed_clicked_ = function() {

        var title = $(this).parent().find('.lm_title').html().toLowerCase();
        console.log(title);

        $('[check_type="' + title + '"] input').prop('checked', '');
    };


    var open_close_ = function() {

        $('.CheckboxWindowManager').toggle();
    };

    var win_name_,
        parents_ = {};

    var checked_ = function() {

        win_name_ = $(this).parent().find('.txt').html();
        win_name_ = win_name_.toLowerCase();

        var becoming_checked = $(this).is(':checked');
        var varRe = myLayout.root.getItemsByFilter( find_ );

        //var varRe = myLayout.getComponent(win_name_);

        //console.dir( ret );


        console.log('check: ' + win_name_ + "   ch=" + becoming_checked );

        var spec_child = specs_[win_name_];

        if( becoming_checked ) {

            var save_context = parents_[win_name_];
            console.dir(save_context);

            //var ind = +save_context.index;
            //save_context.parent.addChild( save_context.child, ind );
            //  save_context.child

            //save_context.child.show();

            myLayout.root.contentItems[0].addChild( spec_child, 1 );

            OV.GetFileChoices.init();

            //  This will generally just work if something is already loaded.
            //  We're just re-initializing everything.
            OV.GetFileChoices.loadFile();

        } else {

            //  remove the tab, becoming unchecked.
            var child = varRe[0];
            var parent0 = child.parent;
            var grandpa = child.parent.parent;
            var index = get_index_( parent0, child );

            parents_[win_name_] = {
                "parent": parent0,
                child: child,
                index: index
            };

            console.dir(parents_[win_name_]);

            //  keep child and don't destroy it.
            //child.close(); //  close seems to work, but I can't find the command: open (WTH?)
            //parent0.hide();

            //child.element.hide();  //  this one seems to leave a gap, it doesn't resize the elements
            parent0.removeChild(child, true);

            setTimeout(function() {
                //grandpa.addChild( spec_child );
            }, 2000);
        }

        bind_lm_handlers_();
    };


    var get_index_ = function( parent0, child ) {

        for( var x in parent0.contentItems ) {

            if( parent0.contentItems[x] === child ) {
                return x;
            }
        }

        return 0;
    };


    var find_ = function( node ) {

        var wc = win_name_.toLowerCase();
        console.log( node.config.componentName + '   wn=' + wc );

        return node.config && node.config.componentName &&
            node.config.componentName.toLowerCase() === wc;
    };


    var specs_ = {
        "subenterexec": OP.original_config.content[0].content[0].content[0],
        "highlighteditems": OP.original_config.content[0].content[0].content[1],
        "varrenamer": OP.original_config.content[0].content[0].content[2],
        "fnloops": OP.original_config.content[0].content[1],
        "sourcecode": OP.original_config.content[0].content[2],
        "disassembly": OP.original_config.content[0].content[3],
        "callgraph": OP.original_config.content[0].content[4].content[0],
        "cfg": OP.original_config.content[0].content[4].content[1]
    };


    var boxes_ = function() {

        var ht = "";
        for( var x in specs_ ) {
            ht += box_( x );
        }

        return ht;
    };

    var box_ = function( str ) {

        var sc = str.toLowerCase();

        return "<div class='check_line' check_type='" + sc + "'>" +
            "<input type='checkbox' checked='checked'/>" +
            "<div class='txt'>" + str + "</div>" +
            "</div>";
    };

    $(document).ready( init_ );

}();