define(function(require) {

    var Protoplast = require('protoplast'),
        ThemeModel = require('theme/aw-bubble/model/theme-model');

    var FooterPresenter = Protoplast.Object.extend({
        
        themeModel: {
            inject: ThemeModel
        },
        
        init: function() {
            Protoplast.utils.bindProperty(this, 'themeModel.footer', this.view, 'content');
        }
        
    });

    return FooterPresenter;
});