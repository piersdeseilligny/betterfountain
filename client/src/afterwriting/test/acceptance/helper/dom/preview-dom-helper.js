define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var PreviewDomHelper = BaseDomHelper.extend({

        $preview_js: '#pdfjs-viewer',

        $preview_embedded: 'embed[type="application/pdf"]'
    });

    return PreviewDomHelper;
});