define(function(require) {

    var Modernizr = require('modernizr'),
        Protoplast = require('protoplast');

    var StorageAddon = Protoplast.extend({

        name: 'storage',

        prefix: 'com.afterwriting.labs.local-storage.',

        $create: function() {
            if (!Modernizr.localstorage) {
                window.localStorage = {
                    _data       : {},
                    setItem     : function(id, val) { return this._data[id] = String(val); },
                    getItem     : function(id) { return this._data.hasOwnProperty(id) ? this._data[id] : undefined; },
                    removeItem  : function(id) { return delete this._data[id]; },
                    clear       : function() { return this._data = {}; }
                };
            }
        },

        setItem: function(key, value, callback) {
            var prefixed = this.prefix + key,
                textValue = JSON.stringify(value);
            window.localStorage.setItem(prefixed, textValue);
            if (callback) {
                callback();
            }
        },

        getItem: function(key) {
            var prefixed = this.prefix + key,
                textValue = window.localStorage.getItem(prefixed),
                value;
            try {
                value = JSON.parse(textValue);
            } catch(e) {
                value = null;
            }
            return value;
        }

    });

    return StorageAddon;
});