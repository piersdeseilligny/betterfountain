define(function(require) {

    var BaseAssert = require('acceptance/helper/assert/base-assert');

    var IoAssert = BaseAssert.extend({

        /**
         * Asserts if last used optionis visible
         * @param {boolean} is_visible
         */
        last_used_is_visible: function(is_visible) {
            this.is_visible(this.dom.open.$open_last_used, is_visible);
        },

        /**
         * Asserts if last used title matches given value
         * @param {string} title
         */
        last_used_title: function(title) {
            chai.assert.strictEqual(title, this.dom.open.open_last_used_title());
        },

        /**
         * Asserts if open from GoogleDrive button is visible
         * @param {string} source - source from which file is supposed to be opened: 'google_drive' or 'dropbox'
         * @param {boolean} is_visible
         */
        open_button_visible: function(source, is_visible) {
            var $selector = '$open_' + source;
            this.is_visible(this.dom.open[$selector], is_visible);
        },

        /**
         * Asserts if a save button is visible in a given plugin
         * @param {string} destination - 'dropbox' or 'google_drive'
         * @param {string} plugin - 'save', 'editor' or 'preview'
         * @param {string} format - 'fountain' or 'pdf'
         * @param {boolean} is_visible
         */
        save_button_visible: function(destination, plugin, format, is_visible) {
            var method = '$save_' + format + '_' + destination;
            this.is_visible(this.dom.save[method](plugin), is_visible);
        }
    });

    return IoAssert;
});