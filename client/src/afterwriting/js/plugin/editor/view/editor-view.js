define(function(require) {

    var $ = require('jquery'),
        common = require('utils/common'),
        Protoplast = require('protoplast'),
        cm = require('libs/codemirror/lib/codemirror'),
        EditorViewPresenter = require('plugin/editor/view/editor-view-presenter'),
        BaseComponent = require('core/view/base-component'),
        SectionViewMixin = require('theme/aw-bubble/view/section-view-mixin');

    require('libs/codemirror/addon/selection/active-line');
    require('libs/codemirror/addon/hint/show-hint');
    require('libs/codemirror/addon/hint/anyword-hint');
    require('utils/fountain/cmmode');

    return BaseComponent.extend([SectionViewMixin], {

        $meta: {
            presenter: EditorViewPresenter
        },

        hbs: '<textarea id="editor-textarea" placeholder=""></textarea>',
        
        content: '',
        
        isSyncEnabled: false,
        
        addBindings: function() {
            Protoplast.utils.bind(this, {
                isSyncEnabled: this._updateSync,
                content: this._updateContent
            });
        },
        
        addInteractions: function() {
            this.editor = this.createEditor();

            //  Set content if it had been set before (e.g. when loading last used script)
            if (this.content) {
                this._updateContent();
            }

            this.editor.on('change', function () {
                this.dispatch('editorContentChanged');
            }.bind(this));

        },

        createEditor: function() {
            var editor = cm.fromTextArea($('#editor-textarea').get(0), {
                mode: "fountain",
                lineNumbers: false,
                lineWrapping: true,
                styleActiveLine: true,
                tabSize: 4,
                extraKeys: {
                    "Ctrl-Space": "autocomplete"
                }
            });
            // use spaces for tabs
            editor.setOption("extraKeys", {
                Tab: function(cm) {
                    var spaces = Array(cm.getOption("tabSize") + 1).join(" ");
                    cm.replaceSelection(spaces);
                }
            });

            return editor;
        },
        
        refresh: function() {
            this.editor.focus();
            this.editor.refresh();
        },
        
        setCursor: function(position) {
            this.editor.setCursor(position);
        },
        
        scrollTo: function(left, top) {
            this.editor.scrollTo(left, top);
        },
        
        getScrollInfo: function() {
            return this.editor.getScrollInfo();
        },
        
        getDefaultTextHeight: function() {
            return this.editor.defaultTextHeight();
        },

        updateSize: function() {
            this.editor.setSize("auto", $(this.root.parentNode).height() - 20);
            this.editor.refresh();
        },
        
        _updateContent: function() {
            if (this.editor && this.content !== this.getEditorContent()) {
                this.editor.setValue(this.content);
                this.refresh();
            }
        },

        _updateSync: function() {
            $('.CodeMirror').css('opacity', this.isSyncEnabled ? 0.5 : 1);
        },
        
        getEditorContent: function() {
            return this.editor.getValue();
        }

    });
});

