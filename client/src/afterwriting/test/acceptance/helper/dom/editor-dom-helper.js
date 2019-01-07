define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var EditorDomHelper = BaseDomHelper.extend({

        /**
         * Button to enable/disable auto-realoading
         */
        $sync_button: '.auto-reload-icon',

        /**
         * Button to enable/disable auto-saving
         */
        $auto_save_button: '.auto-save-icon',

        /**
         * Retrun current content of the editor
         * @returns {string}
         */
        editor_content: function() {
            return $('.CodeMirror').get(0).CodeMirror.getValue();
        }
        
    });

    return EditorDomHelper;
});