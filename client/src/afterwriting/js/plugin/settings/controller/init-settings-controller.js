define(function(require) {

    var Protoplast = require('protoplast'),
        SettingsSection = require('plugin/settings/model/settings-section'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var InitSettingsController = Protoplast.Object.extend({

        scriptModel: {
            inject: 'script'
        },

        themeController: {
            inject: ThemeController
        },

        init: function() {
            var settingsSection = SettingsSection.create('settings');
            this.themeController.addSection(settingsSection);

            Protoplast.utils.bind(this.scriptModel, 'script', function(){
                settingsSection.isVisibleInMenu = true;
            });
        }
        
    });

    return InitSettingsController;
});