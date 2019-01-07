define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var TopMenuItemPresenter = Protoplast.Object.extend({

        pub: {
            inject: 'pub'
        },
        
        themeController: {
            inject: ThemeController
        },
        
        init: function() {
            this.view.on('clicked', this.sectionClicked.bind(this));
        },

        sectionClicked: function(isSelected) {
            if (!isSelected) {
                this.themeController.selectSection(this.view.section);
                this.pub('aw-bubble/top-menu/item/selected', this.view.section.name);
            }
        }

    });

    return TopMenuItemPresenter;
});