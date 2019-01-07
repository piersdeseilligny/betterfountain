define(function(require) {

    var Protoplast = require('protoplast');

    var InitChangelogController = Protoplast.Object.extend({

        storage: {
            inject: 'storage'
        },

        init: function() {
            var lastVisit = this.getLastVisitDate();

            if (lastVisit) {
                // TODO: get changes from last visit and store them to model (+)
            }

            this._updateLastVisit();
        },

        /**
         * Return last visit date or null if it's the first visit
         * @returns {Date}
         */
        getLastVisitDate: function() {
            var lastVisitTimestamp = this.storage.getItem('last-visit'),
                lastVisitDate = null;

            if (lastVisitTimestamp) {
                lastVisitDate = new Date();
                lastVisitDate.setTime(parseInt(lastVisitTimestamp, 10));
            }

            return lastVisitDate;
        },

        /**
         * Update last visit date
         * @private
         */
        _updateLastVisit: function() {
            this.storage.setItem('last-visit', new Date().getTime());
        }

    });

    return InitChangelogController;
});