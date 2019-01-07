define(function(require) {

    var $ = require('jquery'),
        BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var StatsDomHelper = BaseDomHelper.extend({

        /**
         * A page on a list of pages in stats page balance
         */
        $page_balance_page: '#stats-page-balance svg',

        /**
         * Return number of pages on pages balance chart
         * @returns {number}
         */
        number_of_pages: function() {
            return $(this.$page_balance_page).length;
        }

    });

    return StatsDomHelper;
});