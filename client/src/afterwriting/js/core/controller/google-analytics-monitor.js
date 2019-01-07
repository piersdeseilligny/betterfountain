define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * Implementation of events monitor that sends events to Google Analytics
     */
    var GoogleAnalyticsMonitor = Protoplast.Object.extend({

        init: function() {
            // TODO: remove dependecy to window.ACCEPTANCE (+)
            // it's required at the moment to make sure fake-ga object is not overridden
            // when analytics are loaded
            if (window.location.protocol !== 'file:' && !window.ACCEPTANCE) {
                (function(i, s, o, g, r, a, m) {
                    i['GoogleAnalyticsObject'] = r;
                    i[r] = i[r] || function() {
                        (i[r].q = i[r].q || []).push(arguments);
                    };
                    i[r].l = 1 * new Date();
                    a = s.createElement(o);
                    m = s.getElementsByTagName(o)[0];
                    a.async = 1;
                    a.src = g;
                    m.parentNode.insertBefore(a, m);
                })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

                ga('create', 'UA-53953908-1', 'auto');
                ga('send', 'pageview');
            }
        },

        track: function(category, action, label) {
            if (window.ga) {
                window.ga('send', 'event', category, action, label);
            } else {
                //log.debug('Event not sent:', category, action, label || '', ' [Google Analytics not loaded.]');
            }
        }

    });

    return GoogleAnalyticsMonitor;
});