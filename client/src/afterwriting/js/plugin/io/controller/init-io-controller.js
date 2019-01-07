define(function(require) {

    var Protoplast = require('protoplast'),
        OpenSection = require('plugin/io/model/open-section'),
        SaveSection = require('plugin/io/model/save-section'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var InitIoController = Protoplast.Object.extend({

        scriptModel: {
            inject: 'script'
        },

        themeController: {
            inject: ThemeController
        },

        init: function() {
            var openSection = OpenSection.create('open');
            this.themeController.addSection(openSection);

            var saveSection = SaveSection.create('save');
            this.themeController.addSection(saveSection);

            Protoplast.utils.bind(this.scriptModel, 'script', function(){
                saveSection.isVisibleInMenu = true;
            });
        }

    });

    return InitIoController;
});