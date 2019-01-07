var Protoplast = require('protoplast');
var fs = require('fs');

var ConfigLoader = Protoplast.extend({
    
    loadFromFile: function(config, callback){
        if (config) {
            console.log('Loading config...', config);
            fs.readFile(config, 'utf8', function (err, data) {
                if (err) {
                    console.error('Cannot open config file', config);
                    callback({});
                } else {
                    callback(JSON.parse(data));
                }
            });
        } else {
            callback({});
        }
    }
    
});

module.exports = ConfigLoader;
