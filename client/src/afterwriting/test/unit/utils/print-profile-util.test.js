define(function(require) {

    var PrintProfileUtil = require('utils/print-profile-util');

    describe('PrintProfileUtil', function() {

        var printProfileUtil,
            sourceProfile = {
                lines_per_page: 50,
                font_width: 5,
                font_height: 6,
                font_size: 10,
                foo: {
                    max: 20
                },
                bar: {
                    max: 16
                }
            };

        beforeEach(function() {
            printProfileUtil = PrintProfileUtil.create();
        });

        describe('WHEN font size increases 2 times', function() {

            var profile;

            beforeEach(function() {
                // WHEN
                profile = PrintProfileUtil.withNewFontSize(sourceProfile, 20);
            });

            it('THEN deep config of a given profile is created', function() {
                // THEN
                chai.assert.ok(profile != sourceProfile)
            });

            it('THEN font size increases 2 times', function() {
                chai.assert.strictEqual(profile.font_size, 20);
            });

            it('THEN font width and height increases 2 times', function() {
                chai.assert.strictEqual(profile.font_width, 10);
                chai.assert.strictEqual(profile.font_height, 12);
            });

            it('THEN number of lines per page decreases 2 times', function() {
                chai.assert.strictEqual(profile.lines_per_page, 25);
            });

            it('THEN all type-specific max line length decreases 2 times', function() {
                chai.assert.strictEqual(profile.foo.max, 10);
                chai.assert.strictEqual(profile.bar.max, 8);
            })

        });

    });

});
