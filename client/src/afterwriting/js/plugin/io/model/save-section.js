define(function(require) {

    var Section = require('theme/aw-bubble/model/section'),
        SaveView = require('plugin/io/view/save-view');

    var SaveSection = Section.extend({
        
        title: 'Save',

        shortTitle: 'save',

        description: 'You can save your screenplay in Fountain or PDF format here. If you want to read your script on a mobile device, choose mobile-friendly version (font size is beefed up).',

        smallIcon: 'gfx/icons/save.svg',

        isVisibleInMenu: false,

        MainContent: {
            value: SaveView
        }

    });

    return SaveSection;
});