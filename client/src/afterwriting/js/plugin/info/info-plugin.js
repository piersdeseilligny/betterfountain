define(function(require) {

    var Plugin = require('core/plugin'),
        InitInfoController = require('plugin/info/controller/init-info-controller');

    /**
     * @module plugin/info/info-plugin
     * @augments module:core/plugin
     */
    var InfoPlugin = Plugin.extend({
        
        $create: function(context) {
            context.register(InitInfoController.create());
        }
        
    });

    return InfoPlugin;
});