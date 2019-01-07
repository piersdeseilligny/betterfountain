define(function(require) {

    var BaseAssert = require('acceptance/helper/assert/base-assert');

    var EditorAssert = BaseAssert.extend({

        /**
         * Asserts if auto-reload icon is visible
         * @param {boolean} is_visible
         */
        auto_reload_is_visible: function(is_visible) {
            this.is_visible(this.dom.editor.$sync_button, is_visible);
        },

        /**
         * Asserts if auto-save icon is visible
         * @param {boolean} is_visible
         */
        auto_save_visible: function(is_visible) {
            this.is_visible(this.dom.editor.$auto_save_button, is_visible);
        },

        /**
         * Asserts it editor's content matches given value
         * @param {string} content
         */
        editor_content: function(content) {
            var current_content = this.dom.editor.editor_content();
            chai.assert.equal(content, current_content, "editor's content does not match expected value");
        }
    });

    return EditorAssert;
});