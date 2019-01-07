define(function(require) {

    var Protoplast = require('protoplast'),
        EditorController = require('plugin/editor/controller/editor-controller');


    var StatsController = Protoplast.extend({

        editorController: {
            inject: EditorController
        },

        /**
         * Open the editor plugin at the given line
         * @param line
         */
        goto: function(line) {
            this.editorController.goto(line);
        }

    });

    return StatsController;
});