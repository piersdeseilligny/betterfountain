define(function(require) {

    var $ = require('jquery'),
        local = require('utils/local'),
        Protoplast = require('protoplast'),
        BaseSectionViewPresenter = require('theme/aw-bubble/presenter/base-section-view-presenter'),
        IoModel = require('plugin/io/model/io-model'),
        SaveController = require('plugin/io/controller/save-controller'),
        EditorController = require('plugin/editor/controller/editor-controller'),
        EditorModel = require('plugin/editor/model/editor-model');

    /**
     * @extends BaseSectionViewPresenter
     */
    var EditViewMenuPresenter = BaseSectionViewPresenter.extend({

        pub: {
            inject: 'pub'
        },

        editorModel: {
            inject: EditorModel
        },

        editorController: {
            inject: EditorController
        },

        saveController: {
            inject: SaveController
        },

        ioModel: {
            inject: IoModel
        },
        
        init: function() {
            BaseSectionViewPresenter.init.call(this);

            this.view.on('save-as-fountain', this._saveFountainLocally);
            this.view.on('dropbox-fountain', this._saveFountainToDropbox);
            this.view.on('google-drive-fountain', this._saveFountainToGoogleDrive);

            this.view.on('disableSync', this._disableSync, this);
            this.view.on('enableSync', this._enableSync, this);
            this.view.on('toggleAutoSave', this._toggleAutoSave, this);

            Protoplast.utils.bindProperty(this.editorModel, 'isSyncEnabled' , this.view, 'isSyncEnabled');
            Protoplast.utils.bindProperty(this.editorModel, 'isAutoSaveEnabled' , this.view, 'isAutoSaveEnabled');
            Protoplast.utils.bindProperty(this.editorModel, 'saveInProgress' , this.view, 'saveInProgress');
            Protoplast.utils.bindProperty(this.editorModel, 'pendingChange' , this.view, 'pendingChanges');
        },

        activate: function() {
            BaseSectionViewPresenter.activate.call(this);

            this.view.displayOpenFromDropbox = this.ioModel.isDropboxAvailable;
            this.view.displayOpenFromGoogleDrive = this.ioModel.isGoogleDriveAvailable;

            // TODO: decouple from io (++)
            this.view.autoSaveAvailable = !!((this.ioModel.gdFileId || this.ioModel.dbPath) && this.scriptModel.format !== 'fdx');
            this.view.syncAvailable = !!(this.ioModel.gdFileId || this.ioModel.dbPath || local.sync_available());
        },

        _saveFountainLocally: function() {
            this.saveController.saveFountainLocally();
            this.pub('plugin/io/save-fountain-locally');
        },

        _saveFountainToDropbox: function() {
            this.saveController.saveFountainToDropbox();
            this.pub('plugin/io/save-fountain-dropbox');
        },

        _saveFountainToGoogleDrive: function() {
            this.saveController.saveFountainToGoogleDrive();
            this.pub('plugin/io/save-fountain-google-drive');
        },

        _toggleAutoSave: function() {
            if (this.editorModel.isSyncEnabled) {
                var controller = this.editorController;
                $.prompt('This will turn auto-reload off. Do you wish to continue?', {
                    buttons: {'Yes': true, 'No': 'false'},
                    submit: function(e, v) {
                        if (v) {
                            controller.toggleAutoSave();
                        }
                    }
                });
            }
            else {
                this.editorController.toggleAutoSave();
            }
        },

        _enableSync: function() {
            var self = this;
            $.prompt("You can start writing in your editor. Content will be synchronized with ’afterwriting! PDF preview, facts and stats will be automatically updated.", {
                buttons: {'OK': true, 'Cancel': false},
                submit: function(e, v) {
                    if (v) {
                        self.editorController.toggleSync();
                    }
                }
            });
        },

        _disableSync: function() {
            var self = this;
            $.prompt('Synchronization turned off.', {
                buttons: {'Keep content': true, 'Load version before sync': false},
                submit: function(e, v) {
                    if (!v) {
                        self._restore();
                    }
                    self.editorController.toggleSync();
                }
            });
        },

        _restore: function() {
            this.editorController.restoreBeforeSync();
        }

    });

    return EditViewMenuPresenter;
});