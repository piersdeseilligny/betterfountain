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

        describe('Save', function() {

            beforeEach(function() {
                env.user.theme.open_plugin('open');
                env.user.open.open_sample('brick_and_steel');
                env.user.theme.open_plugin('save');
            });

            it('WHEN a fountain file is saved to local disk THEN feature/save-fountain event is tracked', function() {
                // WHEN
                env.user.save.save_fountain_locally('save');

                // THEN
                env.assert.monitor.event_tracked('feature', 'save-fountain');
            });

            it('WHEN a pdf file is saved to local disk THEN feature/save-pdf event is tracked', function() {
                // WHEN
                env.user.save.save_pdf_locally('save');

                // THEN
                env.assert.monitor.event_tracked('feature', 'save-pdf');
            });

            it('WHEN a fountain file is saved to Dropbox THEN feature/save-fountain-dropbox event is tracked', function() {
                // WHEN
                env.user.save.save_fountain_dropbox('save');

                // THEN
                env.assert.monitor.event_tracked('feature', 'save-fountain-dropbox');
            });

            it('WHEN a pdf file is saved to Dropbox THEN feature/save-pdf-dropbox event is tracked', function() {
                // WHEN
                env.user.save.save_pdf_dropbox('save');

                // THEN
                env.assert.monitor.event_tracked('feature', 'save-pdf-dropbox');
            });

            it('WHEN a fountain file is saved to GoogleDrive THEN feature/save-fountain-googledrive event is tracked', function() {
                // WHEN
                env.user.save.save_fountain_google_drive('save');

                // THEN
                env.assert.monitor.event_tracked('feature', 'save-fountain-googledrive');
            });

            it('WHEN a pdf file is saved to GoogleDrive THEN feature/save-pdf-googledrive event is tracked', function() {
                // WHEN
                env.user.save.save_pdf_google_drive('save');

                // THEN
                env.assert.monitor.event_tracked('feature', 'save-pdf-googledrive');
            });
            
            it('WHEN a mobile pdf file is saved THEN feature/save-mobile-pdf event is tracked', function() {
               // THEN
                env.user.save.save_mobile_pdf();
                
                // THEN
                env.assert.monitor.event_tracked('feature', 'save-mobile-pdf');
            });
        });
        
    });

});