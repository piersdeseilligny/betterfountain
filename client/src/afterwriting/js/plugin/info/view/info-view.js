define(function(require) {

    var template = require('text!plugin/info/view/info.hbs'),
        $ = require('jquery'),
        InfoViewPresenter = require('plugin/info/view/info-view-presenter'),
        BaseComponent = require('core/view/base-component'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin'),
        Switcher = require('theme/aw-bubble/view/switcher');
    
    return BaseComponent.extend([SectionViewMixin], {

        $meta: {
            presenter: InfoViewPresenter
        },
        
        switchToOpen: {
            component: Switcher
        },
        
        hbs: template,

        $downloadLink: null,

        addInteractions: function() {
            this.switchToOpen.sectionName = 'open';
            this.switchToOpen.title = 'samples';
            
            this.$downloadLink.click(this.dispatch.bind(this, 'download-clicked'));
        }

    });

});
