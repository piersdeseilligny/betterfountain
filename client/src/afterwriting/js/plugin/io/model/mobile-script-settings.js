define(function(require) {

    var Protoplast = require('protoplast'),
        PrintProfileUtil = require('utils/print-profile-util');

    /**
     * Mobile friendly PDF layout with increased font size
     */
    var MobileScriptSettings = Protoplast.Model.extend({
        
        settings: {
            inject: 'settings'
        },
        
        print: {
            get: function() {
                return PrintProfileUtil.withNewFontSize(this.settings.print, 20);
            }
        }
        
    });

    return MobileScriptSettings;
});