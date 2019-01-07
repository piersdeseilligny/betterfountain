define(function(require) {

    var p = require('protoplast'),
        EditorUserHelper = require('acceptance/helper/user/editor-user-helper'),
        FactsUserHelper = require('acceptance/helper/user/facts-user-helper'),
        InfoUserHelper = require('acceptance/helper/user/info-user-helper'),
        OpenUserHelper = require('acceptance/helper/user/open-user-helper'),
        PopupUserHelper = require('acceptance/helper/user/popup-user-helper'),
        PreviewUserHelper = require('acceptance/helper/user/preview-user-helper'),
        SaveUserHelper = require('acceptance/helper/user/save-user-helper'),
        SettingsUserHelper = require('acceptance/helper/user/settings-user-helper'),
        StatsUserHelper = require('acceptance/helper/user/stats-user-helper'),
        ThemeUserHelper = require('acceptance/helper/user/theme-user-helper');

    /**
     * Performs user actions
     */
    var User = p.extend({

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

        $create: function(browser, dom) {
            this.editor = EditorUserHelper.create(browser, dom);
            this.facts = FactsUserHelper.create(browser, dom);
            this.info = InfoUserHelper.create(browser, dom);
            this.open = OpenUserHelper.create(browser, dom);
            this.popup = PopupUserHelper.create(browser, dom);
            this.preview = PreviewUserHelper.create(browser, dom);
            this.save = SaveUserHelper.create(browser, dom);
            this.settings = SettingsUserHelper.create(browser, dom);
            this.stats = StatsUserHelper.create(browser, dom);
            this.theme = ThemeUserHelper.create(browser, dom);
        }
    });

    return User;
    
});