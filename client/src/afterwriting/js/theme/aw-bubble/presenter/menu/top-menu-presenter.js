define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        ThemeModel = require('theme/aw-bubble/model/theme-model');

    var TopMenuPresenter = Protoplast.Model.extend({
        
        pub: {
            inject: 'pub'
        },
        
        sections: null,

        themeModel: {
            inject: ThemeModel
        },

        themeController: {
            inject: ThemeController
        },

        small: {
            get: function() {
                return this.themeModel.small;
            }
        },

        init: {
            injectInit: true,
            value: function() {
                Protoplast.utils.bind(this, 'themeModel.sectionsMenu', this.updateSections.bind(this));
                Protoplast.utils.bind(this, 'themeModel.sections.selected', this.updateSelectedSection.bind(this));

                this.view.on('close', this.closeCurrentContent.bind(this));
                this.view.on('swipe', this.swipeCurrentContent.bind(this));
                this.view.on('expand', this.toggleExpanded.bind(this));
            }
        },

        updateSections: function() {
            if (this.themeModel.sections.length) {
                this.view.sections = this.themeModel.sectionsMenu;
            }
        },
        
        updateSelectedSection: function() {
            this.view.setSelected(this.themeModel.sections.selected);
        },

        closeCurrentContent: function() {
            var currentSection = this.themeModel.sections.selected;
            this.themeController.clearSelectedSection();
            this.pub('aw-bubble/top-menu/close', currentSection.name);
        },

        swipeCurrentContent: function() {
            var currentSection = this.themeModel.sections.selected;
            this.themeController.clearSelectedSection();
            this.pub('aw-bubble/top-menu/swipe/close', currentSection.name);
        },

        toggleExpanded: function() {
            this.themeController.toggleExpanded();
            this.pub('aw-bubble/top-menu/expand');
        },

        $create: function() {
            this.sections = Protoplast.Collection.create();
        }

    });

    return TopMenuPresenter;
});