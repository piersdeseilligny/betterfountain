define(function(require) {

    var BaseAssert = require('acceptance/helper/assert/base-assert');

    var ThemeAssert = BaseAssert.extend({

        /**
         * Asserts if a given plugin is active
         * @param {Sting} name
         */
        active_plugin_is: function(name) {
            chai.assert.strictEqual(this.dom.theme.get_active_plugin(), name, 'Expected ' + name + ' plugin to be active, but ' + this.dom.theme.get_active_plugin() + ' is active');
        },

        /**
         * Asserts if night mode is enabled
         * @param {boolean} value
         */
        night_mode_is_enabled: function(value) {
            var night_mode = this.dom.theme.is_night_mode();
            if (value) {
                chai.assert.ok(night_mode);
            }
            else {
                chai.assert.notOk(night_mode);
            }
        },

        /**
         * Asserts if active plugin's content is expanded or not
         * @param {boolean} value
         */
        content_is_expanded: function(value) {
            var content_size = this.dom.theme.content_size(),
                window_size = this.dom.theme.window_size();

            if (value) {
                chai.assert.strictEqual(content_size.width, window_size.width);
            }
            else {
                chai.assert.notEqual(content_size.width, window_size.width);
            }
        }
        
    });

    return ThemeAssert;
});