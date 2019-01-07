define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var InfoDomHelper = BaseDomHelper.extend({

        /**
         * Link to download afterwriting.zip file
         */
        $download_link: '#download-link'

    });

    return InfoDomHelper;
});