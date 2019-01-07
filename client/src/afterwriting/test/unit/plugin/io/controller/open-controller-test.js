define(function(require) {

    var OpenController = require('plugin/io/controller/open-controller'),
        mock = require('test/proto-mock'),
        MockIoModel = mock(require('plugin/io/model/io-model')),
        MockScriptModel = mock(require('core/model/script-model')),
        MockStorage = mock(require('core/model/storage')),
        MockSaveController = mock(require('plugin/io/controller/save-controller'));

        describe('OpenController', function() {

        var openController,
            mockStorage;

        beforeEach(function() {
            mockStorage = MockStorage.create();

            mockStorage.getItem.withArgs('last-used-date').returns('2017-01-01 00:00');
            mockStorage.getItem.withArgs('last-used-title').returns('Title');
            mockStorage.getItem.withArgs('last-used-script').returns('Script');

            openController = OpenController.create();

            openController.storage = mockStorage;
            openController.ioModel = MockIoModel.create();
            openController.saveController = MockSaveController.create();
            openController.scriptModel = MockScriptModel.create();
        });

        it('Loads last used info', function() {
            openController.init();

            chai.assert.strictEqual(openController.ioModel.lastUsedInfo.title, 'Title');
            chai.assert.strictEqual(openController.ioModel.lastUsedInfo.script, 'Script');
            chai.assert.strictEqual(openController.ioModel.lastUsedInfo.date, '2017-01-01 00:00');
        });

    });
});
