define(function(require) {

    var Protoplast = require('protoplast');

    var SettingsLoaderModel = Protoplast.Model.extend({

        userSettingsLoaded: false
        
    });

    return SettingsLoaderModel;
});