define(function(require) {

    var Plugin = require('core/plugin'),
        InitSettingsController = require('plugin/settings/controller/init-settings-controller'),
        SettingsController = require('plugin/settings/controller/settings-controller'),
        SettingsWidgetsController = require('plugin/settings/controller/settings-widgets-controller'),
        SettingsWidgetModel = require('plugin/settings/model/settings-widget-model'),
        SettingsLoaderModel = require('plugin/settings/model/settings-loader-model');

    var SettingsPlugin = Plugin.extend({

        $create: function(context) {
            context.register(InitSettingsController.create());
            context.register(SettingsWidgetModel.create());
            context.register('settingsLoaderModel', SettingsLoaderModel.create());
            context.register(SettingsController.create());
            context.register(SettingsWidgetsController.create());
        }

    });

    return SettingsPlugin;
});