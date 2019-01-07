define(function(require) {

    var Section = require('theme/aw-bubble/model/section'),
        StatsView = require('plugin/stats/view/stats-view');
    
    var FactsSection = Section.extend({
        
        title: 'Useless Stats',

        shortTitle: 'stats',

        smallIcon: 'gfx/icons/stats.svg',

        isVisibleInMenu: false,

        MainContent: {
            value: StatsView
        }

    });

    return FactsSection;
});