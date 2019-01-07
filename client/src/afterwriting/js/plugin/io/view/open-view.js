define(function(require) {

    var Protoplast = require('protoplast'),
        template = require('text!plugin/io/view/open.hbs'),
        OpenViewPresenter = require('plugin/io/view/open-view-presenter'),
        $ = require('jquery'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin'),
        BaseComponent = require('core/view/base-component');
    
    return BaseComponent.extend([SectionViewMixin], {

        $meta: {
            presenter: OpenViewPresenter
        },
        
        hbs: template,
        
        lastUsedInfo: null,

        displayOpenFromDropbox: false,

        displayOpenFromGoogleDrive: false,

        $openNew: null,

        $openLocalFile: null,

        $openDropboxFile: null,

        $openGoogleDriveFile: null,

        $create: function() {
            this.$lastUsed.hide();
        },

        addBindings: function() {
            Protoplast.utils.bind(this, {
                lastUsedInfo: this._updateLastUsedInfo,
                displayOpenFromDropbox: this._updateOpenFromDropboxVisibility,
                displayOpenFromGoogleDrive: this._updateOpenFromGoogleDriveVisibility
            });
        },
        
        addInteractions: function() {

            var self = this;

            this.$openNew.click(self.dispatch.bind(this, 'create-new'));

            var $aSample = this._wrapSelector('a[open-action="sample"]');
            $aSample.click(function() {
                var name = $(this).attr('value');
                self.dispatch('open-sample', name);
            });
            
            this.$lastUsedTitle.click(self.dispatch.bind(this, 'open-last-used'));
            this.$openDropboxFile.click(self.dispatch.bind(this, 'open-from-dropbox'));
            this.$openGoogleDriveFile.click(self.dispatch.bind(this, 'open-from-google-drive'));

            this._resetFileInput();

            this.$openLocalFile.click(function() {
                this.dispatch('open-file-dialog');
                this.$root.find("#open-file").click();
            }.bind(this));
        },

        $lastUsed: null,

        $lastUsedTitle: null,

        $lastUsedDate: null,

        $fileWrapper: null,

        _resetFileInput: function() {
            this.$fileWrapper.off();
            this.$fileWrapper.empty()
                .html('<input id="open-file" type="file" style="display:none" />');

            this.$fileWrapper.change(function() {
                var selected_file = this.$root.find('#open-file').get(0).files.item(0);
                this.dispatch('open-file', selected_file);
                this._resetFileInput();
            }.bind(this));
        },

        _updateOpenFromDropboxVisibility: function() {
            if (this.displayOpenFromDropbox) {
                this.$openDropboxFile.parent().show();
            } else {
                this.$openDropboxFile.parent().hide();
            }
        },

        _updateOpenFromGoogleDriveVisibility: function() {
            if (this.displayOpenFromGoogleDrive) {
                this.$openGoogleDriveFile.parent().show();
            } else {
                this.$openGoogleDriveFile.parent().hide();
            }
        },

        _updateLastUsedInfo: function() {
            if (this.lastUsedInfo) {
                this.$lastUsed.show();
                this.$lastUsedTitle.text(this.lastUsedInfo.title);
                this.$lastUsedDate.text('(' + this.lastUsedInfo.date + ')');
            }
            else {
                this.$lastUsed.hide();
            }
        }
        
    });

});
