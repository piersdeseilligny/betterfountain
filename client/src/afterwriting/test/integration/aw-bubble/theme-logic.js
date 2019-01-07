define(function(require) {

    var ThemeController = require('theme/aw-bubble/controller/theme-controller'),
        ThemeModel = require('theme/aw-bubble/model/theme-model'),
        Section = require('theme/aw-bubble/model/section');

    describe('Theme', function() {

        var themeController,
            themeModel,
            section;

        beforeEach(function() {
            themeController = ThemeController.create();
            themeController.themeModel = themeModel = ThemeModel.create();
            section = Section.create('test');
        });

        it('WHEN selection is cleared THEN section becomes inactive', function() {
            // GIVEN
            themeModel.addSection('test', section);
            section.isActive = true;

            // WHEN
            themeController.clearSelectedSection();

            // THEN
            chai.assert.isFalse(section.isActive);
        });

    });

});
