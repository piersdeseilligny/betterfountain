define(function(require) {

    var Plugin = require('core/plugin'),
        InitPreviewController = require('plugin/preview/controller/init-preview-controller'),
        PreviewController = require('plugin/preview/controller/preview-controller');

    var PreviewPlugin = Plugin.extend({

        $create: function(context) {
            context.register(InitPreviewController.create());
            context.register(PreviewController.create());
        }

    });

    return PreviewPlugin;
});