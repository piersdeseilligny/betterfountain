define(function(require) {

    /**
     * Browser helpers
     * @exports utils/browser
     */
    var browser = {};

    /**
     * Returns map of params passed to the URL
     * @returns {Object}
     */
    browser.url_params = function() {
        var url_params = {};
        if (window && window.location && window.location.search) {
            window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(str, key, value) {
                url_params[key] = value;
            });
        }
        return url_params;
    };

    return browser;

});