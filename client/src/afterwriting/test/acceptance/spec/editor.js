define(function(require) {

    var Env = require('acceptance/env');

    describe('Editor', function() {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('WHEN save fountain locally is clicked THEN save fountain dialog is displayed', function() {
            // GIVEN
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('editor');

            // WHEN
            env.user.save.save_fountain_locally('editor');

            // THEN
            env.assert.popup.dialog_message_is('Select file name:');
        });

        it('WHEN save fountain to Dropbox button is clicked THEN save fountain to Dropbox dialog is displayed', function() {
            // GIVEN
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('editor');

            // WHEN
            env.user.save.save_fountain_dropbox('editor');
            env.dropbox.auth_dropbox();
            env.browser.tick(3000);

            // THEN
            env.assert.popup.tree_node_visible('Dropbox', true);
        });

        it('WHEN save fountain to GoogleDrive button is clicked THEN save fountain to GoogleDrive dialog is displayed', function() {
            // GIVEN
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('editor');

            // WHEN
            env.user.save.save_fountain_google_drive('editor');
            env.google_drive.auth_google_drive();
            env.browser.tick(3000);

            // THEN
            env.assert.popup.tree_node_visible('My Drive', true);
        });

        it('WHEN a new content is created THEN auto-reload AND auto-save are not available', function() {
            // WHEN
            env.user.theme.open_plugin('open');
            env.user.open.create_new();
            env.user.theme.open_plugin('editor');

            // THEN
            env.assert.editor.auto_reload_is_visible(false);
            // AND
            env.assert.editor.auto_save_visible(false);
        });

        it('WHEN a sample script is opened THEN auto-reload AND auto-save are not available', function() {
            // WHEN
            env.user.theme.open_plugin('open');
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('editor');

            // THEN
            env.assert.editor.auto_reload_is_visible(false);
            // AND
            env.assert.editor.auto_save_visible(false);
        });

        it('GIVEN GoogleDrive is available THEN save to GoogleDrive button is visible', function() {
            // GIVEN
            env.user.theme.open_plugin('open');
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('editor');

            // THEN
            env.assert.io.save_button_visible('google_drive', 'editor', 'fountain', true);
        });

        it('GIVEN GoogleDrive is not available THEN save to GoogleDrive button is not visible', function() {
            // GIVEN
            env.google_drive.disable();
            env.user.theme.open_plugin('open');
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('editor');

            // THEN
            env.assert.io.save_button_visible('google_drive', 'editor', 'fountain', false);

            env.google_drive.enable();
        });

        it('GIVEN Dropbox is available THEN save to Dropbox button is visible', function() {
            // GIVEN
            env.user.theme.open_plugin('open');
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('editor');

            // THEN
            env.assert.io.save_button_visible('dropbox', 'editor', 'fountain', true);
        });

        it('GIVEN Dropbox is not available THEN save to Dropbox button is not visible', function() {
            // GIVEN
            env.dropbox.disable();
            env.user.theme.open_plugin('open');
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('editor');

            // THEN
            env.assert.io.save_button_visible('dropbox', 'editor', 'fountain', false);

            env.dropbox.enable();
        });

        it('WHEN local file is loaded THEN auto-save is not available AND auto-reload is available', function(done) {
            // GIVEN
            env.scenarios.load_local_file({
                name: 'test.fountain',
                content: 'test'
            }, function() {
                env.user.theme.open_plugin('editor');

                // THEN
                env.assert.editor.auto_reload_is_visible(true);
                // AND
                env.assert.editor.auto_save_visible(false);

                done();
            });
        });

        describe('WHEN a file is loaded from Dropbox', function() {

            beforeEach(function(done) {

                env.scenarios.load_dropbox_file({
                    name: 'file.fountain',
                    content: 'test content'
                }, function() {
                    env.user.theme.open_plugin('editor');
                    done();
                });
            });

            it('THEN auto-reload and auto-save are available', function() {
                // THEN
                env.assert.editor.auto_reload_is_visible(true);
                env.assert.editor.auto_save_visible(true);
            });

            it('AND empty content is created THEN auto-reload and auto-save are not available', function() {
                // AND
                env.user.theme.open_plugin('open');
                env.user.open.create_new();

                // THEN
                env.assert.editor.auto_reload_is_visible(false);
                env.assert.editor.auto_save_visible(false);
            });

            describe('AND auto-save is enabled', function() {

                beforeEach(function() {
                    // AND
                    env.assert.dropbox.dropbox_saved(0);
                    env.user.editor.turn_auto_save_on();
                });

                it('THEN current content is saved immediately', function(done) {
                    env.assert.dropbox.dropbox_saved(1);
                    done();
                });

                it('AND multiple save cycle passes THEN current content is saved once', function(done) {
                    // AND
                    env.browser.tick(3000);
                    env.browser.tick(3000);
                    env.browser.tick(3000);
                    env.assert.dropbox.dropbox_saved(1);

                    done();
                });

                it('AND content changes THEN new content is saved', function(done) {
                    // AND
                    env.user.editor.set_editor_content('changed content');
                    env.browser.tick(5000);

                    // THEN
                    env.assert.dropbox.dropbox_saved(2);
                    done();
                });

                it('AND content changes AND content is set to the same value THEN content is not saved', function(done) {
                    // AND: content changes
                    env.user.editor.set_editor_content('changed content');
                    env.browser.tick(5000);

                    // AND: content is set to the same value
                    env.user.editor.set_editor_content('changed content');
                    env.browser.tick(5000);

                    // THEN
                    env.assert.dropbox.dropbox_saved(2);
                    done();
                });

            });

            describe('WHEN synchronisation is enabled AND content of sync file changes', function() {

                beforeEach(function(done) {
                    // WHEN Synchronisation is enabled
                    env.user.editor.turn_sync_on();

                    // AND content of synced file changes
                    env.scenarios.dropbox_file_changes('file.fountain', 'changed content', done);
                });

                it('THEN content of the editor is set to new file contet', function(done) {
                    // THEN
                    env.assert.editor.editor_content('changed content');
                    done();
                });

                it('AND synchronisation is disabled AND file content changes THEN editor content is not updated with the latest update', function(done) {
                    // AND: synchronisation is disabed
                    env.user.editor.turn_sync_off();

                    // AND: file content changes
                    env.dropbox.content_change('file.fountain', 'override after sync');
                    env.browser.tick(10000);

                    // THEN 
                    env.assert.editor.editor_content('changed content');
                    env.user.popup.sync_keep_content();
                    env.assert.editor.editor_content('changed content');

                    done();
                });

                it('AND file content changes AND synchronisation is disabled AND previous content is reloaded THEN editor content is set to previous value', function(done) {
                    // AND: file content changes
                    env.dropbox.content_change('file.fountain', 'override after sync');
                    env.browser.tick(10000);

                    // AND: sync disabled
                    env.user.editor.turn_sync_off();

                    // AND: previous content is reloaded
                    env.user.popup.sync_reload_content_before_sync();

                    // THEN
                    env.assert.editor.editor_content('test content');
                    done();
                });
            });

        });

    });

});