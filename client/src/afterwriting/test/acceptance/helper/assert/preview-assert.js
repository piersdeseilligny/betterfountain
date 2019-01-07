define(function(require) {

    var BaseAssert = require('acceptance/helper/assert/base-assert');

    var PreviewAssert = BaseAssert.extend({

        /**
         * Assert if preview is using JSPDFViewer ('js') or embedded plugin ('embedded')
         * @param {'js'|'embedded'} mode
         */
        preview_is_in_mode: function(mode) {
            if (mode === 'js') {
                this.is_visible(this.dom.preview.$preview_js, true);
                this.is_visible(this.dom.preview.$preview_embedded, false);
            }
            else if (mode === 'embedded') {
                this.is_visible(this.dom.preview.$preview_embedded, true);
                this.is_visible(this.dom.preview.$preview_js, false);
            }
            else {
                chai.assert.fail('Unknown mode ' + mode);
            }
        }

    });

    return PreviewAssert;
});