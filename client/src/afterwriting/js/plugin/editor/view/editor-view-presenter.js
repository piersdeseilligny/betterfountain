define(function(require) {

    var Protoplast = require('protoplast'),
        IoModel = require('plugin/io/model/io-model'),
        BaseSectionViewPresenter = require('theme/aw-bubble/presenter/base-section-view-presenter'),
        EditorModel = require('plugin/editor/model/editor-model');

    var EditorViewPresenter = BaseSectionViewPresenter.extend({

        scriptModel: {
            inject: 'script'
        },
        
        // TODO: move to editor controller / model (++)
        storage: {
            inject: 'storage'
        },
        
        ioModel: {
            inject: IoModel
        },

        editorModel: {
            inject: EditorModel
        },
        
        init: function() {
            BaseSectionViewPresenter.init.call(this);

            this.view.on('editorContentChanged', this._editorContentChanged, this);
            
            Protoplast.utils.bindProperty(this.editorModel, 'isSyncEnabled' , this.view, 'isSyncEnabled');
            
            Protoplast.utils.bind(this.scriptModel, 'script', function() {
                this.view.content = this.scriptModel.script;
            }.bind(this));
        },

        activate: function() {
            BaseSectionViewPresenter.activate.call(this);

            setTimeout(function () {
                this.view.content = this.scriptModel.script;
                this.view.refresh();

                if (this.editorModel.cursorPosition) {
                    this.view.setCursor(this.editorModel.cursorPosition);
                }

                if (this.editorModel.scrollInfo) {
                    this.view.scrollTo(this.editorModel.scrollInfo.left, this.editorModel.scrollInfo.top);
                }
                else if (this.editorModel.cursorPosition) {
                    var scrollTo = this.view.getScrollInfo();
                    if (scrollTo.top > 0) {
                        this.view.scrollTo(0, scrollTo.top + scrollTo.clientHeight - this.view.getDefaultTextHeight() * 2);
                    }
                }

            }.bind(this), 300);
        },

        
        _editorContentChanged: function() {
            // TODO: delegate to controller (++)
            this.editorModel.pendingChanges = this.scriptModel.script !== this.view.getEditorContent();
            this.scriptModel.script = this.view.getEditorContent();
        }
        
    });

    return EditorViewPresenter;
});