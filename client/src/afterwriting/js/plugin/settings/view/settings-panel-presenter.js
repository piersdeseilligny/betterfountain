define(function(require) {

    var Protoplast = require('protoplast'),
        SettingsWidgetModel = require('plugin/settings/model/settings-widget-model'),
        SettingsController = require('plugin/settings/controller/settings-controller');
    
    var SettingsPanelPresenter = Protoplast.Object.extend({

        settingsWidgetModel: {
            inject: SettingsWidgetModel
        },
        
        settings: {
            inject: 'settings'
        },

        controller: {
            inject: SettingsController
        },

        init: function() {
            Protoplast.utils.bind(this, 'settingsWidgetModel.groups', this._updateConfig);

            this.settings.on('changed', function(event) {
                var entry = this.settingsWidgetModel.getSettingEntry(event.key);
                if (entry) {
                    entry.control.value = event.value;
                }
            }.bind(this));

            this.view.on('configValueChanged', function(event) {
                this.controller.updateValue(event.key, event.value);
            }.bind(this));
        },

        _updateConfig: function() {
            this.view.config = this.settingsWidgetModel.groups;
            this.settingsWidgetModel.groups.forEach(function(group) {
                group.entries.forEach(function(entry) {
                    entry.control.value = this.settings[entry.key];
                }, this);
            }, this);
        }

    });

    return SettingsPanelPresenter;
});