define(function(require) {

    var Env = require('acceptance/env');

    describe('Open', function() {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('WHEN a file is loaded from disk THEN editor value is set to its content', function(done) {
            // GIVEN
            env.scenarios.load_local_file(
                {
                    name: 'test.fountain',
                    content: 'test'
                },
                function() {
                    env.user.theme.open_plugin('editor');

                    // THEN
                    env.assert.editor.editor_content('test');

                    done();
                }
            );
        });

        // Regression
        it('GIVEN a local file is loaded WHEN a file is loaded from disk again THEN editor value is set to its content', function(done) {
            // GIVEN
            env.scenarios.load_local_file({name: 'test.fountain', content: 'test'},
                function() {
                    env.scenarios.load_local_file({name: 'test2.fountain', content: 'test2'},
                        function() {
                            // THEN
                            env.assert.editor.editor_content('test2');
                            done();
                        }
                    );
                }
            );
        });

        it('WHEN a FinalDraft file is loaded THEN editor is set to its converted content', function(done) {
            // WHEN
            env.scenarios.load_local_file({
                    name: 'test.fountain',
                    content: '<?xml version="1.0" encoding="UTF-8"?><FinalDraft DocumentType="Script" Template="No" Version="1"><Content><Paragraph Type="Action"><Text>Action. Action.</Text></Paragraph></Content></FinalDraft>'
                },
                function() {
                    env.user.theme.open_plugin('editor');

                    // THEN
                    env.assert.editor.editor_content('\nAction. Action.\n');
                    done();
                }
            );
        });

        it('WHEN open from Dropbox is clicked THEN list of files is displayed', function() {
            // GIVE
            env.user.theme.open_plugin('open');

            // WHEN
            env.user.open.open_from_dropbox();
            env.dropbox.auth_dropbox();
            env.browser.tick(1000);

            // THEN
            env.assert.popup.file_list_is_visible();
        });

        it('WHEN a Dropbox file is loaded THEN editor is set to its content', function(done) {
            // GIVEN
            env.scenarios.load_dropbox_file({
                name: 'file.fountain',
                content: 'test content'
            }, function() {
                // THEN: switch to editor
                env.user.theme.open_plugin('editor');
            
                // THEN
                env.assert.editor.editor_content('test content');
                done();
            });
        });

        it('WHEN open dialog is displayed THEN search bar is visible', function() {
            // GIVEN
            env.dropbox.has_file({name: 'screenplay.fountain', content: 'test'});
            env.dropbox.has_file({name: 'script.fountain', content: 'test'});
            env.user.theme.open_plugin('open');

            // WHEN
            env.user.open.open_from_dropbox();
            env.dropbox.auth_dropbox();
            env.browser.tick(3000);

            // THEN
            env.assert.popup.search_bar_visible(true);
        });

        it('WHEN open dialog is displayed AND at least 3 letters are typed to search THEN list is filtered', function() {
            // GIVEN
            env.dropbox.has_file({name: 'screenplay.fountain', content: 'test'});
            env.dropbox.has_file({name: 'script.fountain', content: 'test'});
            env.user.theme.open_plugin('open');

            // WHEN
            env.user.open.open_from_dropbox();
            env.dropbox.auth_dropbox();
            env.browser.tick(3000);

            env.assert.popup.tree_node_visible('screenplay.fountain', true);
            env.assert.popup.tree_node_visible('script.fountain', true);

            env.user.popup.type_in_search_bar('s');
            env.assert.popup.tree_node_visible('screenplay.fountain', true);
            env.assert.popup.tree_node_visible('script.fountain', true);

            env.user.popup.type_in_search_bar('c');
            env.assert.popup.tree_node_visible('screenplay.fountain', true);
            env.assert.popup.tree_node_visible('script.fountain', true);

            env.user.popup.type_in_search_bar('r');
            env.assert.popup.tree_node_visible('screenplay.fountain', true);
            env.assert.popup.tree_node_visible('script.fountain', true);

            env.user.popup.type_in_search_bar('e');
            env.assert.popup.tree_node_visible('screenplay.fountain', true);
            env.assert.popup.tree_node_visible('script.fountain', false);

        });

        it('GIVEN Dropbox is available WHEN open plugin is opened THEN open from Dropbox link is visible', function() {
            // GIVEN
            env.user.theme.open_plugin('open');

            // THEN
            env.assert.io.open_button_visible('dropbox', true);
        });

        it('GIVEN Dropbox is not available WHEN open plugin is opened THEN open from Dropbox link is not visible', function() {
            // GIVEN
            env.dropbox.disable();
            env.user.theme.open_plugin('open');

            // THEN
            env.assert.io.open_button_visible('dropbox', false);

            env.dropbox.enable();
        });

        it('GIVEN GoogleDrive is available WHEN open plugin is opened THEN open from GoogleDrive link is visible', function() {
            // GIVEN
            env.user.theme.open_plugin('open');

            // THEN
            env.assert.io.open_button_visible('google_drive', true);
        });

        it('GIVEN GoogleDrive is not available WHEN open plugin is opened THEN open from GoogleDrive link is not visible', function() {
            // GIVEN
            env.google_drive.disable();
            env.user.theme.open_plugin('open');

            // THEN
            env.assert.io.open_button_visible('google_drive', false);

            env.google_drive.enable();
        });

        it('GIVEN fresh app WHEN open plugin is opened THEN last used content link is not displayed', function() {
            // GIVEN
            env.user.theme.open_plugin('open');

            // THEN
            env.assert.io.last_used_is_visible(false);
        });

        it('GIVEN content is set WHEN app is reloaded THEN last used content link is displayed', function() {
            // GIVEN
            env.scenarios.create_new_script('Title: Test Script');

            // WHEN
            env.refresh();

            // THEN
            env.user.theme.open_plugin('open');
            env.assert.io.last_used_is_visible(true);
            env.assert.io.last_used_title('Test Script');
        });

        it('GIVEN last content link is visible WHEN last opened is clicked THEN editor contains last used content', function() {
            // GIVEN
            env.scenarios.create_new_script('Title: Test Script');
            env.refresh();

            // WHEN
            env.user.theme.open_plugin('open');
            env.user.open.open_last_used();
            env.user.theme.open_plugin('editor');

            // THEN
            env.assert.editor.editor_content('Title: Test Script');
        });

    });

});