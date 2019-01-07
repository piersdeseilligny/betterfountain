define(function(require) {

    var Protoplast = require('protoplast'),
        FactsSection = require('plugin/stats/model/facts-section'),
        StatsSection = require('plugin/stats/model/stats-section'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');
    
    var InitStatsController = Protoplast.Object.extend({

        scriptModel: {
            inject: 'script'
        },

        themeController: {
            inject: ThemeController
        },

        init: function() {

            var factsSection = FactsSection.create('facts');
            this.themeController.addSection(factsSection);

            var statsSection = StatsSection.create('stats');
            this.themeController.addSection(statsSection);

            Protoplast.utils.bind(this.scriptModel, 'script', function(){
                factsSection.isVisibleInMenu = true;
                statsSection.isVisibleInMenu = true;
            });
        }
        
    });

    return InitStatsController;
});