OV.StateManager = function() {

    var golden_layout_key_ = 'golden_layout_key';

    var load_ = function() {

        var myLayout,
            savedState = localStorage.getItem( golden_layout_key_ );

        if( savedState !== null ) {
            myLayout = new GoldenLayout( JSON.parse( savedState ) );
        } else {
            myLayout = new GoldenLayout( config );
        }

        bind_();
    };


    //  Run this every time the user moves window
    var bind_ = function() {

        myLayout.on( 'stateChanged', function(){
            var state = JSON.stringify( myLayout.toConfig() );
            localStorage.setItem( golden_layout_key_, state );
        });
    };

    $(document).ready(load_);

    return {
        bind: bind_
    }
}();