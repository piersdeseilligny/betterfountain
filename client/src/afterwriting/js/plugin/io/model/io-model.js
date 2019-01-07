define(function(require) {

    var Protoplast = require('protoplast'),
        db = require('utils/dropbox'),
        gd = require('utils/googledrive');

    var IoModel = Protoplast.Model.extend({

        fileName: null,
        
        fountainFileName: null,
        
        pdfFileName: null,
        
        dbPath: null,
        
        dbPdfPath: null,
        
        gdLink: null,
        
        gdFileId: null,
        
        gdPdfId: null,
        
        gdParents: null,
        
        gdPdfParents: null,
        
        /**
         * @type {LastUsedInfo}
         */
        lastUsedInfo: undefined,

        /**
         * @type {boolean}
         */
        lastUsedInfoLoaded: false,

        isDropboxAvailable: {
            get: function () {
                return db.is_available();
            }
        },

        isGoogleDriveAvailable: {
            get: function () {
                return gd.is_available();
            }
        }
    });

    return IoModel;
});