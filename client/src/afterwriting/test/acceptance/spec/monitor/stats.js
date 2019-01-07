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
        
        describe('Stats', function() {
            
            it('WHEN scene length graph bar is clicked THEN editor is displayed AND feature/stats-scene-length-goto event is dispatched', function() {
                // GIVEN
                env.user.theme.open_plugin('open');
                env.user.open.open_sample('brick_and_steel');
                env.user.theme.open_plugin('stats');

                // WHEN
                env.user.stats.click_on_page_stats();

                // THEN
                env.assert.theme.active_plugin_is('editor');
                env.assert.monitor.event_tracked('feature', 'stats-scene-length-goto');
            });
        });
    });

});