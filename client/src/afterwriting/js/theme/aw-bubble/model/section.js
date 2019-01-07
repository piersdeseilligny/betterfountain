define(function(require) {

    var Protoplast = require('protoplast');

    /**
     * Represents a section/page on the site
     * 
     * @module theme/aw-bubble/model/section
     */
    var Section = Protoplast.Model.extend({

        // TODO: unify id and name (at the moment id is used for tracking) (+)
        id: null,
        
        bigIcon: null,
        
        smallIcon: null,

        /**
         * If true, will be active only if the script is loaded
         */
        needsScript: false,

        /**
         * Main content plugin
         * 
         * @type {SectionViewMixin}
         */
        mainContent: null,
        
        tools: null,
        
        name: null,
        
        title: null,
        
        shortTitle: null,
        
        description: null,
        
        isVisibleInMenu: true,
        
        isActive: undefined,
        
        isFullyVisible: false,
        
        $create: function(name) {
            this.name = name;
            if (this.MainContent) {
                this.mainContent = this.MainContent.create();
            }
            if (this.Tools) {
                this.tools = this.Tools.create();
            }
        }
        
    });

    return Section;
});