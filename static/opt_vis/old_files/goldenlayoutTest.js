var config = {
    content: [{
        type: 'row',
        content:[{
            type: 'component',
            componentName: 'testComponent',
            componentState: { label: 'A' }
        },{
            type: 'column',
            content:[{
                type: 'component',
                componentName: 'testComponent',
                componentState: { label: 'B' }
            },{
                type: 'component',
                componentName: 'testComponent',
                componentState: { label: 'C' }
            }]
        }]
    }]
};

// var myLayout = new GoldenLayout( config);
var myLayout = new GoldenLayout( config , document.body);

myLayout.registerComponent( 'testComponent', function( container, componentState ){
    container.getElement().html( '<h2>' + componentState.label + '</h2>' );
});

myLayout.init();

console.log(config);
console.log(myLayout);