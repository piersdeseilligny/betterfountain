define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var FactsDomHelper = BaseDomHelper.extend({

        /**
         * Span displaying number of scenes
         */
        $scenes: 'span#facts-scenes',

        /**
         * Content of scenes stats
         * @returns {string} example: 2 (action only: 2, with dialogue: 0)
         */
        scenes_content: function() {
            return $('#facts-scenes').text();
        }

    });

    return FactsDomHelper;
});