OV.CheckboxWindowManager = function() {

    var init_ = function() {

        $('body').append('<div class="CheckboxWindowManager">' + boxes_() + "</div>");

        $('[type="checkbox"]').unbind('click').bind('click', checked_ );
    };

    var win_name_;

    var checked_ = function() {

        win_name_ = $(this).parent().find('.txt').html();
        var becoming_checked = $(this).is(':checked');

        var varRe = myLayout.root.getItemsByFilter( find_ );

        //console.dir( ret );

        console.log('check: ' + win_name_ + "   ch=" + becoming_checked );

        if( becoming_checked ) {

            var child = {
                "type":"component",
                "componentName":"FnLoops",
                "componentState":{
                    "label":"Function and Loops"
                }
            };

            var child = specs_[win_name_];

            myLayout.root.contentItems[0].contentItems[0].addChild( child );
        } else {
            varRe[0].remove();
        }
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