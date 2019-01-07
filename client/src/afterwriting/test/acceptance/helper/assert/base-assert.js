define(function(require) {

    var Protoplast = require('protoplast');

    var BaseAssert = Protoplast.extend({

        $create: function(dom, dropbox, ga) {
            this.dom = dom;
            this.dropbox = dropbox;
            this.ga = ga;
        },

        /**
         * Asserts element matching given selector is visible or not
         * @param {string} $selector
         * @param {boolean} is_visible
         */
        is_visible: function($selector, is_visible) {
            chai.assert.strictEqual(this.dom.is_visible($selector), is_visible);
        }

    });

    return BaseAssert;
});