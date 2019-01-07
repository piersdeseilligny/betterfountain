define(function(require) {

    var Protoplast = require('protoplast'),
        EditorSection = require('plugin/editor/model/editor-section'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var InitEditorController = Protoplast.Object.extend({

        scriptModel: {
            inject: 'script'
        },

        themeController: {
            inject: ThemeController
        },

        init: function() {
            var editorSection = EditorSection.create('editor');
            this.themeController.addSection(editorSection);

            Protoplast.utils.bind(this.scriptModel, 'script', function(){
                editorSection.isVisibleInMenu = true;
            });
        }


    });

    return InitEditorController;
});