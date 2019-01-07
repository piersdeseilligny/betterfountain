define(function(require) {

    var Plugin = require('core/plugin'),
        InitStatsController = require('plugin/stats/controller/init-stats-controller'),
        StatsController = require('plugin/stats/controller/stats-controller');

    var StatsPlugin = Plugin.extend({
        
        $create: function(context) {
            context.register(InitStatsController.create());
            context.register(StatsController.create());
        }
    });

    return StatsPlugin;
});