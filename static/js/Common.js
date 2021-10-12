var Common = function() {

    var remove_ = function() {
        $('.spinner, .curtain').remove();
    };

    var spinner_ = function( comment ) {

        remove_();

        if( comment !== false ) {
            $('body').append('<div class="curtain"></div><div class="spinner">' + comment + "</div>");
            $('.curtain').unbind('click').bind('click', function() {

                remove_();
            });
        }
    };

    var error_ = function( ret ) {

        if( ret.error !== "" ) {

            var prev = $('.main_message .error_text').html() || "";
            $('.main_message').html( '<div class="error_text">' + prev + "<div class='each_mess'>" + ret.error + '</div></div>');
        }
    };

    var clear_ = function() {
        $('.main_message').html("");
    };

    var on_rz_ = function() {
        return window.location.hostname === "rzlc.llnl.gov";
    };

    var get_url_ = function() {

        var host = window.location.hostname;
        //
        return "https://" + host;
    };

    return {
        get_url: get_url_,
        on_rz: on_rz_,
        clear: clear_,
        spinner: spinner_,
        error: error_
    }
}();