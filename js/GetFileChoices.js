var OV = {};

OV.GetFileChoices = function() {

    var success_ = function( dat ) {

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

        $('.submit_file_choice').unbind('click').bind('click', submit_file_choice_);
    };


    var file_submitted_ = function( dat ) {

        //  Load file contents into containers.
        //  We'll need to modify loadFile such that it can handle the file
        //  content loaded directly from file, rather than through the file loader.
        var file_select = $('.file_select').val();

        submit_file_choice_( file_select );

        //loadFile( dat );
    };


    var submit_file_choice_ = function( file_select ) {

        var dat = "file_select=" + file_select;

        Ajax.call({
            url: 'ajax/SubmitFileChoices.cgi',
            type: "GET",
            data: dat,
            success: file_submitted_done_,
            error: file_submitted_done_
        });
    };

    var file_submitted_done_ = function() {

    };


    var get_ = function() {

        Ajax.call({
            url: 'ajax/GetFileChoices.cgi',
            type: "GET",
            success: success_,
            error: success_
        });
    };

    return {
        get: get_
    }
}();


    $(document).ready(OV.GetFileChoices.get);