define(function(require) {

    var Env = require('acceptance/env');

    describe('Application Monitor', function() {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        describe('Navigation', function() {

            it('WHEN open plugin is selected THEN navigation/open/main event is tracked', function() {
                // WHEN
                env.user.theme.open_plugin('open');

                // THEN
                env.assert.monitor.event_tracked('navigation', 'open', 'main');
            });

            it('GIVEN info plugin is active WHEN open plugin is selected from toolbar THEN navigation/open/toolbar event is tracked', function() {
                // GIVEN: make toolbar visible
                env.user.theme.open_plugin('info');

                // WHEN
                env.user.theme.open_plugin_from_toolbar('open');

                // THEN
                env.assert.monitor.event_tracked('navigation', 'open', 'toolbar');
            });

            it('GIVEN info plugin is active WHEN selected plugin is re-selected THEN event is tracked only once', function() {
                // GIVEN
                env.user.theme.open_plugin('info');

                // WHEN
                env.user.theme.open_plugin_from_toolbar('info');

                // THEN
                env.assert.monitor.event_tracked_n_times(1, 'navigation', 'info', 'toolbar');
            });

            it('GIVEN info plugin is active WHEN switch to open is clicked THEN navigation/open/switcher event is tracked', function() {
                // GIVEN
                env.user.theme.open_plugin('info');

                // WHEN
                env.user.theme.click_switch_link('open');

                // THEN
                env.assert.monitor.event_tracked('navigation', 'open', 'switcher');
            });
    
            it('GIVEN a plugin X is active WHEN close button is clicked THEN navigation/toolbar-close/X is tracked', function() {
                // GIVEN
                env.user.theme.open_plugin('open');
        
                // WHEN
                env.user.theme.close_content();
        
                // THEN
                env.assert.monitor.event_tracked('navigation', 'toolbar-close', 'open');
            });
    
            it('GIVEN a plugin X is active WHEN close button is swiped by more than 100px THEN navigation/toolbar-swipe-close/X is tracked', function() {
                // GIVEN
                env.user.theme.open_plugin('open');
        
                // WHEN
                env.user.theme.swipe_content(200);
        
                // THEN
                env.assert.monitor.event_tracked('navigation', 'toolbar-swipe-close', 'open');
            });

            it('GIVEN open plugin is active WHEN background is clicked THEN content is hidden', function() {
                // GIVEN
                env.user.theme.open_plugin('open');

                // WHEN
                env.user.theme.back_to_main();

                // THEN
                env.assert.monitor.event_tracked('navigation', 'back-close', 'open');
            });

            it('GIVEN open plugin is active WHEN a section X is expanded (question mark icon) THEN feature/help/X event is tracked', function() {
                // GIVEN
                env.user.theme.open_plugin('open');

                // WHEN
                env.user.theme.click_info_icon('open-start');

                // THEN
                env.assert.monitor.event_tracked('feature', 'help', 'open-start');
            });

            it('GIVEN open plugin is active WHEN expand button is clicked then feature/expand event is tracked', function() {
                // GIVEN
                env.user.theme.open_plugin('open');

                // WHEN
                env.user.theme.click_expand_icon();

                // THEN
                env.assert.monitor.event_tracked('feature', 'expand');
            });
        });

    });

});