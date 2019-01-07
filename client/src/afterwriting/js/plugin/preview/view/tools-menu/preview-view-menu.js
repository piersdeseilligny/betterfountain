define(function(require) {

    var template = require('text!plugin/preview/view/tools-menu/preview-view-menu.hbs'),
        Protoplast = require('protoplast'),
        BaseComponent = require('core/view/base-component'),
        PreviewViewMenuPresenter = require('plugin/preview/view/tools-menu/preview-view-menu-presenter'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin');

    return BaseComponent.extend([SectionViewMixin], {
    
        $meta: {
            presenter: PreviewViewMenuPresenter
        },
        
        hbs: template,

        $saveLocally: null,

        $saveDropbox: null,

        $saveGoogleDrive: null,

        displayOpenFromDropbox: false,

        displayOpenFromGoogleDrive: false,

        addBindings: function() {
            Protoplast.utils.bind(this, {
                displayOpenFromDropbox: this._updateOpenFromDropboxVisibility,
                displayOpenFromGoogleDrive: this._updateOpenFromGoogleDriveVisibility
            });
        },

        addInteractions: function() {
            this.$saveLocally.click(this.dispatch.bind(this, 'save-as-pdf'));
            this.$saveDropbox.click(this.dispatch.bind(this, 'dropbox-pdf'));
            this.$saveGoogleDrive.click(this.dispatch.bind(this, 'google-drive-pdf'));
        },

        _updateOpenFromDropboxVisibility: function() {
            if (this.displayOpenFromDropbox) {
                this.$saveDropbox.show();
            } else {
                this.$saveDropbox.hide();
            }
        },

        _updateOpenFromGoogleDriveVisibility: function() {
            if (this.displayOpenFromGoogleDrive) {
                this.$saveGoogleDrive.show();
            } else {
                this.$saveGoogleDrive.hide();
            }
        }

    });
});

