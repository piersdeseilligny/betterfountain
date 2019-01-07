define(function(require) {

    var Plugin = require('core/plugin'),
        IoModel = require('plugin/io/model/io-model'),
        InitIoController = require('plugin/io/controller/init-io-controller'),
        OpenController = require('plugin/io/controller/open-controller'),
        SaveController = require('plugin/io/controller/save-controller'),
        SaveMobileController = require('plugin/io/controller/save-mobile-controller'),
        MobileScriptSettings = require('plugin/io/model/mobile-script-settings'),
        MobileScriptModel = require('plugin/io/model/mobile-script-model');

    var IoPlugin = Plugin.extend({

        $create: function(context) {
            context.register(InitIoController.create());
            context.register(OpenController.create());
            context.register(SaveController.create());
            context.register(SaveMobileController.create());
            context.register(MobileScriptModel.create());
            context.register(MobileScriptSettings.create());
            context.register(IoModel.create());
        }

    });

    return IoPlugin;
});