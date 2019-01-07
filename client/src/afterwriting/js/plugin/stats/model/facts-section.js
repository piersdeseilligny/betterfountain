define(function(require) {

    var Section = require('theme/aw-bubble/model/section'),
        FactsView = require('plugin/stats/view/facts-view');
    
    var FactsSection = Section.extend({
        
        title: 'Facts',

        shortTitle: 'facts',

        smallIcon: 'gfx/icons/facts.svg',

        isVisibleInMenu: false,

        MainContent: {
            value: FactsView
        }

    });

    return FactsSection;
});