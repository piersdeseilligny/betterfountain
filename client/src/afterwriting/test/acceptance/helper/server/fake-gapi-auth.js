define(function(require) {

    var Protoplast = require('protoplast');

    var FakeGapiAuth = Protoplast.extend({

        /**
         * Callback called when a user is authorized
         */
        authCallback: null,
        
        init: function(callback) {
            this.authCallback = callback;
        },
        
        commitInit: function() {
            this.authCallback();
        },
        
        authorize: function(credentials, callback) {
            callback({
                access_token: 'token'
            });
        }
        
    });

    return FakeGapiAuth;
});