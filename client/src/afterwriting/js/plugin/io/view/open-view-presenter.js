define(function(require) {

    var Protoplast = require('protoplast'),
        BaseSectionViewPresenter = require('theme/aw-bubble/presenter/base-section-view-presenter'),
        IoModel = require('plugin/io/model/io-model'),
        OpenController = require('plugin/io/controller/open-controller');

    /**
     * @extends BaseSectionViewPresenter
     */
    var OpenViewPresenter = BaseSectionViewPresenter.extend({

        pub: {
            inject: 'pub'
        },
        
        openController: {
            inject: OpenController
        },

        ioModel: {
            inject: IoModel
        },

        init: function() {
            BaseSectionViewPresenter.init.call(this);
            
            Protoplast.utils.bindProperty(this.ioModel, 'lastUsedInfo', this.view, 'lastUsedInfo');

            this.view.on('open-sample', this._openSample);
            this.view.on('create-new', this._createNew);
            this.view.on('open-last-used', this._openLastUsed);
            this.view.on('open-file', this._openFile);
            this.view.on('open-file-dialog', this._openFileDialog);
            this.view.on('open-from-dropbox', this._openFromDropbox);
            this.view.on('open-from-google-drive', this._openFromGoogleDrive);
        },

        activate: function() {
            BaseSectionViewPresenter.activate.call(this);

            this.view.displayOpenFromDropbox = this.ioModel.isDropboxAvailable;
            this.view.displayOpenFromGoogleDrive = this.ioModel.isGoogleDriveAvailable;
        },
        
        _createNew: function() {
            this.openController.createNew();
            this.pub('plugin/io/create-new');
        },

        _openSample: function(name) {
            this.openController.openSample(name);
            this.pub('plugin/io/open-sample', name);
        },
        
        _openLastUsed: function() {
            this.openController.openLastUsed();
            this.pub('plugin/io/open-last-used');
        },
        
        _openFileDialog: function() {
            this.pub('plugin/io/open-local-file-dialog');
        },

        _openFile: function(selectedFile) {
            this.openController.openFile(selectedFile);
        },
        
        _openFromDropbox: function() {
            this.openController.openFromDropbox();
        },
        
        _openFromGoogleDrive: function() {
            this.openController.openFromGoogleDrive();
        }
        
    });

    return OpenViewPresenter;
});