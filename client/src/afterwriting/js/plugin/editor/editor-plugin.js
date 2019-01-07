define(function(require) {

    var Plugin = require('core/plugin'),
        InitEditorController = require('plugin/editor/controller/init-editor-controller'),
        EditorController = require('plugin/editor/controller/editor-controller'),
        EditorModel = require('plugin/editor/model/editor-model');

    var EditorPlugin = Plugin.extend({

        $create: function(context) {
            context.register(InitEditorController.create());
            context.register(EditorModel.create());
            context.register(EditorController.create());
        }

    });

    return EditorPlugin;
});