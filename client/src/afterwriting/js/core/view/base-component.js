define(function(require) {

    var Protoplast = require('protoplast'),
        Handlebars = require('handlebars'),
        $ = require('jquery');

    var BaseComponent = Protoplast.Component.extend({

        $meta: {
            elementWrapperFunctionName: '_wrapElement'
        },
        
        id: undefined,

        hbs: null,

        __selectors: null,

        _selectors: {
            get: function() {
                return this.__selectors || (this.__selectors = Protoplast.Collection.create());
            }
        },

        $create: function() {
            if (this.hbs) {
                this.root.innerHTML = Handlebars.compile(this.hbs)();
            }
            this.$root = this._wrapElement(this.root);
            this.processRoot();
        },
        
        init: function() {
            Protoplast.utils.bind(this, 'id', this._updateId.bind(this));
            this.addBindings();
            this.addInteractions();
        },
        
        addBindings: function() {},

        addInteractions: function() {},

        _wrapSelector: function(selector) {
            var element = this.$root.find(selector);
            return this._wrapElement(element);
        },

        _wrapElement: function(element) {
            var wrapped = $(element);
            this._selectors.add(wrapped);
            return wrapped;
        },

        _updateId: function() {
            this.root.setAttribute('data-id', this.id);
        },

        destroy: function() {
            this._selectors.forEach(function(selector) {
                selector.off();
            }, this);
            Protoplast.Component.destroy.call(this);
        }
        
    });

    return BaseComponent;
});