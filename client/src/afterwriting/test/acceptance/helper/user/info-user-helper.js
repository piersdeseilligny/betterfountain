define(function(require) {

    var BaseUserHelper = require('acceptance/helper/user/base-user-helper');

    var InfoUserHelper = BaseUserHelper.extend({

        /**
         * Click on afterwriting.zip link
         */
        download_offline_app: function() {
            this.dom.clean_href(this.dom.info.$download_link);
            this.click(this.dom.info.$download_link);
        }
        
    });

    return InfoUserHelper;
});