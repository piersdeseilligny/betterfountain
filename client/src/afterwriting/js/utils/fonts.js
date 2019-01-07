define(function(require){

    var CourierPrime = require('utils/courier-prime-font');

    var fonts = {};

    fonts[CourierPrime.name] = CourierPrime.fonts;

    return fonts;
});