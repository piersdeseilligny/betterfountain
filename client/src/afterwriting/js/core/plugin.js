define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * @module core/plugin
     */
    var Plugin = Protoplast.Object.extend({
        
        context: null,
        
        $create: function(context) {
            this.context = context;
        }
        
    });

    return Plugin;
});