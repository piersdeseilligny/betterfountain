define(function(require) {

    var BaseUserHelper = require('acceptance/helper/user/base-user-helper');

    var EditorUserHelper = BaseUserHelper.extend({

        /**
         * Enable auto-reloading
         */
        turn_sync_on: function() {
            this.click(this.dom.editor.$sync_button);
            this.click_button('OK');
        },

        /**
         * Disable auto-reloading
         */
        turn_sync_off: function() {
            this.click(this.dom.editor.$sync_button);
        },

        /**
         * Enable auto-save
         */
        turn_auto_save_on: function() {
            this.click(this.dom.editor.$auto_save_button);
        },

        /**
         * Change editor's content to given value
         * @param content
         */
        set_editor_content: function(content) {
            $('.CodeMirror').get(0).CodeMirror.setValue(content);
        }
        
    });

    return EditorUserHelper;
});