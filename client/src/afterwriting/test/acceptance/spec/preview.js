define(function(require) {

    var Env = require('acceptance/env');

    describe('Preview', function() {

        var env;

        beforeEach(function() {
            env = Env.create();
            env.scenarios.create_new_script('test');
        });

        afterEach(function() {
            env.destroy();
        });

        // TODO: Test is throwing a "silent" error, to see it enable logs in Gruntfile.js (+)
        it('GIVEN JavaScript PDF Viewer is enabled WHEN preview plugin is selected THEN JavaScript preview is loaded', function(done) {
            // GIVEN
            env.user.theme.open_plugin('settings');
            env.user.preview.select_js_viewer(true);

            // WHEN
            env.user.theme.open_plugin('preview');
            env.browser.tick(3000);

            env.browser.read_files(function() {
                // THEN
                env.assert.preview.preview_is_in_mode('js');
                done();
            });
        });

        // TODO: do not use browser.wait (+)
        it('GIVEN JavaScript PDF Viewer is disabled WHEN preview plugin is selected THEN embedded preview is loaded', function(done) {
            this.timeout(5000);

            // GIVEN
            env.user.theme.open_plugin('settings');
            env.user.preview.select_js_viewer(false);

            // WHEN
            env.user.theme.open_plugin('preview');
            env.browser.wait(function() {
                // THEN
                env.assert.preview.preview_is_in_mode('embedded');
                done();
            }, 3000);
        });

        it('WHEN save pdf locally is clicked THEN save pdf dialog is displayed', function() {
            // WHEN
            env.user.save.save_pdf_locally('preview');

            // THEN
            env.assert.popup.dialog_form_is_visible(true);
            env.assert.popup.dialog_message_is('Select file name:');
            env.assert.popup.dialog_input_content_is('screenplay.pdf');
        });

        it('WHEN save pdf to Dropbox button is clicked THEN save pdf to Dropbox dialog is displayed', function() {
            // GIVEN
            env.user.theme.open_plugin('preview');

            // WHEN
            env.user.save.save_pdf_dropbox('preview');
            env.dropbox.auth_dropbox();
            env.browser.tick(3000);

            // THEN
            env.assert.popup.tree_node_visible('Dropbox', true);
        });

        it('WHEN save pdf to GoogleDrive button is clicked THEN save pdf to GoogleDrive dialog is displayed', function() {
            // GIVEN
            env.user.theme.open_plugin('preview');

            // WHEN
            env.user.save.save_pdf_google_drive('preview');
            env.google_drive.auth_google_drive();
            env.browser.tick(3000);

            // THEN
            env.assert.popup.tree_node_visible('My Drive', true);
        });

        it('GIVEN GoogleDrive is not available THEN save pdf to GoogleDrive is not displayed', function() {
            // GIVEN
            env.google_drive.disable();
            env.user.theme.open_plugin('open');
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('preview');

            // THEN
            env.assert.io.save_button_visible('google_drive', 'preview', 'pdf', false);

            env.google_drive.enable();
        });

        it('GIVEN Dropbox is not available THEN save pdf to Dropbox is not displayed', function() {
            // GIVEN
            env.dropbox.disable();
            env.user.theme.open_plugin('open');
            env.user.open.open_sample('brick_and_steel');
            env.user.theme.open_plugin('preview');

            // THEN
            env.assert.io.save_button_visible('dropbox', 'preview', 'pdf', false);

            env.dropbox.enable();
        });

    });

});