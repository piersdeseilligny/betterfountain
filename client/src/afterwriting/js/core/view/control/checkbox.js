define(function(require) {

    var Protoplast = require('protoplast'),
        BaseComponent = require('core/view/base-component');

    var Checkbox = BaseComponent.extend({

        html: '<input type="checkbox" />',

        value: null,

        init: function() {
            BaseComponent.init.call(this);
            Protoplast.utils.bind(this, 'value', this.updateValue.bind(this));
            this.root.onchange = this._changed.bind(this);
        },

        updateValue: function() {
            this.root.checked = !!this.value;
        },

        _changed: function() {
            this.value = this.root.checked;
            this.dispatch('valueChanged', this.value);
        },

        destroy: function() {
            this.root.onchange = null;
        }

    });

    return Checkbox;
});