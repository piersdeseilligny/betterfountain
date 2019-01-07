define(function(require) {

    var $ = require('jquery'),
        BaseComponent = require('core/view/base-component'),
        TopMenuItemPresenter = require('theme/aw-bubble/presenter/menu/top-menu-item-presenter');

    var TopMenuItem = BaseComponent.extend({

        $meta: {
            presenter: TopMenuItemPresenter
        },

        html: '<img class="quick-menu-item" />',

        section: null,

        _selected: false,

        selected: {
            set: function(value) {
                this._selected = value;
                if (value) {
                    this.$root.addClass('quick-menu-item--active');
                }
                else {
                    this.$root.removeClass('quick-menu-item--active');
                }
            },
            get: function() {
                return this._selected;
            }
        },

        $create: function() {
            this.root.onclick = this.dispatch.bind(this, 'clicked', this._selected);
        },

        renderIcon: {
            bindWith: 'section.smallIcon',
            value: function() {
                this.root.setAttribute('src', this.section.smallIcon);
            }
        },

        render: {
            bindWith: 'section.name',
            value: function() {
                this.root.className = 'quick-menu-item ' + this.section.name;
            }
        }

    });

    return TopMenuItem;
});