define(function(require) {

    var Protoplast = require('protoplast');

    var TooltipModel = Protoplast.Model.extend({
        
        text: null,
        
        x: 0,
        
        y: 0
        
    });

    return TooltipModel;
});