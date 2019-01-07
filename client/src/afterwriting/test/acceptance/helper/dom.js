define(function(require) {

    var $ = require('jquery'),
        p = require('protoplast'),
        EditorDomHelper = require('acceptance/helper/dom/editor-dom-helper'),
        FactsDomHelper = require('acceptance/helper/dom/facts-dom-helper'),
        InfoDomHelper = require('acceptance/helper/dom/info-dom-helper'),
        OpenDomHelper = require('acceptance/helper/dom/open-dom-helper'),
        PopupDomHelper = require('acceptance/helper/dom/popup-dom-helper'),
        PreviewDomHelper = require('acceptance/helper/dom/preview-dom-helper'),
        SaveDomHelper = require('acceptance/helper/dom/save-dom-helper'),
        SettingsDomHelper = require('acceptance/helper/dom/settings-dom-helper'),
        StatsDomHelper = require('acceptance/helper/dom/stats-dom-helper'),
        ThemeDomHelper = require('acceptance/helper/dom/theme-dom-helper');

    /**
     * Translates DOM element into meaningful UI descriptions.
     * 
     * Selectors are prefixed with "$"
     */
    var DomHelper = p.extend({

        editor: null,
        
        facts: null,
        
        info: null,
        
        open: null,
        
        popup: null,
        
        preview: null,
        
        save: null,
        
        settings: null,
        
        stats: null,
        
        theme: null,

        $create: function() {
            this.editor = EditorDomHelper.create();
            this.facts = FactsDomHelper.create();
            this.info = InfoDomHelper.create();
            this.open = OpenDomHelper.create();
            this.popup = PopupDomHelper.create();
            this.preview = PreviewDomHelper.create();
            this.save = SaveDomHelper.create();
            this.settings = SettingsDomHelper.create();
            this.stats = StatsDomHelper.create();
            this.theme = ThemeDomHelper.create();
        },

        is_visible: function(selector) {
            return $(selector).is(':visible');
        },

        clean_href: function(selector) {
            $(selector).attr('href', 'javascript:void(0)');
        }
    });

    return DomHelper;
});