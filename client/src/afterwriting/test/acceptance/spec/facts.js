define(function (require) {

    var Env = require('acceptance/env');
    
    describe('Facts', function () {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('GIVEN a script WHEN content changes AND facts plugin is selected THEN stats are refreshed', function() {
            // GIVEN
            env.scenarios.create_new_script('INT. TEST');
            env.user.theme.open_plugin('facts');
            env.assert.facts.number_of_scenes_is(1);

            // WHEN
            env.user.theme.open_plugin('editor');
            env.user.editor.set_editor_content('INT. TEST\n\nINT. TEST');

            // THEN
            env.user.theme.open_plugin('facts');
            env.assert.facts.number_of_scenes_is(2);
        });

        it('GIVEN synchronisation is enabled WHEN facts plugin is selected AND content changes THEN facts are refreshed', function(done) {

            // GIVEN
            env.scenarios.load_dropbox_file({
                name: 'file.fountain',
                content: 'INT. TEST'
            }, function() {
                env.user.theme.open_plugin('editor');
                env.user.editor.turn_sync_on();

                // WHEN
                env.user.theme.open_plugin('facts');
                env.assert.facts.number_of_scenes_is(1);

                // AND
                env.scenarios.dropbox_file_changes('file.fountain', 'INT. TEST\n\nINT. TEST', function() {
                    // THEN
                    env.assert.facts.number_of_scenes_is(2);
                    done();
                });
            });
        });
        
    });

});