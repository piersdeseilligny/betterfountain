define(function(require) {

    var Protoplast = require('protoplast'),
        BaseComponent = require('core/view/base-component'),
        BubbleMenuPresenter = require('theme/aw-bubble/presenter/menu/bubble-menu-presenter'),
        BubbleMenuItem = require('theme/aw-bubble/view/menu/bubble-menu-item');

    var BubbleMenu = BaseComponent.extend({

        $meta: {
            presenter: BubbleMenuPresenter
        },

        tag: 'ul',

        sections: null,

        $create: function() {
            this.sections = Protoplast.Collection.create();
        },

        init: function() {
            this.$root.addClass('selector');
            var view = this;
            Protoplast.utils.renderList(this, 'sections', {
                property: 'section',
                renderer: BubbleMenuItem,
                create: function(parent, data, renderer, propertyName) {
                    var child = renderer.create();
                    child[propertyName] = data;
                    parent.add(child);
                    view.dispatch('menuItemAdded');
                }
            });
        },
        
        animateItem: function(section, attrs, delay) {
            var index = this.sections.toArray().indexOf(section);
            if (this.children[index]) {
                this.children[index].stopAnimation();
                this.children[index].animate(attrs, delay);
            }
        }

    });

    return BubbleMenu;
});