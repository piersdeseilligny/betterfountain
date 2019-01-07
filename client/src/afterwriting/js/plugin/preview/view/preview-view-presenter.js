define(function(require) {

    var Protoplast = require('protoplast'),
        BaseSectionViewPresenter = require('theme/aw-bubble/presenter/base-section-view-presenter'),
        PreviewController = require('plugin/preview/controller/preview-controller');
    
    var PreviewViewPresenter = BaseSectionViewPresenter.extend({
    
        settings: {
            inject: 'settings'
        },
        
        previewController: {
            inject: PreviewController
        },
        
        init: function() {
            BaseSectionViewPresenter.init.call(this);
            Protoplast.utils.bindProperty(this, 'settings.pdfjs_viewer', this, 'view.usePDFJSViewer');
        },

        _scriptChanged: function() {
            this.previewController.getPdf(function(result) {
                this.view.pdf = result;
            }.bind(this));
        }

    });

    return PreviewViewPresenter;
});