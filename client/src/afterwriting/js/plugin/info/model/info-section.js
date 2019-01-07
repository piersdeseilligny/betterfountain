define(function(require) {

    var Section = require('theme/aw-bubble/model/section'),
        InfoView = require('plugin/info/view/info-view');

    /**
     * @module plugin/info/model/info-section
     * @augments module:theme/aw-bubble/model/section
     */
    var InfoSection = Section.extend({
        
        title: 'About',

        shortTitle: 'info',

        smallIcon: 'gfx/icons/info.svg',

        MainContent: {
            value: InfoView
        }

    });

    return InfoSection;
});