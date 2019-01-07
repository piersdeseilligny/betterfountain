define(function(require) {

    var BaseUserHelper = require('acceptance/helper/user/base-user-helper');

    var SaveUserHelper = BaseUserHelper.extend({

        /**
         * Save the current content as fountain file locally (button on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        save_fountain_locally: function(plugin) {
            this.click(this.dom.save.$save_fountain_locally(plugin));
        },

        /**
         * Save the current content as fountain file to Dropbox (button on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        save_fountain_dropbox: function(plugin) {
            this.click(this.dom.save.$save_fountain_dropbox(plugin));
        },

        /**
         * Save the current content as fountain file to GoogleDrive (button on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        save_fountain_google_drive: function(plugin) {
            this.click(this.dom.save.$save_fountain_google_drive(plugin));
        },

        /**
         * Save the current content as PDF file locally (button on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        save_pdf_locally: function(plugin) {
            this.click(this.dom.save.$save_pdf_locally(plugin));
        },

        /**
         * Save the current content as PDF file to Dropbox (button on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        save_pdf_dropbox: function(plugin) {
            this.click(this.dom.save.$save_pdf_dropbox(plugin));
        },

        /**
         * Save the current content as PDF file to GoogleDrive (button on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        save_pdf_google_drive: function(plugin) {
            this.click(this.dom.save.$save_pdf_google_drive(plugin));
        },

        /**
         * Save the current script as mobile friendly PDF
         */
        save_mobile_pdf: function() {
            this.click(this.dom.save.$save_mobile_pdf);
        }
        
    });

    return SaveUserHelper;
});