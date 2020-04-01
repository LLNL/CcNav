OV.AutoTester = function() {

    var AUTOTEST_DIR = "autotest_dir";

    var set_ = function( dir ) {

        localStorage.setItem(AUTOTEST_DIR, dir);
    };

    var input_ = function( dir ) {
        $('.exe_filename').val( dir );
        $('#enter_exec .get').trigger('click');
    };

    var init_ = function() {

        var dir = localStorage.getItem( AUTOTEST_DIR );

        if( dir ) {
            input_(dir);
        }
    };

    $(document).ready( init_ );

    return {
        set: set_
    }
}();