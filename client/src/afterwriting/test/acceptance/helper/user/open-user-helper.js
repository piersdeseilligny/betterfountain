define(function(require) {

    var BaseUserHelper = require('acceptance/helper/user/base-user-helper');

    var OpenUserHelper = BaseUserHelper.extend({

        /**
         * Open local file with a given name. The file must be added with Browser.has_local_file
         * @param name
         */
        open_local_file: function(name) {
            this.browser.open_local_file(name, $(this.dom.open.$file_input).get(0));
        },

        /**
         * Open "Open file dialog"
         */
        open_file_dialog: function() {
            this.click(this.dom.open.$open_local);
        },

        /**
         * Open sample script with a given name
         * @param {string} name
         */
        open_sample: function(name) {
            this.click(this.dom.open.$open_sample(name));
        },

        /**
         * Open files list from Dropbox
         */
        open_from_dropbox: function() {
            this.click(this.dom.open.$open_dropbox);
        },

        /**
         * Open files list from GoogleDrive
         */
        open_from_googledrive: function() {
            this.click(this.dom.open.$open_google_drive);
        },

        /**
         * Open last used content
         */
        open_last_used: function(){
            this.click(this.dom.open.$open_last_used);
        },

        /**
         * Create new, empty content
         */
        create_new: function() {
            this.click(this.dom.open.$create_new);
        }

    });

    return OpenUserHelper;
});