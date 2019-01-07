define(function(require) {

    var Protoplast = require('protoplast'),
        InfoSection = require('plugin/info/model/info-section'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var InitInfoController = Protoplast.Object.extend({
        
        themeController: {
            inject: ThemeController
        },
        
        init: function() {
            var infoSection = InfoSection.create('info');
            this.themeController.addSection(infoSection);
        }
        
    });

    return InitInfoController;
});