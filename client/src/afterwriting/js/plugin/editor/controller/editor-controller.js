define(function(require) {

    var Protoplast = require('protoplast'),
        IoModel = require('plugin/io/model/io-model'),
        converter = require('utils/converters/scriptconverter'),
        gd = require('utils/googledrive'),
        db = require('utils/dropbox'),
        local = require('utils/local'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        EditorModel = require('plugin/editor/model/editor-model');

    var EditorController = Protoplast.Object.extend({

        pub: {
            inject: 'pub'
        },

        scriptModel: {
            inject: 'script'
        },

        // TODO: decouple io? (+)
        ioModel: {
            inject: IoModel
        },

        editorModel: {
            inject: EditorModel
        },

        themeController: {
            inject: ThemeController
        },

        autoSaveSyncTimer: null,

        cleanUp: function() {
            if (this.editorModel.isAutoSaveEnabled) {
                this.toggleAutoSave();
            }
            if (this.editorModel.isSyncEnabled) {
                this.toggleSync();
            }
        },

        toggleAutoSave: function() {
            if (!this.editorModel.isAutoSaveEnabled && this.editorModel.isSyncEnabled) {
                this.editorModel.toggleSync();
            }
            this.setAutoSave(!this.editorModel.isAutoSaveEnabled);
        },

        toggleSync: function() {
            this.editorModel.toggleSync();
            if (this.editorModel.isSyncEnabled) {
                this.editorModel.lastSyncContent = undefined;
                this.editorModel.contentBeforeSync = this.scriptModel.script;
                this.setAutoSave(false);
                if (this.ioModel.gdFileId) {
                    gd.sync(this.ioModel.gdFileId, 3000, this._handleSync);
                } else if (this.ioModel.dbPath) {
                    db.sync(this.ioModel.dbPath, 3000, this._handleSync);
                } else if (local.sync_available()) {
                    local.sync(3000, this._handleSync);
                }
                this.pub('plugin/editor/auto-reload/enabled', this._fileSource());
            }
            else {
                gd.unsync();
                db.unsync();
                local.unsync();
            }
        },

        restoreBeforeSync: function() {
            this.scriptModel.script = this.editorModel.contentBeforeSync;
        },

        _handleSync: function(content) {
            content = converter.to_fountain(content).value;
            if (content === undefined) {
                this.toggleSync();
            }
            else if (this.editorModel.lastSyncContent !== content) {
                this.editorModel.lastSyncContent = content; // kept separately as scriptModel processing may modify newline characters
                this.scriptModel.script = content;
            }
        },

        setAutoSave: function(value) {
            this.editorModel.isAutoSaveEnabled = value;
            if (this.editorModel.isAutoSaveEnabled && !this.autoSaveSyncTimer) {
                this.editorModel.pendingChanges = true; // trigger first save
                this.editorModel.saveInProgress = false;
                this.autoSaveSyncTimer = setInterval(this.saveCurrentScript, 3000);
                this.saveCurrentScript();
                this.pub('plugin/editor/auto-save/enabled', this._fileSource());
            }
            else {
                clearInterval(this.autoSaveSyncTimer);
                this.autoSaveSyncTimer = null;
                this.editorModel.pendingChanges = false;
                this.editorModel.saveInProgress = false;
            }
        },

        saveCurrentScript: function() {
            if (!this.editorModel.saveInProgress && this.editorModel.pendingChanges) {
                this.editorModel.pendingChanges = false;
                this.editorModel.saveInProgress = true;
                this._saveScript(function() {
                    this.editorModel.saveInProgress = false;
                }.bind(this));
            }
        },

        // TODO: move to io? (+)
        _saveScript: function(callback) {
            var blob;

            if (this.ioModel.dbPath) {
                var path = this.ioModel.dbPath;

                blob = new Blob([this.scriptModel.script], {
                    type: "text/plain;charset=utf-8"
                });

                db.save(path, blob, function() {
                    callback(true);
                });
            }
            else if (this.ioModel.gdFileId) {
                var fileId = this.ioModel.gdFileId;

                blob = new Blob([this.scriptModel.script], {
                    type: "text/plain;charset=utf-8"
                });

                gd.upload({
                    blob: blob,
                    callback: function() {
                        callback(true);
                    },
                    fileid: fileId
                });
            }
            else {
                callback(false);
            }
        },

        goto: function(line) {
            this.editorModel.cursorPosition = {
                ch: 0,
                line: line,
                xRel: 0
            };
            this.editorModel.scrollInfo = null;

            this.themeController.selectSectionByName('editor');
        },

        _fileSource: function() {
            if (this.ioModel.gdFileId) {
                return 'google-drive';
            } else if (this.ioModel.dbPath) {
                return 'dropbox';
            } else if (local.sync_available()) {
                return 'local';
            }
        }

    });

    return EditorController;
});