define(function(require) {

    var BaseAssert = require('acceptance/helper/assert/base-assert');

    var StatsAssert = BaseAssert.extend({

        /**
         * Asserts if number of pages on pages balance chart matches given value
         * @param {number} number
         */
        page_balance_pages: function(number) {
            var pages = this.dom.stats.number_of_pages();
            
            chai.assert.strictEqual(number, pages, 'Expected number of pages was ' + number + ' but actual is ' + pages + '.');
        }
        
    });

    return StatsAssert;
});