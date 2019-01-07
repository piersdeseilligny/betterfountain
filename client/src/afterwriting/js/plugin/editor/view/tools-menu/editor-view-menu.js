define(function(require) {

    var template = require('text!plugin/editor/view/tools-menu/editor-view-menu.hbs'),
        Protoplast = require('protoplast'),
        BaseComponent = require('core/view/base-component'),
        EditorViewMenuPresenter = require('plugin/editor/view/tools-menu/editor-view-menu-presenter'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin');

    // TODO: Create base save menu view/presenter :) (preview+save) (+)
    return BaseComponent.extend([SectionViewMixin], {

        $meta: {
            presenter: EditorViewMenuPresenter
        },

        hbs: template,
    
        saveInProgress: false,
    
        pendingChanges: false,
    
        isSyncEnabled: false,
    
        isAutoSaveEnabled: false,
    
        syncAvailable: false,
    
        autoSaveAvailable: false,
    
        syncOnIcon: 'gfx/icons/other/sync.svg',
    
        syncOffIcon: 'gfx/icons/other/no-sync.svg',

        $autoSaveIcon: null,

        $autoLoadIcon: null,

        $saveFountainLocally: null,

        $saveFountainDropbox: null,

        $saveFountainGoogleDrive: null,

        $autoSave: null,
        
        $autoLoad: null,
        
        $saveDropbox: null,
        
        $saveGoogleDrive: null,

        displayOpenFromDropbox: false,

        displayOpenFromGoogleDrive: false,
        
        addBindings: function() {
            Protoplast.utils.bind(this, {
                isSyncEnabled: this._updateSync,
                isAutoSaveEnabled: this._updateAutoSave,
                syncAvailable: [this._updateSyncAvailability, this._updateSync],
                autoSaveAvailable: [this._updateAutoSaveAvailability, this._updateAutoSave],
                saveInProgress: this._updateAnimation,
                pendingChanges: this._updateAnimation,
                displayOpenFromDropbox: this._updateOpenFromDropboxVisibility,
                displayOpenFromGoogleDrive: this._updateOpenFromGoogleDriveVisibility
            });
        },
        
        addInteractions: function() {
            this.$saveFountainLocally.click(this.dispatch.bind(this, 'save-as-fountain'));
            this.$saveFountainDropbox.click(this.dispatch.bind(this, 'dropbox-fountain'));
            this.$saveFountainGoogleDrive.click(this.dispatch.bind(this, 'google-drive-fountain'));
    
            this.$autoLoad.click(function() {
                if (this.isSyncEnabled) {
                    this.dispatch('disableSync');
                }
                else {
                    this.dispatch('enableSync');
                }
            }.bind(this));
    
            this.$autoSave.click(function() {
                this.dispatch('toggleAutoSave');
            }.bind(this));
        },
    
        _updateSync: function() {
            this.$autoLoadIcon
                .attr('src', this.isSyncEnabled ? this.syncOnIcon : this.syncOffIcon)
                .attr('title', this.isSyncEnabled ? 'Turn auto-reload off' : 'Turn auto-reload on');
        },
    
        _updateAutoSave: function() {
            this.$autoSaveIcon
                .attr('src', this.isAutoSaveEnabled ? this.syncOnIcon : this.syncOffIcon)
                .attr('title', this.isAutoSaveEnabled ? 'Turn auto-save off' : 'Turn auto-save on');
        },
    
        _updateSyncAvailability: function() {
            if (this.syncAvailable) {
                this.$autoLoad.parent().show();
            }
            else {
                this.$autoLoad.parent().hide();
            }
        },
    
        _updateAutoSaveAvailability: function() {
            if (this.autoSaveAvailable) {
                this.$autoSave.parent().show();
            }
            else {
                this.$autoSave.parent().hide();
            }
        },
    
        _updateAnimation: function() {
            if (this.isAutoSaveEnabled) {
                if (this.pendingChanges || this.saveInProgress) {
                    this.$autoSaveIcon.addClass('in-progress');
                }
                else {
                    this.$autoSaveIcon.removeClass('in-progress');
                }
            
                if (this.saveInProgress) {
                    this.$autoSaveIcon.addClass('rotate');
                }
                else {
                    this.$autoSaveIcon.removeClass('rotate');
                }
            }
            else {
                this.$autoSaveIcon.removeClass('rotate').removeClass('in-progress');
            }
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

