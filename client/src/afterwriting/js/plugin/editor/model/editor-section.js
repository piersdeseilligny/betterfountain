define(function(require) {

    var Section = require('theme/aw-bubble/model/section'),
        EditorView = require('plugin/editor/view/editor-view'),
        EditorMenuView = require('plugin/editor/view/tools-menu/editor-view-menu');

    var EditorSection = Section.extend({
        
        title: 'Fountain Editor',

        shortTitle: 'write',

        smallIcon: 'gfx/icons/editor.svg',

        isVisibleInMenu: false,

        description: 'Just a basic fountain editor. Use Ctrl-Space for auto-complete. Go to <a href="http://fountain.io" target="_blank">fountain.io</a> for more details about Fountain format.<br/> Use auto-save to automatically save your changes to the cloud every 3 seconds.<br />Use auto-reload to reload the script from the cloud/disk to see PDF, facts & stats changes.',

        MainContent: {
            value: EditorView
        },

        Tools: {
            value: EditorMenuView
        }

    });

    return EditorSection;
});