define(function(require) {

    var $ = require('jquery'),
        BaseComponent = require('core/view/base-component'),
        BubbleMenuItemPresenter = require('theme/aw-bubble/presenter/menu/bubble-menu-item-presenter');

    var BubbleMenuItem = BaseComponent.extend({
        
        $meta: {
            presenter: BubbleMenuItemPresenter
        },
        
        html: '<li>' +
            '<img data-prop="$icon" />' +
            '<span data-prop="$title"></span>' +
        '</li>',
        
        section: null,

        $icon: null,

        $title: null,

        $create: function() {

            this.$root.hover(function() {
                $(this).addClass('menu-item--hover');
            }, function() {
                $(this).removeClass('menu-item--hover');
            });

            this.$root.offset({
                top: $(window).height() / 2,
                left: $(window).width() / 2
            }).css({
                'position': 'fixed',
                'opacity': 0
            });

            this.$root.click(this.dispatch.bind(this, 'clicked'));
        },
        
        render: {
            bindWith: 'section.name',
            value: function() {
                this.root.className = 'menu-item ' + this.section.name;
            }
        },

        renderIcon: {
            bindWith: 'section.smallIcon',
            value: function() {
                this.$icon.attr('src', this.section.smallIcon);
            }
        },

        renderTitle: {
            bindWith: 'section.shortTitle',
            value: function() {
                this.$title.html(this.section.shortTitle);
            }
        },
        
        animate: function(attrs, delay) {
            this.$root.animate(attrs, delay);
            delete attrs.padding;
            this.$icon.animate(attrs, delay);
        },

        stopAnimation: function() {
            this.$root.stop();
        }
        
    });

    return BubbleMenuItem;
});