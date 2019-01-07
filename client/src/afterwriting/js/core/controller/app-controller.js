define(function(require) {

    var common = require('utils/common'),
        Protoplast = require('protoplast'),
        ThemeModel = require('theme/aw-bubble/model/theme-model'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller');

    var AppController = Protoplast.Object.extend({

        appModel: {
            inject: 'appModel'
        },
        
        pdfController: {
            inject: 'pdf'
        },
        
        themeModel: {
            inject: ThemeModel
        },

        themeController: {
            inject: ThemeController
        },

        pub: {
            inject: 'pub'
        },
        
        init: function() {
            this.appModel.urlParams = this._parseUrlParams();
        },

        initialiseApp: {
            sub: 'app/init',
            value: function() {

                if (this.appModel.urlParams.fontFix) {
                    this.pdfController.fontFixEnabled = true;
                }
                
                var footer = common.data.footer;
                this.themeController.setFooter(footer);

                this.pub('bubble-theme/init');
            }
        },
        
        _parseUrlParams: function() {
            var urlParams = {};

            if (window && window.location && window.location.search) {
                window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (str, key, value) {
                    urlParams[key] = value;
                });
            }
            
            return urlParams;
        }

    });

    return AppController;
});