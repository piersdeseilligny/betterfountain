define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * @mixin theme/aw-bubble/view/section-view-mixin
     */
    var SectionViewMixin = Protoplast.extend({
        
        section: null,

        active: false,

        // TODO: needed? show/hide should be enough (+)
        activate: function() {
            this.active = true;
        },

        deactivate: function() {
            this.active = false;
        },

        /**
         * Hook called when the section is shown
         */
        show: function() {

        },

        /**
         * Hook called when the section is hidden
         */
        hide: function() {
            
        },

        /**
         * Hook called when the section is resized
         * TODO: (+) at the moment called only when height changes,
         * add calling it when width changes
         */
        updateSize: function() {
            
        }
        
    });

    return SectionViewMixin;
});