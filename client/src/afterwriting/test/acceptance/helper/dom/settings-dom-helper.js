define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper'),
        $ = require('jquery');

    var SettingsDomHelper = BaseDomHelper.extend({

        /**
         * Night mode checkbox
         */
        $night_mode: 'input[data-id="night_mode"]',

        /**
         * Load last opened on startup checkbox
         */
        $load_last_opened: 'input[data-id="load_last_opened"]',

        /**
         * JavaScript PDF Viewer checkbox
         */
        $js_pdf_viewer: 'input[data-id="pdfjs_viewer"]',

        /**
         * Return true if JavaScript PDF option is selected, false otherwise
         * @returns {boolean}
         */
        js_pdf_viewer_is_checked: function() {
            return $(this.$js_pdf_viewer).prop('checked')
        }

    });

    return SettingsDomHelper;
});