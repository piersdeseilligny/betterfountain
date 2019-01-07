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
        
        describe('Info', function() {
            
            it('WHEN download button is clicked THEN feature/download is tracked', function() {
                // GIVEN
                env.user.theme.open_plugin('info');

                // WHEN
                env.user.info.download_offline_app();

                // THEN
                env.assert.monitor.event_tracked('feature', 'download');
            });
        });
        
    });
    
});