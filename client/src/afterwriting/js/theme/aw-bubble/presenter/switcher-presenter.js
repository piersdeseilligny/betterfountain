define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var SwitcherPresenter = Protoplast.Object.extend({
        
        pub: {
            inject: 'pub'
        },
        
        themeController: {
            inject: ThemeController
        },
        
        init: function() {
            this.view.on('clicked', this._switchToSection);
        },
        
        _switchToSection: function() {
            this.themeController.selectSectionByName(this.view.sectionName);
            this.pub('aw-bubble/switcher/clicked', this.view.sectionName);
        }
        
    });

    return SwitcherPresenter;
});