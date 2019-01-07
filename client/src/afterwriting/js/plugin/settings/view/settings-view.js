define(function(require) {

    var BaseComponent = require('core/view/base-component'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin'),
        SettingsPanel = require('plugin/settings/view/settings-panel');

    return BaseComponent.extend([SectionViewMixin], {

        hbs: '<div><div data-comp="settingsPanel"/></div>',

        settingsPanel: {
            component: SettingsPanel
        }

    });

});
