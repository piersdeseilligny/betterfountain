define(function(require) {

    var Protoplast = require('protoplast');

    var Dropdown = Protoplast.Component.extend({

        html: '<select/>',

        value: null,

        options: null,

        $create: function() {
            this.options = Protoplast.Collection.create([]);
        },

        init: function() {
            Protoplast.utils.bind(this, 'value', this.updateValue.bind(this));
            Protoplast.utils.bind(this, 'options', this.setOptions.bind(this));

            this.root.onchange = this._changed.bind(this);
        },

        setOptions: function() {
            var htmls = this.options.map(function(option) {
                var selected = option.value === this.value ? ' selected' : '';
                return '<option value="' + option.value + '"' + selected + '>' + option.label + '</option>';
            }, this);

            this.root.innerHTML = htmls.join('');
        },

        updateValue: function() {
            for (var index=0; index < this.root.options.length; index++) {
                if (this.root.options[index].value === this.value) {
                    this.root.selectedIndex = index;
                }
            }
        },

        _changed: function() {
            this.value = this.root.options[this.root.selectedIndex].value;
            this.dispatch('valueChanged', this.value);
        },

        destroy: function() {
            this.root.onchange = null;
        }

    });

    return Dropdown;
});