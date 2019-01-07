define(function(require) {

    var Protoplast = require('protoplast');

    var FakeGapiClient = Protoplast.extend({

        request: function(data) {
            var response, callback;

            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                    response = {
                        result: JSON.parse(xmlHttp.responseText)
                    };
                    if (callback) {
                        callback(response);
                    }
                }
            };

            xmlHttp.open(data.method, data.path, true);
            xmlHttp.send(null);

            return {
                then: function(callback) {
                    if (response) {
                        callback(response);
                    }
                },
                execute: function(callback) {
                    if (response) {
                        callback(response.result);
                    }
                }
            }
        }

    });

    return FakeGapiClient;
});