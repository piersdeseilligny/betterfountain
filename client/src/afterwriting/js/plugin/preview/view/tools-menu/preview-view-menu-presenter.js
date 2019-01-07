define(function(require) {

    var BaseSectionViewPresenter = require('theme/aw-bubble/presenter/base-section-view-presenter'),
        IoModel = require('plugin/io/model/io-model'),
        SaveController = require('plugin/io/controller/save-controller');

    var PreviewViewMenuPresenter = BaseSectionViewPresenter.extend({

        pub: {
            inject: 'pub'
        },

        saveController: {
            inject: SaveController
        },

        ioModel: {
            inject: IoModel
        },

        init: function() {
            BaseSectionViewPresenter.init.call(this);

            this.view.on('save-as-pdf', this._savePdfLocally);
            this.view.on('dropbox-pdf', this._savePdfToDropbox);
            this.view.on('google-drive-pdf', this._savePdfToGoogleDrive);
        },

        activate: function() {
            BaseSectionViewPresenter.activate.call(this);

            this.view.displayOpenFromDropbox = this.ioModel.isDropboxAvailable;
            this.view.displayOpenFromGoogleDrive = this.ioModel.isGoogleDriveAvailable;
        },

        _savePdfLocally: function() {
            this.saveController.savePdfLocally();
            this.pub('plugin/io/save-pdf-locally');
        },

        _savePdfToDropbox: function() {
            this.saveController.savePdfToDropbox();
            this.pub('plugin/io/save-pdf-dropbox');
        },

        _savePdfToGoogleDrive: function() {
            this.saveController.savePdfToGoogleDrive();
            this.pub('plugin/io/save-pdf-google-drive');
        }

    });

    return PreviewViewMenuPresenter;
});