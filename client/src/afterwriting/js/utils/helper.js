define('utils/helper', function(require) {

    var d3 = require('d3');

    /**
     * Basic helpers
     * @exports utils/helper
     */
    var module = {};

    /**
     * Formats time based on total seconds.
     * @param {number} total number of seconds
     * @returns {string} formatted string
     */
    module.format_time = function(total) {
        var hours = Math.floor(total / 60);
        var minutes = Math.floor(total % 60);
        var seconds = Math.round(60 * (total % 1));
        if (seconds === 60) {
            minutes++;
            seconds = 0;
        }

        var string_time = function(value) {
            value = value.toString();
            return value.length === 1 ? '0' + value : value;
        };

        var result = hours ? string_time(hours) + ':' : '';
        result += string_time(minutes) + ':' + string_time(seconds);
        return result;
    };

    var date_formatter = d3.time.format("%Y-%m-%d %H:%M");
    module.format_date = function(date) {
        return date_formatter(date);
    };

    var EIGHTS_LEVELS = [0.0625, 0.1875, 0.3125, 0.4375, 0.5625, 0.6875, 0.8125, 0.9375, 1.0625];

    module.eights = function(value) {
        var full = Math.floor(value),
            rest = value % 1,
            eight;

        for (var i = 8; i >= 0; i--) {
            if (rest <= EIGHTS_LEVELS[i]) {
                eight = i;
            }
        }

        if (eight === 8) {
            full++;
            eight = 0;
        }

        var result = full ? full : '';
        result += eight ? ' <sup>' + eight + '</sup>&frasl;<sub>8</sub>' : '';

        return result;
    };

    module.version_generator = function(current) {
        current = current || "0";

        var numbers = current.split('.').concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

        var bump = function(level) {
            numbers[level - 1]++;
            for (var i = level; i < numbers.length; i++) {
                numbers[i] = 0;
            }
        };

        var to_str = function() {
            var copy = numbers.concat();
            copy.reverse();
            while (copy.length > 1 && copy[0] === 0) {
                copy.shift();
            }
            copy.reverse();
            return copy.join('.');
        };

        var increase = function(level) {
            if (arguments.length === 0) {
                return to_str();
            }
            bump(level);
            return to_str();
        };

        return increase;
    };

    module.double_id = function(a, b) {
        return Math.min(a, b) + '_' + Math.max(a, b);
    };

    module.pairs = function(t) {
        var result = t.map(function(item, index) {
            return t.slice(index + 1).map(function(i) {
                return [t[index], i];
            });
        }).reduce(function(prev, cur) {
            return prev.concat(cur);
        }, []);
        result.each = function(handler) {
            result.forEach(function(p) {
                handler(p[0], p[1]);
            });
        };
        return result;
    };

    /**
     * Return a "space" only string of the length of provided text
     * E.g. "123" -> "   "
     * @param text
     * @returns {string}
     */
    module.blank_text = function(text) {
        return (text || '').replace(/./g, ' ');
    };

    /**
     * Return string indentation, e.g. "   123" -> "   "
     * @param {string} text
     * @returns {string}
     */
    module.get_indentation = function(text) {
        var match = (text || '').match(/^(\s+)/);
        return match ? match[0] : '';
    };

    return module;

});