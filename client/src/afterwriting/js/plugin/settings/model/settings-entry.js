define(function(require) {

    var Protoplast = require('protoplast');

    var SettingEntry = Protoplast.Model.extend({

        key: null,

        label: null,

        /**
         * Instance of control use to modify the value
         */
        control: null,

        $create: function(key, label, control) {
            this.key = key;
            this.label = label;
            this.control = control;
        }

    });

    return SettingEntry;
});