define(function(require) {

    var InitChangelogController = require('plugin/changelog/controller/init-changelog-controller'),
        mock = require('test/proto-mock'),
        MockStorage = mock(require('core/model/storage'));

    describe('InitChangelogController', function() {

        var START_TIME = 1000,
            initChangelogController,
            mockStorage,
            clock;

        beforeEach(function() {
            clock = sinon.useFakeTimers(START_TIME);
            mockStorage = MockStorage.create();

            initChangelogController = InitChangelogController.create();

            initChangelogController.storage = mockStorage;
        });

        afterEach(function() {
            clock.restore();
        });

        it('WHEN changelog is initialised THEN last visit date is updated', function() {
            // WHEN
            initChangelogController.init();

            // THEN
            sinon.assert.calledOnce(mockStorage.setItem);
            sinon.assert.calledWithExactly(mockStorage.setItem, 'last-visit', START_TIME);
        });

        it('WHEN changelog is initialised THEN last visit timestamp is read', function() {
            // WHEN
            initChangelogController.init();

            // THEN
            sinon.assert.calledOnce(mockStorage.getItem);
            sinon.assert.calledWithExactly(mockStorage.getItem, 'last-visit');
        });

        it('WHEN last date is read THEN it converts timestamp to date object', function() {
            // GIVEN
            mockStorage.getItem.returns(99);

            // WHEN
            var date = initChangelogController.getLastVisitDate();

            // THEN
            chai.assert.strictEqual(date.getTime(), 99);
        });

    });

});
