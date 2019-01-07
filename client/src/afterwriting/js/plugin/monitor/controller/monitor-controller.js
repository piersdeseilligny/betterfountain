define(function(require) {

    var Protoplast = require('protoplast');

    var MonitorController = Protoplast.Object.extend({

        monitor: {
            inject: 'monitor'
        },
        
        downloadLinkClicked: {
            sub: 'info/download-link/clicked',
            value: function() {
                this.monitor.track('feature', 'download');
            }
        },

        themeSectionDescriptionShown: {
            sub: 'aw-bubble/section-header/description/shown',
            value: function(sectionId) {
                this.monitor.track('feature', 'help', sectionId);
            }
        },

        themeBackgroundClicked: {
            sub: 'aw-bubble/background/clicked',
            value: function(lastSectionName) {
                this.monitor.track('navigation', 'back-close', lastSectionName);
            }
        },

        themeCloseCurrentContent: {
            sub: 'aw-bubble/top-menu/close',
            value: function(lastSectionName) {
                this.monitor.track('navigation', 'toolbar-close', lastSectionName);
            }
        },

        themeCloseWithSwipeCurrentContent: {
            sub: 'aw-bubble/top-menu/swipe/close',
            value: function(lastSectionName) {
                this.monitor.track('navigation', 'toolbar-swipe-close', lastSectionName);
            }
        },

        themeExpandContent: {
            sub: 'aw-bubble/top-menu/expand',
            value: function() {
                this.monitor.track('feature', 'expand');
            }
        },

        themeMainMenuItemSelected: {
            sub: 'aw-bubble/main-menu/item/selected',
            value: function(sectionName) {
                this.monitor.track('navigation', sectionName, 'main');
            }
        },

        themeTopMenuItemSelected: {
            sub: 'aw-bubble/top-menu/item/selected',
            value: function(sectionName) {
                this.monitor.track('navigation', sectionName, 'toolbar');
            }
        },

        themeSwitchToSection: {
            sub: 'aw-bubble/switcher/clicked',
            value: function(sectionName) {
                this.monitor.track('navigation', sectionName, 'switcher');
            }
        },

        openCreateNew: {
            sub: 'plugin/io/create-new',
            value: function() {
                this.monitor.track('feature', 'open-new');
            }
        },

        openLastUsed: {
            sub: 'plugin/io/open-last-used',
            value: function() {
                this.monitor.track('feature', 'open-last-used', 'manual');
            }
        },

        openLastUsedStartup: {
            sub: 'plugin/io/startup/opened-last-used',
            value: function() {
                this.monitor.track('feature', 'open-last-used', 'startup');
            }
        },

        openSample: {
            sub: 'plugin/io/open-sample',
            value: function(sampleName) {
                this.monitor.track('feature', 'open-sample', sampleName);
            }
        },

        openDialog: {
            sub: 'plugin/io/open-local-file-dialog',
            value: function() {
                this.monitor.track('feature', 'open-file-dialog');
            }
        },

        openLocalFile: {
            sub: 'plugin/io/opened-local-file',
            value: function(format) {
                this.monitor.track('feature', 'open-file-opened', format);
            }
        },

        openFromDropbox: {
            sub: 'plugin/io/opened-from-dropbox',
            value: function(format) {
                this.monitor.track('feature', 'open-dropbox', format);
            }
        },

        openFromGoogleDrive: {
            sub: 'plugin/io/opened-from-google-drive',
            value: function(format) {
                this.monitor.track('feature', 'open-googledrive', format);
            }
        },
        
        saveFountainLocally: {
            sub: 'plugin/io/save-fountain-locally',
            value: function() {
                this.monitor.track('feature', 'save-fountain');
            }
        },

        saveFountainDropbox: {
            sub: 'plugin/io/save-fountain-dropbox',
            value: function() {
                this.monitor.track('feature', 'save-fountain-dropbox');
            }
        },

        saveFountainGoogleDrive: {
            sub: 'plugin/io/save-fountain-google-drive',
            value: function() {
                this.monitor.track('feature', 'save-fountain-googledrive');
            }
        },

        savePdfLocally: {
            sub: 'plugin/io/save-pdf-locally',
            value: function() {
                this.monitor.track('feature', 'save-pdf');
            }
        },

        savePdfDropbox: {
            sub: 'plugin/io/save-pdf-dropbox',
            value: function() {
                this.monitor.track('feature', 'save-pdf-dropbox');
            }
        },

        savePdfGoogleDrive: {
            sub: 'plugin/io/save-pdf-google-drive',
            value: function() {
                this.monitor.track('feature', 'save-pdf-googledrive');
            }
        },
        
        saveMobilePdf: {
            sub: 'plugin/io/save-mobile-pdf',
            value: function() {
                this.monitor.track('feature', 'save-mobile-pdf');
            }
        },

        statsSwitchToEditor: {
            sub: 'stats/scene-length/go-to-editor',
            value: function() {
                this.monitor.track('feature', 'stats-scene-length-goto');
            }
        },

        enableAutoSave: {
            sub: 'plugin/editor/auto-save/enabled',
            value: function(destination) {
                this.monitor.track('feature', 'auto-save', destination);
            }
        },

        enableAutoReload: {
            sub: 'plugin/editor/auto-reload/enabled',
            value: function(source) {
                this.monitor.track('feature', 'auto-reload', source);
            }
        }
        
    });

    return MonitorController;
});