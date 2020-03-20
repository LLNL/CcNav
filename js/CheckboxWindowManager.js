OV.CheckboxWindowManager = function() {

    var init_ = function() {

        $('body').append('<div class="CheckboxWindowManager">' + boxes_() + "</div>");

        $('[type="checkbox"]').unbind('click').bind('click', checked_ );
    };

    var checked_ = function() {

    };

    var boxes_ = function() {

        return "<div class=''>" +
            "<input type='checkbox'/>" +
            "<div class='txt'>FnLoops</div>" +
            "</div>";
    };

    $(document).ready( init_ );

}();