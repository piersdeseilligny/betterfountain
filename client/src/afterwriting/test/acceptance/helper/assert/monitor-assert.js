define(function(require) {

    var BaseAssert = require('acceptance/helper/assert/base-assert');

    var MonitorAssert = BaseAssert.extend({

        /**
         * Asserts if given even has been tracked at least once
         * @param {string} category
         * @param {string} action
         * @param {string} [label]
         */
        event_tracked: function(category, action, label) {
            var eventName = [category, action, label].filter(function(value){return value;}).join('/');
            chai.assert.ok(this.ga.hasEvent(category, action, label), 'Event: ' + eventName + ' not found');
        },

        /**
         * Asserts if a given event has been tracked given number of times
         * @param {number} n
         * @param {string} category
         * @param {string} action
         * @param {string} label
         */
        event_tracked_n_times: function(n, category, action, label) {
            var eventName = [category, action, label].filter(function(value){return value;}).join('/'),
                events = this.ga.getEvents(category, action, label).length;
            chai.assert.strictEqual(n, events, 'Event: ' + eventName + ' expected ' + n + ', but tracked ' + events + ' times');
        }

    });

    return MonitorAssert;
});