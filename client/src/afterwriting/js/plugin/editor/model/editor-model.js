define(function(require) {

    var Protoplast = require('protoplast');

    var EditorModel = Protoplast.Model.extend({
        
        saveInProgress: false,
        
        pendingChanges: false,
        
        isSyncEnabled: false,
        
        isAutoSaveEnabled: false,
        
        contentBeforeSync: '',
        
        lastSyncContent: '',
        
        cursorPosition: null,
        
        scrollInfo: null,
        
        toggleSync: function() {
            this.contentBeforeSync = '';
            this.isSyncEnabled = !this.isSyncEnabled;
        }
        
    });

    return EditorModel;
});