define(function(require) {

    var Plugin = require('core/plugin'),
        MonitorController = require('plugin/monitor/controller/monitor-controller');

    var MonitorPlugin = Plugin.extend({

        $create: function(context) {
            context.register(MonitorController.create());
        }
        
    });

    return MonitorPlugin;
});