define(function (require) {

    var Env = require('acceptance/env');
    
    describe('Stats', function () {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('GIVEN synchronisation is enabled WHEN stats plugin is selected AND content changes THEN stats are refreshed', function(done) {
            // GIVEN
            env.scenarios.load_dropbox_file({
                name: 'file.fountain',
                content: 'INT. TEST\n\nAction.'
            }, function() {
                env.user.theme.open_plugin('editor');
                env.user.editor.turn_sync_on();

                // WHEN
                env.user.theme.open_plugin('stats');
                env.assert.stats.page_balance_pages(1);

                // AND
                env.scenarios.dropbox_file_changes('file.fountain', 'INT. TEST\n\nAction.\n\n===\n\nINT. TEST\n\nAction.', function() {
                    // THEN
                    env.assert.stats.page_balance_pages(2);
                    done();
                });
            });
        });
        
    });

});