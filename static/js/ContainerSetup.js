OV.ContainerSetup = function() {

    var command_ = function( func, key, after0 ) {

        var com = "/root/CcNav/optparser/optparser.py " + func +
                " " + key;

        Ajax.container_call({
            "command": "/usr/bin/python3 " + com
        }, after0);
    };

    var load_ = function() {

        Ajax.container_call({
            "command": "/usr/bin/python3 /root/CcNav/optparser/optparser.py open /root/CcNav/misc/sample_inputs/a0/a.out"
        }, after0);
    };

    var after0 = function( key ) {

        OV.opt_result = {};
        OV.opt_result.key = key;

        Common.spinner("Got key: " + key + "   Getting dot ...");
        Common.clear();

        command_("dot", key , function( out ) {

            OV.opt_result.dot = out;
            Common.spinner("Getting parse ...");
            Common.error( out );

            command_("parse", key , function( out2 ) {

                OV.opt_result.parse = out2;
                Common.spinner("Getting sourcefiles ...");
                Common.error( out2 );

                command_("sourcefiles", key , function( out3 ) {

                    OV.opt_result.sourcefiles = out3;
                    console.dir( OV.opt_result );

                    Common.spinner(false);
                    Common.error( out3 );

                    command_("close", key, OV.GetFileChoices.pre_html);
                });
            });
        });
    };

    return {
        load: load_
    }
}();