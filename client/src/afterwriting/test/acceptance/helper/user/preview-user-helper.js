define(function(require) {

    var BaseUserHelper = require('acceptance/helper/user/base-user-helper');

    var PreviewUserHelper = BaseUserHelper.extend({

        /**
         * Select or deselect JSPDFViewer option
         * @param {boolean} value
         */
        select_js_viewer: function(value) {
            var checked = this.dom.settings.js_pdf_viewer_is_checked(),
                needs_changing = (checked && !value) || (!checked && value);

            if (needs_changing) {
                this.click(this.dom.settings.$js_pdf_viewer);
            }
        }
        
    });

    return PreviewUserHelper;
});