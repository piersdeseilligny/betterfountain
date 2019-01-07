define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        ThemeModel = require('theme/aw-bubble/model/theme-model');

    var SectionsPresenter = Protoplast.Object.extend({

        themeModel: {
            inject: ThemeModel
        },
        
        themeController: {
            inject: ThemeController
        },

        init: function() {
            Protoplast.utils.bind(this, 'themeModel.sections.selected', this.showSelectedSection.bind(this));
            Protoplast.utils.bindProperty(this, 'themeModel.sections', this.view, 'sections');
        },
        
        showSelectedSection: function() {
            this.view.hideAll(this._onAllHidden);
        },

        _onAllHidden: function() {
            this.themeController.allSectionsHidden();
            this.view.showSection(this.themeModel.sections.selected, this._onSelectedShown);
        },

        _onSelectedShown: function() {
            this.themeController.selectedSectionFullyVisible();
        }
        
    });

    return SectionsPresenter;
});