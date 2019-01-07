define(function(require) {

    var Protoplast = require('protoplast'),
        FakeGapiClient = require('acceptance/helper/server/fake-gapi-client'),
        FakeGapiAuth = require('acceptance/helper/server/fake-gapi-auth');
    
    var FakeGapi = Protoplast.extend({
        
        auth: {
            value: FakeGapiAuth.create()
        },
        
        client: {
            value: FakeGapiClient.create()
        }
        
    });

    return FakeGapi;
});