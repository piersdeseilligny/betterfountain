define(function(require) {

    var BaseSectionViewPresenter = require('theme/aw-bubble/presenter/base-section-view-presenter'),
        IoModel = require('plugin/io/model/io-model'),
        SaveController = require('plugin/io/controller/save-controller'),
        SaveMobileController = require('plugin/io/controller/save-mobile-controller');

    var SaveViewPresenter = BaseSectionViewPresenter.extend({

        pub: {
            inject: 'pub'
        },

        saveController: {
            inject: SaveController
        },
        
        saveMobileController: {
            inject: SaveMobileController
        },

        ioModel: {
            inject: IoModel
        },
        
        init: function() {
            BaseSectionViewPresenter.init.call(this);
            
            this.view.on('save-as-fountain', this._saveFountainLocally);
            this.view.on('dropbox-fountain', this._saveFountainToDropbox);
            this.view.on('google-drive-fountain', this._saveFountainToGoogleDrive);

            this.view.on('save-as-pdf', this._savePdfLocally);
            this.view.on('dropbox-pdf', this._savePdfToDropbox);
            this.view.on('google-drive-pdf', this._savePdfToGoogleDrive);

            this.view.on('save-as-mobile-pdf', this._saveMobilePdfLocally);
        },
        
        activate: function() {
            BaseSectionViewPresenter.activate.call(this);

            this.view.displayOpenFromDropbox = this.ioModel.isDropboxAvailable;
            this.view.displayOpenFromGoogleDrive = this.ioModel.isGoogleDriveAvailable;
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
        },
        
        _saveMobilePdfLocally: function() {
            this.saveMobileController.saveMobilePdfLocally();
            this.pub('plugin/io/save-mobile-pdf');
        }
    });

    return SaveViewPresenter;
});