define(function(require) {

    var Env = require('acceptance/env');

    describe('Settings', function() {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('WHEN night mode checkbox is selected THEN night mode switches immediately,' +
            'AND WHEN night mode checkbox is deselected THEN night mode switches immediately', function() {
            // GIVEN
            env.scenarios.create_new_script('test');
            env.user.theme.open_plugin('settings');

            // WHEN
            env.user.settings.select_night_mode();

            // THEN
            env.assert.theme.night_mode_is_enabled(true);
            
            // AND WHEN
            env.user.settings.select_night_mode();
            
            // THEN
            env.assert.theme.night_mode_is_enabled(false);
        });

        it('GIVEN default settings WHEN an option changes AND app is refreshed THEN settings are saved', function() {
            // GIVEN
            env.scenarios.create_new_script('test');
            env.user.theme.open_plugin('settings');

            // WHEN
            env.assert.theme.night_mode_is_enabled(false);
            env.user.settings.select_night_mode();
            env.assert.theme.night_mode_is_enabled(true);


            // AND
            env.refresh();

            // THEN
            env.scenarios.create_new_script('test');
            env.user.theme.open_plugin('settings');
            env.assert.theme.night_mode_is_enabled(true);

            env.user.settings.select_night_mode();
        });

    });

});