define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * @alias LastUsedInfo
     */
    var LastUsedInfo = Protoplast.Model.extend({

        /**
         * @type {string}
         */
        script: null,

        /**
         * @type {Date}
         */
        date: null,

        /**
         * @type {string}
         */
        title: null
    });

    return LastUsedInfo;
});