define(['utils/textstats'],function (textstats) {

    describe('Text stats', function () {

        it('gets list of characters', function () {
            var characters = textstats.get_characters('AABB  0123');
            chai.assert.equal(characters.length, 7);
        });

    });

});