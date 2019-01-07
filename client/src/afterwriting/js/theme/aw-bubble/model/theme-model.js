define(function(require) {

    var Protoplast = require('protoplast'),
        TooltipModel = require('theme/aw-bubble/model/tooltip');

    var ThemeModel = Protoplast.Model.extend({
        
        sections: null,
        
        sectionsMenu: null,

        _allSections: null,

        sectionsMap: null,
        
        animationDelay: 800,
        
        contentSlideAnimation: 500,
        
        width: undefined,
        
        height: undefined,
        
        footer: '',

        expanded: false,
        
        nightMode: false,
        
        showBackgroundImage: true,
        
        tooltip: null,
        
        backgroundImageVisible: {
            computed: ['showBackgroundImage', 'small'],
            value: function() {
                return this.showBackgroundImage && !this.small;
            }
        },
        
        small: {
            computed: ['deviceWidth'],
            value: function() {
                return this.deviceWidth < 800;
            }
        },

        deviceWidth: {
            computed: ['width'],
            value: function() {
                var deviceWidth = !window.orientation ? window.screen.width : window.screen.height;
                if (navigator.userAgent.indexOf('Android') >= 0 && window.devicePixelRatio) {
                    deviceWidth = deviceWidth / window.devicePixelRatio;
                }
                return deviceWidth;
            }
        },
        
        $create: function() {
            this._allSections = Protoplast.Collection.create();
            this.sections = Protoplast.CollectionView.create(this._allSections);
            this.sectionsMenu = Protoplast.CollectionView.create(this._allSections);
            this.sectionsMenu.addFilter({
                properties: ['isVisibleInMenu'],
                fn: function(section) {
                    return section.isVisibleInMenu;
                }
            });
            this.sectionsMap = {};
            this.tooltip = TooltipModel.create();
        },
        
        addSection: function(name, section) {
            this.sectionsMap[name] = section;
            this._allSections.add(section);
        },
        
        getSection: function(name) {
            return this.sectionsMap[name];
        }
        
    });

    return ThemeModel;
});