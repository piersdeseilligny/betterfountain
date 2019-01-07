define(function(require) {

    var $ = require('jquery'),
        Protoplast = require('protoplast'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        ThemeModel = require('theme/aw-bubble/model/theme-model');

    var MainPresenter = Protoplast.Object.extend({

        pub: {
            inject: 'pub'
        },

        themeController: {
            inject: ThemeController
        },

        themeModel: {
            inject: ThemeModel
        },

        init: function() {

            Protoplast.utils.bind(this, 'themeModel.backgroundImageVisible', this._updateBackgroundImage);
            Protoplast.utils.bind(this, 'themeModel.nightMode', this._updateNightMode);
            Protoplast.utils.bindProperty(this, 'themeModel.tooltip', this.view, 'tooltip');

            this.themeModel.width = $('html').width();
            this.themeModel.height =  $(document).height();
            this.$window = $(window);

            this.$window.resize(this._updateModelWithWindowSize);

            this.view.on('clicked', this.clearSelectedSection.bind(this));
        },

        clearSelectedSection: function() {
            var currentSection = this.themeModel.sections.selected;
            if (currentSection) {
                this.themeController.clearSelectedSection();
                this.pub('aw-bubble/background/clicked', currentSection.name);
            }
        },

        destroy: function() {
            this.$window.off("resize", this._updateModelWithWindowSize);
        },

        _updateModelWithWindowSize: function() {
            this.themeModel.width = $('html').width();
            this.themeModel.height =  $(document).height();
        },

        _updateBackgroundImage: function() {
            var max_backgrounds = 7;
            if (this.themeModel.backgroundImageVisible) {
                $('html').css('background-image', 'url(' + 'gfx/bg' + Math.floor(Math.random() * max_backgrounds) + '.jpg)');
            }
            else {
                $('html').css('background-image', '');
            }
        },

        _updateNightMode: function() {
            if (this.themeModel.nightMode) {
                $('body').addClass('night-mode');
            }
            else {
                $('body').removeClass('night-mode');
            }
        }

    });

    return MainPresenter;
});