OV.CheckboxWindowManager = function() {

    var init_ = function() {

        $('body').append('<div class="CheckboxWindowManager">' + boxes_() + "</div>" +
            "<div class='checkbox_open_close'> > </div>");

        $('[type="checkbox"]').unbind('click').bind('click', checked_ );
        $('.checkbox_open_close').unbind('click').bind('click', open_close_ );
    };

    var open_close_ = function() {

        $('.CheckboxWindowManager').toggle();
    };

    var win_name_,
        parents_ = {};

    var checked_ = function() {

        win_name_ = $(this).parent().find('.txt').html();

        var becoming_checked = $(this).is(':checked');
        var varRe = myLayout.root.getItemsByFilter( find_ );

        //console.dir( ret );

        console.log('check: ' + win_name_ + "   ch=" + becoming_checked );

        if( becoming_checked ) {

            var child = specs_[win_name_];
            var save_context = parents_[win_name_];
            var ind = +save_context.index;

            save_context.node.addChild( child, ind );

            //myLayout.root.contentItems[0].contentItems[0].addChild( child );
        } else {

            var child = varRe[0];
            var parent0 = child.parent;
            var index = get_index_( parent0, child );

            parents_[win_name_] = {
                node: parent0,
                index: index
            };

            console.dir(index);

            //  keep child and don't destroy it.
            parent0.removeChild(child, true);
        }
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
        return node.config.componentName === win_name_;
    };

    var specs_ = {
        "SubEnterExec": OP.original_config.content[0].content[0].content[0],
        "HighligthedItems": OP.original_config.content[0].content[0].content[1],
        "VarRenamer": OP.original_config.content[0].content[0].content[2],
        "FnLoops": OP.original_config.content[0].content[1],
        "SourceCode": OP.original_config.content[0].content[2],
        "Disassembly": OP.original_config.content[0].content[3],
        "CallGraph": OP.original_config.content[0].content[4].content[0],
        "CFG": OP.original_config.content[0].content[4].content[1]
    };


    var boxes_ = function() {

        var ht = "";
        for( var x in specs_ ) {
            ht += box_( x );
        }

        return ht;
    };

    var box_ = function( str ) {
        return "<div class='check_line'>" +
            "<input type='checkbox' checked='checked'/>" +
            "<div class='txt'>" + str + "</div>" +
            "</div>";
    };

    $(document).ready( init_ );

}();