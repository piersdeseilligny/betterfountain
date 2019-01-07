define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var BubbleMenuItemPresenter = Protoplast.Object.extend({

        pub: {
            inject: 'pub'
        },

        themeController: {
            inject: ThemeController
        },

        init: function() {
            this.view.on('clicked', this.selectSection.bind(this));
        },

        selectSection: function() {
            this.themeController.selectSection(this.view.section);
            this.pub('aw-bubble/main-menu/item/selected', this.view.section.name);
        }

    });

    return BubbleMenuItemPresenter;
});