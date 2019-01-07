define(function(require) {

    var BaseUserHelper = require('acceptance/helper/user/base-user-helper');

    var StatsUserHelper = BaseUserHelper.extend({

        /**
         * Click on a page from page balance stats
         */
        click_on_page_stats: function() {
            this.click(this.dom.stats.$page_balance_page);
        }

    });

    return StatsUserHelper;
});