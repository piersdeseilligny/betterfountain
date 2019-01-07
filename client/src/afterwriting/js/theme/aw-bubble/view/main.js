define(function(require) {

    var $ = require('jquery'),
        Protoplast = require('protoplast'),
        MainPresenter = require('theme/aw-bubble/presenter/main-presenter'),
        Logo = require('theme/aw-bubble/view/logo'),
        Footer = require('theme/aw-bubble/view/footer'),
        Content = require('theme/aw-bubble/view/content'),
        BubbleMenu = require('theme/aw-bubble/view/menu/bubble-menu');

    var Main = Protoplast.Component.extend({

        $meta: {
            presenter: MainPresenter
        },
        
        tooltip: null,

        html: '<main class="main">' +
            '<div data-comp="logo"></div>' +
            '<div data-prop="backgroundClick" class="background-click"></div>' +
            '<div class="menu"><div data-comp="mainMenu"></div></div>' +
            '<div data-comp="footer"></div>' +
            '<div data-comp="content"></div>' +
            '</main>',

        logo: {
            component: Logo
        },

        mainMenu: {
            component: BubbleMenu
        },

        footer: {
            component: Footer
        },

        content: {
            component: Content
        },
    
        $backgroundClick: null,
        
        init: function() {
            this.$root = $(this.root);
            this.$backgroundClick = $(this.backgroundClick);
            Protoplast.utils.bind(this, 'tooltip', this._updateTooltip);
            Protoplast.utils.bind(this, 'tooltip.text', this._updateTooltip);
            Protoplast.utils.bind(this, 'tooltip.x', this._updateTooltipPosition);
            Protoplast.utils.bind(this, 'tooltip.y', this._updateTooltipPosition);

            this.$backgroundClick.on('click', this.dispatch.bind(this, 'clicked'));
        },

        _updateTooltip: function() {
            var text = this.tooltip.text,
                tooltip = $('.tooltip'),
                tooltipVisible = !!text;

            if (!tooltip.length && tooltipVisible) {
                tooltip = $('<div class="tooltip"></div>').appendTo(this.$root);
                tooltip.html(text);
            }
            else if (tooltip.length && !tooltipVisible) {
                tooltip.remove();
            }
        },
        
        _updateTooltipPosition: function() {
            if (this.tooltip && this.tooltip.text) {
                $('.tooltip').css("top", (this.tooltip.y - 10) + "px").css("left", (this.tooltip.x + 10) + "px");
            }
        },

        destroy: function() {
            Protoplast.Component.destroy.call(this);
            this.$backgroundClick.off();
        }

    });

    return Main;
});