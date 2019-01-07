define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var OpenDomHelper = BaseDomHelper.extend({

        /**
         * Button for creating new, empty editor
         */
        $create_new: '[open-action=new]',

        /**
         * Button to open a local file
         */
        $open_local: '[open-action=open]',

        /**
         * Button to open a file from Dropbox
         */
        $open_dropbox: '[open-action=dropbox]',

        /**
         * Button to open a file from GoogleDrive
         */
        $open_google_drive: '[open-action=googledrive]',

        /**
         * Hidden file input
         */
        $file_input: '#open-file',

        /**
         * Button top open last used content
         */
        $open_last_used: '[open-action=last]',

        /**
         * Button to open a sample
         * @param {string} name - sample name
         * @returns {string}
         */
        $open_sample: function(name) {
            return '[open-action=sample][value="' + name + '"]';
        },

        /**
         * Last used content's title
         * @returns {string}
         */
        open_last_used_title: function() {
            return $(this.$open_last_used).text();
        }
        
    });

    return OpenDomHelper;
});