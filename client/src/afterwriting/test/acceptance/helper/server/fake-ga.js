define(function(require){

    var p = require('protoplast');

    /**
     * Fake Google Analytics Tracker
     */
    var FakeGoogleAnalytics = p.extend({

        _events: null,

        /**
         * Creates fake global "ga" handler
         * @param [global] - global object to attached to (defaults to window)
         */
        init: function(global) {
            global = global || window;
            this._events = [];
            global.ga = this._track.bind(this);
        },

        getEvents: function(category, action, label) {
            return this._events.filter(function(event) {
                return (!category || category === event.category) &&
                    (!action || action === event.action) &&
                    (!label || label === event.label);
            });
        },

        getEvent: function(category, action, label) {
            var events = this.getEvents(category, action, label);
            return events.length ? events[0] : null;
        },

        hasEvent: function(category, action, label) {
            var events = this.getEvents(category, action, label);
            return events.length > 0;
        },

        _track: function(command, type, category, action, label) {
            if (command === 'send' && type === 'event') {
                this._events.push(FakeEvent.create(category, action, label));
            }
        },

        restore: function() {
            this._events = [];
        }

    });

    var FakeEvent = p.extend({

        category: null,

        action: null,

        label: null,

        $create: function(category, action, label) {
            this.category = category;
            this.action = action;
            this.label = label;
        }

    });

    return FakeGoogleAnalytics;

});