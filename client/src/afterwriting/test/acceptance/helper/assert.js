define(function(require) {

    var p = require('protoplast'),
        DropboxAssert = require('acceptance/helper/assert/dropbox-assert'),
        EditorAssert = require('acceptance/helper/assert/editor-assert'),
        GoogleDriveAssert = require('acceptance/helper/assert/google-drive-assert'),
        IoAssert = require('acceptance/helper/assert/io-assert'),
        MonitorAssert = require('acceptance/helper/assert/monitor-assert'),
        PopupAssert = require('acceptance/helper/assert/popup-assert'),
        FactsAssert = require('acceptance/helper/assert/facts-assert'),
        StatsAssert = require('acceptance/helper/assert/stats-assert'),
        PreviewAssert = require('acceptance/helper/assert/preview-assert'),
        ThemeAssert = require('acceptance/helper/assert/theme-assert');

    /**
     * Performs assertions, all chai/sinon assertions go here. 
     * Acceptance test should never call chai.assert directly. It should delegate to Assert helper. 
     */
    var Assert = p.extend({

        dropbox: null,
        
        editor: null,
        
        googleDrive: null,
        
        io: null,
        
        monitor: null,
        
        popup: null,

        facts: null,

        stats: null,

        preview: null,
        
        theme: null,
        
        $create: function(dom, dropbox, ga) {
            this.dropbox = DropboxAssert.create(dom, dropbox, ga);
            this.editor = EditorAssert.create(dom, dropbox, ga);
            this.googleDrive = GoogleDriveAssert.create(dom, dropbox, ga);
            this.io = IoAssert.create(dom, dropbox, ga);
            this.monitor = MonitorAssert.create(dom, dropbox, ga);
            this.popup = PopupAssert.create(dom, dropbox, ga);
            this.facts = FactsAssert.create(dom, dropbox, ga);
            this.stats = StatsAssert.create(dom, dropbox, ga);
            this.preview = PreviewAssert.create(dom, dropbox, ga);
            this.theme = ThemeAssert.create(dom, dropbox, ga);
        }
        
    });

    
    return Assert;
    
});