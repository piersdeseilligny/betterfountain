define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');
    
    var SettingsController = Protoplast.Object.extend({
        
        scriptModel: {
            inject: 'script'
        },

        settingsLoaderModel: {
            inject: 'settingsLoaderModel'
        },

        settings: {
            inject: 'settings'
        },

        storage: {
            inject: 'storage'
        },

        themeController: {
            inject: ThemeController
        },

        updateValue: function(key, value) {
            this.settings[key] = value;
        },

        /**
         * Load settings. It's run on app/init; can't be part of initialisation as
         * some modules (e.g. OpenController) may add binding only on init method,
         * which may happen after init of SettingsController
         */
        _loadSettings: {
            sub: 'app/init',
            value: function() {
                var userSettings =  this.storage.getItem('settings');
                this.settings.fromJSON(userSettings || {});
                this.settingsLoaderModel.userSettingsLoaded = true;
                this.settings.on('changed', this._saveCurrentSettings, this);

                Protoplast.utils.bind(this, {
                    'settings.night_mode': this.themeController.nightMode,
                    'settings.show_background_image': this.themeController.showBackgroundImage
                });
            }
        },

        _saveCurrentSettings: function() {
            this.scriptModel.script = this.scriptModel.script; // parse again (e.g. to add/hide tokens)
            this.storage.setItem('settings', this.settings.toJSON());
        }

    });

    return SettingsController;
});