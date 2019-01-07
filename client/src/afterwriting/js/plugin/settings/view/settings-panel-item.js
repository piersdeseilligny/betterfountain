define(function(require) {

    var Protoplast = require('protoplast');

    var SettingsPanelItem = Protoplast.Component.extend({

        html: '<tr><td data-prop="$label" class="label"></td></tr>',

        label: null,

        key: null,

        control: null,

        init: function() {
            Protoplast.utils.bind(this, 'label', this.renderLabel.bind(this));
            Protoplast.utils.bind(this, 'control', this.addControl.bind(this));
        },

        renderLabel: function() {
            this.$label.innerHTML = this.label + ':';
        },

        /**
         * Creates a <td> wrapper to surround the control
         * @returns {*}
         */
        getTdWrapper: function() {
            var td = Protoplast.Component.extend({html: '<td class="field"></td>'}).create();
            this.add(td);
            return td;
        },

        addControl: function() {
            var td = this.getTdWrapper();
            td.add(this.control);

            this.control.on('valueChanged', this._changed.bind(this));
        },

        _changed: function(value) {
            this.dispatch('configValueChanged', {
                key: this.key,
                value: value
            });
        }

    });

    return SettingsPanelItem;
});