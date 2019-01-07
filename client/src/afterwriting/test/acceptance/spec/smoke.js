define(function (require) {

    var Env = require('acceptance/env');
    
    describe('Smoke test', function () {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('WHEN info plugin is opened from the main menu THEN info plugin is displayed', function() {
            // act
            env.user.theme.open_plugin('info');
            
            // assert
            env.assert.theme.active_plugin_is('info');
        });
        
    });

});