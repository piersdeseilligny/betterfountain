define(function(require) {

    var Section = require('theme/aw-bubble/model/section'),
        SettingsView = require('plugin/settings/view/settings-view');

    var SettingsSection = Section.extend({
        
        title: 'Settings',

        shortTitle: 'setup',

        smallIcon: 'gfx/icons/settings.svg',

        isVisibleInMenu: false,

        description: 'You can change configuration here. Some settings (e.g. page size, double space between scenes) may affect statistics which are based on assumption that 1 page = 1 minute of a movie.',

        MainContent: {
            value: SettingsView
        }

    });

    return SettingsSection;
});