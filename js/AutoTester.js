OV.AutoTester = function() {

    var AUTOTEST_DIR = "autotest_dir";

    var set_ = function( dir ) {

        localStorage.setItem(AUTOTEST_DIR, dir);
    };

    var remove_ = function() {
        set_("");
    };

    var input_ = function( dir ) {
        $('.exe_filename').val( dir );
        $('#enter_exec .get').trigger('click');
    };

    var init_ = function() {

        var dir = localStorage.getItem( AUTOTEST_DIR );

        if( dir && dir !== "" ) {
            input_(dir);
        }
    };

    $(document).ready( init_ );

    return {
        set: set_,
        remove: remove_,
        LTIMES: "/g/g0/pascal/ltimes",
        THREE: "/g/g0/pascal/inputs/3/a.out",
        TWO: "/g/g0/pascal/inputs/2/a.out",
        ONE: "/g/g0/pascal/inputs/1/a.out"
    }
}();