define(function(){

    var fontUtils = {};

    fontUtils.nodeAtob = function(b64string) {
        return new Buffer(b64string, 'base64').toString('binary');
    };

    fontUtils.convertBase64ToBinary = function(base64) {
        var atob = (window && window.atob) ? window.atob : fontUtils.nodeAtob;
        var raw = atob(base64);
        var rawLength = raw.length;
        var array = new Uint8Array(new ArrayBuffer(rawLength));

        for(var i = 0; i < rawLength; i++) {
            array[i] = raw.charCodeAt(i);
        }
        return array;
    };

    return fontUtils;

});