define(function(require) {
    
    var $ = require('jquery'),
        Protoplast = require('protoplast'),
        TopMenu = require('theme/aw-bubble/view/menu/top-menu'),
        ContentPresenter = require('theme/aw-bubble/presenter/content-presenter'),
        Sections = require('theme/aw-bubble/view/sections');
    
    var Content = Protoplast.Component.extend({
        
        $meta: {
            presenter: ContentPresenter
        },
        
        html: '<div class="content">' +
        '<div data-comp="topMenu"></div>' +
        '<div data-comp="sections"></div>' +
        '</div>',
        
        topMenu: {
            component: TopMenu
        },
        
        sections: {
            component: Sections
        },
        
        expanded: false,
        
        $create: function() {
            this.$root = $(this.root);
        },
        
        init: function() {
            Protoplast.utils.bind(this, 'expanded', this.updateExpanded.bind(this));
        },
        
        updateExpanded: function() {
            if (this.expanded) {
                this.$root.addClass('content--expanded');
            }
            else {
                this.$root.removeClass('content--expanded');
            }
        },
        
        visible: {
            set: function(value) {
                this._visible = value;
                this.root.style.display = value ? 'block' : 'none';
            },
            get: function() {
                return this._visible;
            }
        },
        
        height: {
            set: function(value) {
                this._height = value;
                this.$root.height(value);
            },
            get: function() {
                return this._height;
            }
        },
        
        left: {
            set: function(value) {
                this._left = value;
                this.$root.offset({left: value});
            },
            get: function() {
                return this._left;
            }
        },
        
        outerWidth: {
            get: function() {
                return this.$root ? this.$root.outerWidth() : null;
            }
        },
        
        hide: function(duration) {
            this.$root.animate({
                top: -window.innerHeight,
                duration: duration
            });
        },
        
        show: function(duration) {
            this.visible = true;
            this.$root.animate({
                top: 0,
                duration: duration
            });
        },
        
        destroy: function() {
            Protoplast.Component.destroy.call(this);
            this.$root.draggable('destroy');
        }
        
    });
    
    return Content;
});