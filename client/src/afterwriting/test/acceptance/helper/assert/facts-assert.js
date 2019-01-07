define(function(require) {

    var BaseAssert = require('acceptance/helper/assert/base-assert');

    var FactsAssert = BaseAssert.extend({

        /**
         * Asserts if number of scenes on Facts page matches given value
         * @param {number} number
         */
        number_of_scenes_is: function(number) {
            var scenes_content = this.dom.facts.scenes_content();
            var scenes_string = scenes_content.split(' ')[0];
            var scenes = parseInt(scenes_string, 10);
            
            chai.assert.strictEqual(number, scenes, 'Expected number of scenes was ' + number + ' but actual is ' + scenes + '.');
        }
        
    });

    return FactsAssert;
});