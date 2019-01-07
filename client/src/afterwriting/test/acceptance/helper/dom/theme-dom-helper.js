define(function(require) {

    var BaseDomHelper = require('acceptance/helper/dom/base-dom-helper');

    var ThemeDomHelper = BaseDomHelper.extend({

        /**
         * App's background
         */
        $background: '.background-click',

        /**
         * Close content's button to close the current active plugin
         */
        $close_icon: '[data-prop="$closeIcon"]',

        /**
         * Expand icon to switch between narrow and expanded content
         */
        $expand_icon: '[data-prop="$expandIcon"]',

        /**
         * Question mark icon to expand section info
         * @param {string} section_name
         * @returns {string}
         */
        $info_icon: function(section_name) {
            return '.info-icon[section="' + section_name + '"]';
        },

        /**
         * A link for switching to a plugin
         * @see Switcher
         * @param {string} plugin_name
         * @returns {string}
         */
        $switch_link: function(plugin_name) {
            return '.switch[section="' + plugin_name + '"]';
        },

        /**
         * Button containing given text
         * @param {string} text
         * @returns {jQuery}
         */
        $button: function(text) {
            return $('button:contains("' + text + '")');
        },

        /**
         * Menu item for a plugin
         * @param {string} name - plugin name
         * @returns {string}
         */
        $plugin_menu_item: function(name) {
            return '.menu-item.' + name;
        },

        /**
         * Top menu icon for a plugin
         * @param {string} name - plugin name
         * @returns {string}
         */
        $toolbar: function(name) {
            return '.quick-menu-item.' + name;
        },

        /**
         * Current plugin
         * @returns {string}
         */
        get_active_plugin: function() {
            return $('.plugin-content.active').attr('plugin');
        },

        /**
         * True if night mode is enabled
         * @returns {boolean}
         */
        is_night_mode: function() {
            return $('body').hasClass('night-mode');
        },

        /**
         * Size of the content
         * @returns {{width: number, height: number}}
         */
        content_size: function() {
            var content = $('.content');
            return {
                width: content.width(),
                height: content.height()
            }
        },

        /**
         * Size of the window
         * @returns {{width: number, height: number}}
         */
        window_size: function() {
            return {
                width: $(window).width(),
                height: $(window).height()
            }
        }


    });

    return ThemeDomHelper;
});