define(function(require) {

    var Protoplast = require('protoplast'),
        SettingsConfigProvider = require('plugin/settings/model/settings-config-provider'),
        SettingsWidgetModel = require('plugin/settings/model/settings-widget-model');
    
    var SettingsController = Protoplast.Object.extend({
        
        settingsWidgetModel: {
            inject: SettingsWidgetModel
        },

        init: function() {
            var settingsConfigProvider = SettingsConfigProvider.create();
            this.settingsWidgetModel.groups = settingsConfigProvider.getSettingGroups();
        }
    });

    return SettingsController;
});