define(function(require) {

    var Protoplast = require('protoplast'),
        IoModel = require('plugin/io/model/io-model'),
        gd = require('utils/googledrive'),
        db = require('utils/dropbox'),
        $ = require('jquery'),
        saveAs = require('saveAs'),
        tree = require('utils/tree'),
        forms = require('utils/forms');
    
    var SaveController = Protoplast.Object.extend({

        ioModel: {
            inject: IoModel
        },
        
        scriptModel: {
            inject: 'script'
        },
        
        settings: {
            inject: 'settings'
        },
        
        pdfController: {
            inject: 'pdf'
        },

        saveFountainLocally: function() {
            forms.text('Select file name:', this.ioModel.fountainFileName || 'screenplay.fountain', function (result) {
                var blob = new Blob([this.scriptModel.script], {
                    type: "text/plain;charset=utf-8"
                });
                this.ioModel.fountainFileName = result.text;
                this.ioModel.pdfFileName = result.text.split('.')[0] + '.pdf';
                saveAs(blob, result.text);
            }.bind(this));
        },

        saveFountainToDropbox: function() {
            this._saveToCloud({
                client: db,
                save_callback: function (selected, filename) {
                    var path = selected.data.path,
                        blob = new Blob([this.scriptModel.script], {
                            type: "text/plain;charset=utf-8"
                        });
                    if (selected.data.isFolder) {
                        path += (path[path.length - 1] !== '/' ? '/' : '') + filename;
                    }
                    db.save(path, blob, function (error) {
                        if (error) {
                            this._fileNotSaved();
                            return;
                        }
                        if (filename) {
                            this.ioModel.fountainFileName = filename;
                        }
                        this._fileSaved();
                        this.dispatch('fountain-saved-to-dropbox', path);
                    }.bind(this));
                }.bind(this),
                selected: this.ioModel.dbPath,
                list_options: {
                    lazy: this.settings.cloud_lazy_loading
                },
                default_filename: 'screenplay.fountain'
            });
        },

        saveFountainToGoogleDrive: function() {
            this._saveToCloud({
                client: gd,
                save_callback: function (selected, filename) {
                    var blob = new Blob([this.scriptModel.script], {
                        type: "text/plain;charset=utf-8"
                    });
                    gd.upload({
                        blob: blob,
                        convert: /\.gdoc$/.test(filename),
                        filename: filename,
                        callback: function (file) {
                            if (filename) {
                                this.ioModel.fountainFileName = filename;
                            }
                            this._fileSaved();
                            this.dispatch('fountain-saved-to-google-drive', file);
                        }.bind(this),
                        parents: selected.data.isRoot ? [] : [selected.data],
                        fileid: selected.data.isFolder ? null : selected.data.id
                    });
                }.bind(this),
                selected: this.ioModel.gdFileId,
                selected_parents: this.ioModel.gdParents,
                list_options: {
                    writeOnly: true,
                    lazy: this.settings.cloud_lazy_loading
                },
                default_filename: 'screenplay.fountain'
            });
        },

        savePdfLocally: function() {
            forms.text('Select file name:', this.ioModel.pdfFileName || 'screenplay.pdf', function (result) {
                this.pdfController.getPdf(function (pdf) {
                    this.ioModel.pdfFileName = result.text;
                    this.ioModel.fountainFileName = result.text.split('.')[0] + '.fountain';
                    saveAs(pdf.blob, result.text);
                }.bind(this));
            }.bind(this));
        },

        savePdfToDropbox: function() {
            this._saveToCloud({
                client: db,
                save_callback: function (selected, filename) {
                    var path = selected.data.path;
                    if (selected.data.isFolder) {
                        path += (path[path.length - 1] !== '/' ? '/' : '') + filename;
                    }
                    this.pdfController.getPdf(function (result) {
                        db.save(path, result.blob, function (error) {
                            if (error) {
                                this._fileNotSaved();
                                return;
                            }
                            if (filename) {
                                this.ioModel.pdfFileName = filename;
                            }
                            this._fileSaved();
                        }.bind(this));
                    }.bind(this));
                }.bind(this),
                selected: this.ioModel.dbPdfPath,
                list_options: {
                    pdfOnly: true,
                    lazy: this.settings.cloud_lazy_loading
                },
                default_filename: 'screenplay.pdf'
            });
        },

        savePdfToGoogleDrive: function() {
            this._saveToCloud({
                client: gd,
                save_callback: function (selected, filename) {
                    this.pdfController.getPdf(function (pdf) {
                        gd.upload({
                            blob: pdf.blob,
                            filename: filename,
                            callback: function (file) {
                                if (filename) {
                                    this.ioModel.pdfFileName = filename;
                                }
                                this._fileSaved();
                                this.ioModel.gdPdfId = file.id;
                                var selected_parents = selected.parents.slice(0, selected.parents.length-2);
                                if (selected.type === 'default') {
                                    selected_parents.unshift(selected.id);
                                }
                                this.ioModel.gdPdfParents = selected_parents.reverse();
                            }.bind(this),
                            convert: false,
                            parents: selected.data.isRoot ? [] : [selected.data],
                            fileid: selected.data.isFolder ? null : selected.data.id
                        });
                    }.bind(this));
                }.bind(this),
                selected: this.ioModel.gdPdfId,
                selected_parents: this.ioModel.gdPdfParents,
                list_options: {
                    pdfOnly: true,
                    writeOnly: true,
                    lazy: this.settings.cloud_lazy_loading
                },
                default_filename: 'screenplay.pdf'
            });
        },

        destroy: function() {
            db.destroy();
        },

        /**
         * Save to the cloud using options:
         *  client - cloud client (dropox/googledrive)
         *  list_options - options passed to the client's list call
         *  selected - selected item
         *  default_filename - default filename if none has been used before
         *  save_callback - function call to save the file
         */
        _saveToCloud: function (options) {
            options.list_options = options.list_options || {};
            options.list_options.before = function () {
                $.prompt('Please wait...');
            };
            options.list_options.after = $.prompt.close;
            options.client.list(function (root) {
                root = typeof root !== 'function' ? options.client.convert_to_jstree(root) : root;
                tree.show({
                    data: root,
                    selected: options.selected,
                    selected_parents: options.selected_parents,
                    filename: options.default_filename,
                    save: true,
                    info: 'Select a file to override or choose a folder to save as a new file.',
                    callback: function (selected, filename) {
                        $.prompt('Please wait...');
                        options.save_callback(selected, filename);
                    }
                });
            }, options.list_options);
        },

        /**
         * Display file saved message
         */
        _fileSaved: function() {
            $.prompt.close();
            $.prompt('File saved!');
        },

        /**
         * Display file not saved message
         * @private
         */
        _fileNotSaved: function() {
            $.prompt.close();
            $.prompt('Could not save the file. Try again later.');
        }

    });

    return SaveController;
});