define(function(require) {

    var Protoplast = require('protoplast');

    var SectionContainerPresenter = Protoplast.Object.extend({
        
        pub: {
            inject: 'pub'
        },
        
        init: function() {
            // TODO: decide about name convention for events (+)
            this.view.on('sectionDescriptionShown', this._publishDescriptionShowEvent);
        },

        _publishDescriptionShowEvent: function(sectionId) {
            this.pub('aw-bubble/section-header/description/shown', sectionId);
        }
        
    });

    return SectionContainerPresenter;
});