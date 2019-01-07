define(function(require) {

    var BaseUserHelper = require('acceptance/helper/user/base-user-helper');

    var SettingsUserHelper = BaseUserHelper.extend({

        /**
         * Select checkbox for night mode
         */
        select_night_mode: function() {
            this.click(this.dom.settings.$night_mode);
        },

        /**
         * Select checkbox for opening last used content on startup
         */
        select_open_last_used_on_startup: function() {
            this.click(this.dom.settings.$load_last_opened);
        }
        
    });

    return SettingsUserHelper;
});