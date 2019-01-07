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

        describe('Editor. GIVEN file is loaded from Dropbox', function() {

            beforeEach(function(done) {
                // GIVEN
                env.scenarios.load_dropbox_file({
                    name: 'file.fountain',
                    content: 'test content'
                }, function() {
                    env.user.theme.open_plugin('editor');
                    done();
                });
            });

            it('WHEN auto-reloading is enabled THEN feature/auto-reload event is tracked', function() {
                // WHEN
                env.user.editor.turn_sync_on();

                // THEN
                env.assert.monitor.event_tracked('feature', 'auto-reload', 'dropbox');
            });

            it('WHEN auto-saving is enabled THEN feature/auto-save event is tracked', function() {
                // WHEN
                env.user.editor.turn_auto_save_on();

                // THEN
                env.assert.monitor.event_tracked('feature', 'auto-save', 'dropbox');
            });
        });
        
    });

});