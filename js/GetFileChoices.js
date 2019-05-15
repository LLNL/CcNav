var OV;

OV.GetFileChoices = function() {

    var success_ = function() {
    };

    var get_ = function() {

        Ajax.call({
            url: "/data",
            type: "GET",
            success: success_,
            error: success_
        });
    };

    return {
        get: get_
    }
}();