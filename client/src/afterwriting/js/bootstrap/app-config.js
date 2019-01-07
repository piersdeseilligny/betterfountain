define(function(require) {

    var CoreConfig = require('bootstrap/core-config'),
        ThemeModel = require('theme/aw-bubble/model/theme-model'),
        ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        AppController = require('core/controller/app-controller'),
        AppModel = require('core/model/app-model'),
        Storage = require('core/model/storage'),
        GoogleAnalyticsMonitor = require('core/controller/google-analytics-monitor'),
        InfoPlugin = require('plugin/info/info-plugin'),
        IoPlugin = require('plugin/io/io-plugin'),
        EditorPlugin = require('plugin/editor/editor-plugin'),
        StatsPlugin = require('plugin/stats/stats-plugin'),
        SettingsPlugin = require('plugin/settings/settings-plugin'),
        PreviewPlugin = require('plugin/preview/preview-plugin'),
        MonitorPlugin = require('plugin/monitor/monitor-plugin'),
        ChangelogPlugin = require('plugin/changelog/changelog-plugin'),
        AppView = require('view/app-view');

    /**
     * Application Config, contains Core Config + Theme + Plugins
     *
     * The order in the menu is defined by sort passed to the theme.
     *
     * @module bootstrap/app-config
     * @augments module:bootstrap/core-config
     * 
     * @tutorial bootstrap
     */
    var AppConfig = CoreConfig.extend({

        /**
         * Main view displayed when the config is loaded
         *
         * @type {View.AppView}
         */
        MainView: {
            value: AppView
        },

        /**
         * Order in which sections are organised in the menu
         */
        sectionsOrder: ['info', 'open', 'settings', 'editor', 'save', 'preview', 'facts', 'stats'],

        init: function(context) {
            
            var themeModel = ThemeModel.create();
            
            CoreConfig.init.call(this, context);

            context.register(themeModel);
            context.register(ThemeController.create());
            context.register(AppController.create());
            context.register('appModel', AppModel.create());
            context.register('monitor', GoogleAnalyticsMonitor.create());
            context.register('storage', Storage.create());

            // TODO: Disallow injecting plugin's controllers between each other (++)
            // TODO: Disallow injecting objects directly to views (++)
            context.register(InfoPlugin.create(context));
            context.register(IoPlugin.create(context));
            context.register(EditorPlugin.create(context));
            context.register(StatsPlugin.create(context));
            context.register(SettingsPlugin.create(context));
            context.register(PreviewPlugin.create(context));
            context.register(MonitorPlugin.create(context));
            context.register(ChangelogPlugin.create(context));
            
            themeModel.sectionsMenu.addSort({
                fn: function(a, b) {
                    return this.sectionsOrder.indexOf(a.name) - this.sectionsOrder.indexOf(b.name);
                }.bind(this)
            });
        }
        
    });

    return AppConfig;
});