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

        var sel = '<select class="file_select">' + selects + '</select>';

        ReusableView.modal({header: "Select a file", body: "files: " + sel });

        $('.submit_file_choice').unbind('click').bind('click', submit_file_choice_);
    };


    var file_submitted_ = function( dat ) {

        //  Load file contents into containers.
        //  We'll need to modify loadFile such that it can handle the file
        //  content loaded directly from file, rather than through the file loader.

        loadFile( dat );
    };

    var submit_file_choice_ = function() {

        Ajax.call({
            url: 'ajax/SubmitFileChoices.cgi',
            type: "GET",
            success: file_submitted_,
            error: file_submitted_
        });
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