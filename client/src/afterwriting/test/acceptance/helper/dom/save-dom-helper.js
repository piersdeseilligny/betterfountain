define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var SaveDomHelper = BaseDomHelper.extend({

        /**
         * Selector to save to a fountain file locally (link on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        $save_fountain_locally: function(plugin) {
            return '[plugin=' + plugin + '] [action=save-fountain]';
        },

        /**
         * Selector to save to a fountain file to Dropbox (link on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        $save_fountain_dropbox: function(plugin) {
            return '[plugin=' + plugin + '] [action=save-dropbox-fountain]';
        },

        /**
         * Selector to save to a fountain file to GoogleDrive (link on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        $save_fountain_google_drive: function(plugin) {
            return '[plugin=' + plugin + '] [action=save-gd-fountain]';
        },

        /**
         * Selector to save to a pdf file locally (link on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        $save_pdf_locally: function(plugin) {
            return '[plugin=' + plugin + '] [action=save-pdf]';
        },

        /**
         * Selector to save to a pdf file to Dropbox (link on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        $save_pdf_dropbox: function(plugin) {
            return '[plugin=' + plugin + '] [action=save-dropbox-pdf]';
        },

        /**
         * Selector to save to a pdf file to GoogleDrive (link on a given plugin)
         * @param {string} plugin
         * @returns {string}
         */
        $save_pdf_google_drive: function(plugin) {
            return '[plugin=' + plugin + '] [action=save-gd-pdf]'
        },

        /**
         * Selector for button saving mobile-friendly version
         */
        $save_mobile_pdf: '[plugin=save] [action=save-mobile-pdf]'

    });

    return SaveDomHelper;
});