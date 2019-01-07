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

        describe('Open', function() {

            beforeEach(function() {
                env.user.theme.open_plugin('open');
            });

            it('WHEN a sample with title title is selected THEN feature/open-sample/title event is tracked', function() {
                // WHEN
                env.user.open.open_sample('brick_and_steel');

                // THEN
                env.assert.monitor.event_tracked('feature', 'open-sample', 'brick_and_steel');
            });

            it('WHEN an empty script is created THEN feature/open-new event is tracked', function() {
                // WHEN
                env.user.open.create_new();

                // THEN
                env.assert.monitor.event_tracked('feature', 'open-new');
            });

            it('WHEN open from local disk dialog is opened THEN feature/open-file-dialog event is traced', function() {
                // WHEN
                env.user.open.open_file_dialog();

                // THEN
                env.assert.monitor.event_tracked('feature', 'open-file-dialog');
            });

            it('WHEN a local file is loaded THEN feature/open-file-opened event is tracked AND format is passed', function(done) {
                // WHEN
                env.scenarios.load_local_file({
                    name: 'test.fountain',
                    content: 'test'
                }, function() {
                    // THEN
                    env.assert.monitor.event_tracked('feature', 'open-file-opened', 'fountain');
                    done();
                });
            });

            it('WHEN a file is opened from Dropbox THEN feature/open-dropbox event is tracked AND format is passed', function(done) {
                // WHEN
                env.scenarios.load_dropbox_file({
                    name: 'file.fountain',
                    content: 'test content'
                }, function() {
                    // THEN
                    env.assert.monitor.event_tracked('feature', 'open-dropbox', 'fountain');
                    done();
                });
            });

            it('WHEN a file is opened from GoogleDrive THEN feature/open-dropbox event is tracked AND format is passed', function(done) {
                // WHEN
                env.scenarios.load_google_drive_file({
                    name: 'file.fountain',
                    content: 'test content'
                }, function() {
                    // THEN
                    env.assert.monitor.event_tracked('feature', 'open-googledrive', 'fountain');
                    done();
                });
            });

            it('WHEN open last used in selected THEN feature/open-last-used/manual event is traced', function() {
                // WHEN
                env.user.open.open_last_used();

                // THEN
                env.assert.monitor.event_tracked('feature', 'open-last-used', 'manual');
            });

            it('GIVEN open last used is selected WHEN app is reloaded THEN  feature/open-last-used/startup event is tracked', function() {
                // GIVEN
                env.scenarios.create_new_script('Title: Test Script');
                env.user.settings.select_open_last_used_on_startup('Title: Test Script');

                // WHEN
                env.refresh();
                
                // THEN
                env.assert.monitor.event_tracked('feature', 'open-last-used', 'startup');
            });
        });
        
    });

});