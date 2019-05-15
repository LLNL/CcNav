Ajax = function() {

    var call_ = function( par ) {

        var obj = {
            type: par.type,
            data: par.data
        };

        var absolute = par.url.indexOf('https://') > -1;
        obj.url = absolute ? par.url : "server/rest.cgi" + par.url;

		obj.url = 'ajax/create.cgi';

        obj.success = function( dat ) {

            if( dat.sections ) {
                console.dir(dat.sections[0].contents[0]);
            }

            handle_error_(dat);
            par.success(dat);
        };

        obj.error = par.error || function( dat ) {
            ReusableView.alert('Error', "There was some kind of error returning data." );
        };

        $.ajax(obj);
    };

    var handle_error_ = function(dat) {

        if( dat.error && $('.error_modal').length === 0 ) {
            ReusableView.alert('Error', dat.error, 'error_modal' );

            //  Only need to display it once per error.
            //  delete board_.error;
        }
    };


    var get_me_ = function() {

        //  want it to be the same regardless of user who's using it.
        var me = "https://" + location.host + "/lorenz/lora/lora.cgi/user/ME";

        call_({
            type: "GET",
            url: me,
            success: function( dd ) {

                console.dir(dd);
                $('.logged_in .who').html( dd.output.displayname );
            }
        }, true );
    };


    return {
        call: call_,
        get_me: get_me_
    }
}();
