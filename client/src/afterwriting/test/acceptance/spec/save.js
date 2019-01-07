define(function(require) {

    var Env = require('acceptance/env');

    describe('Save plugin', function() {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('WHEN save fountain locally is clicked THEN filename dialog is displayed AND default file name is screenplay.fountain', function() {
            // WHEN
            env.user.save.save_fountain_locally('save');

            // THEN
            env.assert.popup.dialog_form_is_visible(true);
            env.assert.popup.dialog_message_is('Select file name:');
            env.assert.popup.dialog_input_content_is('screenplay.fountain');
        });

        it('WHEN save pdf locally is clicked THEN filename dialog is displayed AND default file name is screenplay.pdf', function() {
            // WHEN
            env.user.save.save_pdf_locally('save');

            // THEN
            env.assert.popup.dialog_form_is_visible(true);
            env.assert.popup.dialog_message_is('Select file name:');
            env.assert.popup.dialog_input_content_is('screenplay.pdf');
        });
        
        describe('GIVEN user has a fountain file AND user has a pdf file on Dropbox', function() {

            beforeEach(function() {
                // GIVEN
                env.dropbox.has_file({
                    name: 'file.fountain',
                    content: 'test content'
                });
                env.dropbox.has_file({
                    name: 'file.pdf',
                    content: '%%%',
                    mime_type: 'application/pdf'
                });
            });
            
            it('WHEN save fountain to Dropbox is clicked THEN Dropbox save fountain dialog is displayed AND fountain and PDF files are listed AND search bar is not visible', function() {
                // WHEN
                env.scenarios.initialise_saving_to_dropbox('fountain');

                // THEN
                env.assert.popup.tree_node_visible('Dropbox', true);
                env.assert.popup.tree_node_visible('file.fountain', true);
                env.assert.popup.tree_node_visible('file.pdf', true);
                // AND
                env.assert.popup.search_bar_visible(false);
            });

            it('WHEN save pdf to Dropbox is clicked THEN Dropbox save PDF dialog is displayed AND only pdf files are listed', function() {
                // WHEN
                env.scenarios.initialise_saving_to_dropbox('pdf');

                // THEN
                env.assert.popup.tree_node_visible('Dropbox', true);
                env.assert.popup.tree_node_visible('file.fountain', false);
                env.assert.popup.tree_node_visible('file.pdf', true);
                // AND
                env.assert.popup.search_bar_visible(false);
            });

            it('WHEN fountain is saved to Dropbox THEN confirmation message is displayed', function() {
                // WHEN
                env.scenarios.initialise_saving_to_dropbox('fountain');
                env.user.popup.select_file('file.fountain');
                env.user.popup.save_popup();

                // THEN
                env.assert.dropbox.dropbox_saved(1);
                env.assert.popup.dialog_message_is('File saved!');
            });

            it('WHEN saving fountain file is rejected THEN rejection message is displayed', function() {
                // WHEN
                env.scenarios.initialise_saving_to_dropbox('fountain');
                env.user.popup.select_file('file.fountain');

                env.dropbox.disable();
                env.user.popup.save_popup();

                // THEN
                env.assert.dropbox.dropbox_saved(0);
                env.assert.popup.dialog_message_is('Could not save the file. Try again later.');
            });
            
        });

        it('GIVEN Dropbox is not available THEN Dropbox links are not visible', function() {
            // GIVEN
            env.dropbox.disable();
            env.scenarios.create_new_script('test');
            env.user.theme.open_plugin('save');

            // THEN
            env.assert.io.save_button_visible('dropbox', 'save', 'fountain', false);
            env.assert.io.save_button_visible('dropbox', 'save', 'pdf', false);
            env.assert.io.save_button_visible('google_drive', 'save', 'fountain', true);
            env.assert.io.save_button_visible('google_drive', 'save', 'pdf', true);

            env.dropbox.enable();
        });

        it('GIVEN GoogleDrive is not available THEN GoogleDrive links are not visible', function() {
            // GIVEN
            env.google_drive.disable();
            env.scenarios.create_new_script('test');
            env.user.theme.open_plugin('save');

            // THEN
            env.assert.io.save_button_visible('google_drive', 'save', 'fountain', false);
            env.assert.io.save_button_visible('google_drive', 'save', 'pdf', false);
            env.assert.io.save_button_visible('dropbox', 'save', 'fountain', true);
            env.assert.io.save_button_visible('dropbox', 'save', 'pdf', true);

            env.google_drive.enable();
        });

    });

});