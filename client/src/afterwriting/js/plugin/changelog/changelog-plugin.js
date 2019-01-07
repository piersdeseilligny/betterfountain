define(function(require) {

    var Plugin = require('core/plugin'),
        InitChangelogController = require('plugin/changelog/controller/init-changelog-controller');

    var ChangelogPlugin = Plugin.extend({
        
        $create: function(context) {
            context.register(InitChangelogController.create());
        }
        
    });

    return ChangelogPlugin;
});