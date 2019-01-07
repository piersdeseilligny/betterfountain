define(function(require) {

    var template = require('text!plugin/preview/view/preview.hbs'),
        $ = require('jquery'),
        Protoplast = require('protoplast'),
        BaseComponent = require('core/view/base-component'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin'),
        PreviewViewPresenter = require('plugin/preview/view/preview-view-presenter'),
        pdfjs_viewer = require('utils/pdfjsviewer');

    return BaseComponent.extend([SectionViewMixin], {

        hbs: template,

        $meta: {
            presenter: PreviewViewPresenter
        },

        $zoomIn: null,

        $zoomOut: null,

        pdf: null,

        usePDFJSViewer: false,

        addBindings: function() {
            Protoplast.utils.bind(this, 'pdf', this._renderPdf);
        },

        addInteractions: function() {
            this.root.style.height = '100%';

            this.$zoomIn.click(pdfjs_viewer.zoomin);
            this.$zoomOut.click(pdfjs_viewer.zoomout);
            pdfjs_viewer.set_container(document.getElementById('pdfjs-viewer'));
        },

        _renderPdf: function(result) {
            if (result) {
                $("#pdf-preview-iframe-container p").remove();
                if (this.usePDFJSViewer) {
                    pdfjs_viewer.from_blob(result.blob);
                }
                else {
                    $("#pdf-preview-iframe").attr('src', result.url).css('display', 'block');
                }
            } else {
                $("#pdf-preview-iframe").remove();
            }
        },

        show: function() {
            if (this.usePDFJSViewer) {
                $('#pdf-preview-iframe-container').hide();
                $('#pdf-preview-pdfjs-container').show();
            }
            else {
                $('#pdf-preview-iframe-container').show();
                $('#pdf-preview-pdfjs-container').hide();
            }

            $('#pdf-preview-iframe-container').html('<p>Loading preview...</p><embed id="pdf-preview-iframe" style="height: 100%; width: 100%; display:none"  type="application/pdf"></embed>');
        },

        hide: function() {
            this.pdf = null;
        }

    });

});
