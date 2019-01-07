define(function(require) {

    var Protoplast = require('protoplast'),
        PreviewSection = require('plugin/preview/model/preview-section'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var InitPreviewController = Protoplast.Object.extend({

        scriptModel: {
            inject: 'script'
        },

        themeController: {
            inject: ThemeController
        },

        init: function() {
            var previewSection = PreviewSection.create('preview');
            this.themeController.addSection(previewSection);

            Protoplast.utils.bind(this.scriptModel, 'script', function(){
                previewSection.isVisibleInMenu = true;
            });
        }

    });

    return InitPreviewController;
});