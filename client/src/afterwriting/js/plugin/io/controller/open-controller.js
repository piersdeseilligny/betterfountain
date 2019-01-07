define(function(require) {

    var Protoplast = require('protoplast'),
        db = require('utils/dropbox'),
        gd = require('utils/googledrive'),
        local = require('utils/local'),
        tree = require('utils/tree'),
        helper = require('utils/helper'),
        EditorController = require('plugin/editor/controller/editor-controller'),
        LastUsedInfo = require('plugin/io/model/last-used-info'),
        IoModel = require('plugin/io/model/io-model'),
        SaveController = require('plugin/io/controller/save-controller'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        samples = require('samples');
    
    var OpenController = Protoplast.Object.extend({

        pub: {
            inject: 'pub'
        },

        scriptModel: {
            inject: 'script'
        },
        
        storage: {
            inject: 'storage'
        },
        
        settings: {
            inject: 'settings'
        },
        
        themeController: {
            inject: ThemeController
        },
        
        ioModel: {
            inject: IoModel
        },

        saveController: {
            inject: SaveController
        },
        
        editorController:{
            inject: EditorController
        },

        settingsLoaderModel: {
            inject: 'settingsLoaderModel'
        },

        init: function() {

            gd.init();
            db.init();

            this.saveController.on('fountain-saved-to-google-drive', this._savedToGoogleDrive);
            this.saveController.on('fountain-saved-to-dropbox', this._savedToDropbox);

            Protoplast.utils.bind(this.scriptModel, 'script', function () {
                var title = '';
                this.storage.setItem('last-used-script', this.scriptModel.script);
                this.storage.setItem('last-used-date', helper.format_date(new Date()));
                if (this.scriptModel.script) {
                    var title_match;
                    var wait_for_non_empty = false;
                    this.scriptModel.script.split('\n').some(function (line) {
                        title_match = line.match(/title\:(.*)/i);
                        if (wait_for_non_empty) {
                            title = line.trim().replace(/\*/g, '').replace(/_/g, '');
                            wait_for_non_empty = !title;
                        }
                        if (title_match) {
                            title = title_match[1].trim();
                            wait_for_non_empty = !title;
                        }
                        return title && !wait_for_non_empty;
                    });
                }
                this.storage.setItem('last-used-title', title || 'No title');
            }.bind(this));

            if (this.storage.getItem('last-used-date')) {
                this.ioModel.fileName = '';
                // log.info('Last used exists. Loading: ', data.data('last-used-title'), data.data('last-used-date'));
                var lastUsedInfo = LastUsedInfo.create();
                lastUsedInfo.script = this.storage.getItem('last-used-script');
                lastUsedInfo.date = this.storage.getItem('last-used-date');
                lastUsedInfo.title = this.storage.getItem('last-used-title');
                this.ioModel.lastUsedInfo = lastUsedInfo;
            }

            Protoplast.utils.bind(this, 'settingsLoaderModel.userSettingsLoaded', this._openLastUsedOnStartup);
        },

        createNew: function() {
            this._setScript('');
        },

        openSample: function(name) {
            var file_name = 'samples/' + name + '.fountain';
            var text = samples[file_name]();
            this._setScript(text);
        },

        openLastUsed: function() {
            if (this.ioModel.lastUsedInfo) {
                this._setScript(this.ioModel.lastUsedInfo.script);
            }
        },

        openFile: function(selectedFile) {
            var fileReader = new FileReader();
            var self = this;
            fileReader.onload = function () {
                var value = this.result;
                self._setScript(value);
                local.local_file = selectedFile;
                self.pub('plugin/io/opened-local-file', self.scriptModel.format);
            };
            fileReader.readAsText(selectedFile);
        },

        openFromDropbox: function() {
            this._openFromCloud(db, this._openFromDropbox, function (selected) {
                db.load_file(selected.data.path, function (content) {
                    this._setScript(content);
                    this.ioModel.dbPath = selected.data.path;
                    this.pub('plugin/io/opened-from-dropbox', this.scriptModel.format);
                }.bind(this));
            }.bind(this));
        },

        openFromGoogleDrive: function () {
            this._openFromCloud(gd, this.openFromGoogleDrive, function (selected) {
                gd.load_file(selected.data.id, function (content, link, fileid) {
                    this._setScript(content);
                    this.ioModel.gdLink = link;
                    this.ioModel.gdFileId = fileid;
                    this.ioModel.gdParents = selected.parents.slice(0, selected.parents.length-2).reverse();
                    this.pub('plugin/io/opened-from-google-drive', this.scriptModel.format);
                }.bind(this));
            }.bind(this));
        },

        _openLastUsedOnStartup: function() {
            if (this.settings.load_last_opened) {
                this.openLastUsed();
                this.pub('plugin/io/startup/opened-last-used');
            }
        },

        _savedToGoogleDrive: function(item) {
            this._clearLastOpened();
            this.ioModel.gdLink = item.alternateLink;
            this.ioModel.gdFileId = item.id;
            this.ioModel.fileName = '';
        },

        _savedToDropbox: function(path) {
            this._clearLastOpened();
            this.ioModel.dbPath = path;
            this.ioModel.fileName = '';
        },

        _openFromCloud: function (client, back_callback, load_callback) {
            client.list(function (root) {
                root = typeof root !== 'function' ? client.convert_to_jstree(root) : root;
                tree.show({
                    info: 'Please select file to open.',
                    data: root,
                    label: 'Open',
                    search: !this.settings.cloud_lazy_loading,
                    callback: function (selected) {
                        if (selected.data.isFolder) {
                            $.prompt('Please select a file, not folder.', {
                                buttons: {
                                    'Back': true,
                                    'Cancel': false
                                },
                                submit: function (v) {
                                    if (v) {
                                        back_callback();
                                    }
                                }
                            });
                        } else {
                            load_callback(selected);
                        }
                    }
                });
            }.bind(this), {
                before: function () {
                    $.prompt('Please wait...');
                },
                after: $.prompt.close,
                lazy: this.settings.cloud_lazy_loading
            });
        },

        _setScript: function(value) {
            this._clearLastOpened();
            // TODO: remove dependency to editor (++)
            // https://github.com/ifrost/afterwriting-labs/issues/40
            // Encapsulate file related props in File objects (stuff like IoModel.dbPath)
            // and clean up the editor when file is set (in EditorController)
            this.editorController.cleanUp();
            this.scriptModel.script = value;
            this.themeController.clearSelectedSection();
        },

        _clearLastOpened: function() {
            this.scriptModel.format = undefined;
            this.ioModel.dbPath = '';
            this.ioModel.gdLink = '';
            this.ioModel.gdFileId = '';
            this.ioModel.gdPdfId = '';
            this.ioModel.dbPdfPath = '';
            this.ioModel.fountainFileName = '';
            this.ioModel.pdfFileName = '';
            local.local_file = null;
        }
        
    });

    return OpenController;
});