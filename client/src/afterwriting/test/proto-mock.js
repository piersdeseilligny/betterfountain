define(function() {

    _mock = function(object) {
        var mock = Object.create(object);
        for (var property in mock) {
            if (typeof mock[property] === 'function') {
                mock[property] = sinon.stub();
            }
            else {
                Object.defineProperty(mock, property, {value: undefined, writable: true});
            }
        }
        return mock;
    };

    /**
     * Mocks all functions for a given Protoplast prototype
     *
     * @param {Object} Prototype
     * @returns {Object}
     */
    var mock = function(Prototype) {
        var Mock = _mock(Prototype);
        Mock.extend = Mock.create = function() {
            return _mock(Prototype);
        };
        return Mock;
    };

    return mock;

});