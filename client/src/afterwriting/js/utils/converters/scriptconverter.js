define('utils/converters/scriptconverter', function(require) {

    var finaldraft_converter = require('utils/converters/finaldraft');

    /**
     * Tool recognizes the object format and tries to convert it to fountain
     */
    var module = {};

    function isXMLDoc(elem) {
        try {
            return (elem.ownerDocument || elem).documentElement.nodeName !== "HTML";
        }
        catch (e) {
            return false;
        }
    }

    module.to_fountain = function(value) {
        var format = 'fountain';
        if (/<\?xml/.test(value)) {
            value = finaldraft_converter.to_fountain(value);
            format = 'fdx';
        } else if (isXMLDoc(value)) {
            value = finaldraft_converter.to_fountain(new XMLSerializer().serializeToString(value));
            format = 'fdx';
        }
        return {
            value: value,
            format: format
        };

    };

    return module;
});