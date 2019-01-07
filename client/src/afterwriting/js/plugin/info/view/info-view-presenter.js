define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var InfoViewPresenter = Protoplast.Object.extend({

        pub: {
            inject: 'pub'
        },

        themeController: {
            inject: ThemeController
        },

        init: function() {
            this.view.on('download-clicked', this._downloadClicked, this);
        },
        
        _downloadClicked: function() {
            this.pub('info/download-link/clicked');
        }
        
    });

    return InfoViewPresenter;
});