define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var PopupDomHelper = BaseDomHelper.extend({

        /**
         * Form in a dialog
         */
        $form_dialog: 'form.jqiform',

        /**
         * Confirm button on a popup
         */
        $confirm_popup: '[name=jqi_state0_buttonOpen]',

        /**
         * Sav button on a popup
         */
        $save_popup: '[name=jqi_state0_buttonSave]',

        /**
         * Search bar for filtering files
         */
        $search_bar: 'input.popup_search_bar',

        /**
         * Dialog message displayed in the popup
         * @returns {string}
         */
        dialog_message: function() {
            return $('.jqimessage').text();
        },

        /**
         * Dialog's input content
         * @returns {string}
         */
        dialog_input: function() {
            return $('.jqiform .text_input').prop('value');
        },

        /**
         * Tree node with a name containing given value
         * @param {string} text
         * @returns {jQuery}
         */
        file_list_popup_with_node: function(text) {
            return $('.jstree a:contains(' + text + ')');
        },

        /**
         * Link to a file on a tree-list
         * @param {string} filename
         * @returns {string}
         */
        $file_link: function(filename) {
            return "[aria-labelledby='/" + filename + "_anchor'] a";
        },

        /**
         * True if tree is visible
         * @returns {boolean}
         */
        jstree_visible: function() {
            return !!$('.jstree-anchor').attr('id');
        }

    });

    return PopupDomHelper;
});