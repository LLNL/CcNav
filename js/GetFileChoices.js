var OV = {};

OV.GetFileChoices = function() {

    var success_ = function() {
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