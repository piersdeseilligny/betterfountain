define(function (require) {

    var Env = require('acceptance/env');

    describe('Application', function () {

        var env;

        beforeEach(function() {
            env = Env.create();
        });

        afterEach(function() {
            env.destroy();
        });

        it('GIVEN stats plugin is active WHEN page stats is clicked THEN app is switched to editor', function() {
            // GIVEN
            env.scenarios.create_new_script('test');
            env.user.theme.open_plugin('stats');

            // WHEN
            env.user.stats.click_on_page_stats();

            // THEN
            env.assert.theme.active_plugin_is('editor');
        });

        it('GIVEN a plugin is active WHEN expand button is clicked THEN content spans the whole window', function() {
            // GIVEN
            env.user.theme.open_plugin('info');

            // WHEN
            env.user.theme.click_expand_icon();

            // THEN
            env.assert.theme.content_is_expanded(true);
        });

        it('GIVEN content is expanded WHEN expand button is clicked THEN content narrows back', function() {
            // GIVEN
            env.user.theme.open_plugin('info');
            env.user.theme.click_expand_icon();

            // WHEN
            env.user.theme.click_expand_icon();

            // THEN
            env.assert.theme.content_is_expanded(false);
        });
    
        it('GIVEN a plugin is active WHEN close content is clicked THEN no plugin is displayed', function() {
            // GIVEN
            env.user.theme.open_plugin('info');
        
            // WHEN
            env.user.theme.close_content();
        
            // THEN
            env.assert.theme.active_plugin_is(undefined);
        });
    
        it('GIVEN a plugin is active WHEN close content is swiped by more than 100px THEN no plugin is displayed', function() {
            // GIVEN
            env.user.theme.open_plugin('info');
        
            // WHEN
            env.user.theme.swipe_content(200);
        
            // THEN
            env.assert.theme.active_plugin_is(undefined);
        });
    
        it('GIVEN X plugin is active WHEN close content is swiped by less than 100px THEN X plugin is displayed', function() {
            // GIVEN
            env.user.theme.open_plugin('info');
        
            // WHEN
            env.user.theme.swipe_content(50);
        
            // THEN
            env.assert.theme.active_plugin_is('info');
        });

        it('GIVEN a plugin is active WHEN a top menu item is selected THEN selected plugin is displayed', function() {
            // GIVEN
            env.user.theme.open_plugin('info');

            // WHEN
            env.user.theme.open_plugin_from_toolbar('open');

            // THEN
            env.assert.theme.active_plugin_is('open');
        });

        it('GIVEN a plugin is active WHEN a main menu item is selected THEN selected plugin is displayed', function(){
            // WHEN
            env.user.theme.open_plugin('open');

            // THEN
            env.assert.theme.active_plugin_is('open');
        });

        it('GIVEN a plugin is active WHEN a selected plugin is re-selected from the top menu THEN the same plugin is shown', function() {
            // GIVEN
            env.user.theme.open_plugin('info');

            // WHEN
            env.user.theme.open_plugin_from_toolbar('info');

            // THEN
            env.assert.theme.active_plugin_is('info');
        });

        it('GIVEN a plugin is active WHEN background is clicked THEN no plugin is displayed', function() {
            // GIVEN
            env.user.theme.open_plugin('info');

            // WHEN
            env.user.theme.back_to_main();

            // THEN
            env.assert.theme.active_plugin_is(undefined);
        });
        
    });

});