define(function(require) {

    var $ = require('jquery'),
        BaseComponent = require('core/view/base-component'),
        TopMenuPresenter = require('theme/aw-bubble/presenter/menu/top-menu-presenter'),
        TopMenuItem = require('theme/aw-bubble/view/menu/top-menu-item');

    var TopMenu = BaseComponent.extend({

        $meta: {
            presenter: TopMenuPresenter
        },

        html: '<div class="top-bar">' +
        '<div><img data-prop="$closeIcon" class="content-action content-action--close" src="gfx/icons/close.svg" /><img data-prop="$expandIcon" class="content-action content-action--expand" src="gfx/icons/expand.svg" /></div>' +
        '</div>',

        $closeIcon: null,

        $expandIcon: null,

        sections: {
            renderWith: {
                property: 'section',
                renderer: TopMenuItem
            }
        },

        $create: function() {
            this.$closeIcon.click(this.dispatch.bind(this, 'close'));
            this.$expandIcon.click(this.dispatch.bind(this, 'expand'));
        },

        addInteractions: function() {

            var y, revert = true;
            $('.content').draggable({
                axis: "y",
                scroll: true,
                scrollSensitivity: 25,
                handle: '.content-action--close',
                revert: function() {
                    return revert;
                },
                scrollSpeed: 25,
                addClasses: false,
                start: function() {
                    this.$closeIcon.off();
                }.bind(this),
                drag: function(event, data) {
                    revert = Math.abs(data.offset.top) <= 100;
                },
                stop: function() {
                    if (!revert) {
                        this.dispatch('swipe');
                    }
                    
                    this.$closeIcon.click(this.dispatch.bind(this, 'close'));
                }.bind(this)

            });
        },

        setSelected: function(section) {
            this.children.forEach(function(topMenuItem) {
                topMenuItem.selected = topMenuItem.section === section;
            });
        }

    });

    return TopMenu;
});