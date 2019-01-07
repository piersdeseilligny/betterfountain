define(function(require) {

    var Protoplast = require('protoplast');

    var Input = Protoplast.Component.extend({

        html: '<input />',

        value: null,

        init: function() {
            Protoplast.utils.bind(this, 'value', this.updateValue.bind(this));

            this.root.onkeyup = this._changed.bind(this);
        },

        updateValue: function() {
            this.root.value = this.value;
        },

        _changed: function() {
            this.value = this.root.value;
            this.dispatch('valueChanged', this.value);
        },

        destroy: function() {
            this.root.onkeyup = null;
        }

    });

    return Input;
});