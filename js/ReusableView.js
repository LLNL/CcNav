/*
Run like so:
ReusableView.modal({header: "Select a file", body: "files"})
 */
ReusableView = function() {

    var button_ = function( text, classes, button_type ) {

        var type = button_type === undefined ? "black_button" : button_type;

        return '<div class="button_outer ' + classes + " " + type + '">' +
            '<div class="inner_button">' + text + '</div>' +
            '</div>';
    };

    var modal_ = function( spec ) {

        spec.header = spec.header || 'Modal Header';
        spec.body   = spec.body || 'Modal Body';
        spec.classes = spec.classes || "";

        var ht = '<div class="outer_modal">\
            <div class="curtain"></div> \
            <div class="modal ' + spec.classes + '">\
                <div class="header">' + spec.header + '\
                    ' + button_('X', 'close') + '\
                </div>\
                <div class="body">' + spec.body + '</div>\
            </div>\
            </div>';


        $('body').append(ht);

        $('.modal .close').unbind('click').bind('click', close_me_ );
    };

    var close_me_ = function() {

        var outer_modal = $(this).closest('.outer_modal');
        outer_modal.remove();
    };

    var prompt_ = function( header, body, callback ) {

        var buttons = "<div class='button_bottom'>" +
                    button_("YES", 'yes') +
                    button_("NO", 'no') +
                    "</div>";

        modal_({
            header: header,
            body: body + buttons
        });

        $('.modal .no, .modal .yes').unbind('click').bind('click', close_me_ );
        $('.modal .yes').bind('click', callback);
    };

    var alert_ = function( header, body, classes ) {

        modal_({
            header: header,
            body: body,
            classes: classes
        });
    };

    return {
        alert: alert_,
        prompt: prompt_,
        modal: modal_,
        button: button_
    }
}();


$.fn.enterKey = function (callback) {

    return this.each(function () {
        $(this).unbind('keypress.enter').bind('keypress.enter', function (ev) {
            var keycode = (ev.keyCode ? ev.keyCode : ev.which);
            if (keycode == '13') {
                callback.call(this, ev);
            }
        })
    });
};


//  Jquery reusable plugin for scrolling down.
$.fn.ScrollBottom = function() {

    return this.each( function() {

        var user_inputting = $(this).find('input').length;

        if( !user_inputting ) {
            var height = $(this)[0].scrollHeight;
            $(this).scrollTop(height);
        }
    })
};
