define(function(require){

    var p = require('protoplast');

    /**
     * Fake server allowing to create responses for test requests, e.g.
     * FakeServer.extend({
     *      foo: {
     *          url: /regexp/,
     *          method: 'POST', // any method if not set
     *          value: function() {
     *              return 'result'; // String returned in response, throw Error for error responses
     *          }
     *      }
     * })
     */
    var FakeServer = p.extend({

        /**
         * Runs the mapped function if urls and method match
         * @param xhr
         */
        resolve_xhr: function(xhr) {
            var resolved = false, matches;
            this.each_endpoint(function(opts) {
                if (opts.url.test(xhr.url) && (opts.method === undefined || opts.method === xhr.method)) {
                    resolved = true;
                    matches = xhr.url.match(opts.url).splice(1);
                    try {
                        var result = opts.call.apply(this, [xhr].concat(matches));
                    } catch (e) {
                        xhr.respond(500, { "Content-Type": e.content_type || opts.content_type }, e.message);
                        return;
                    }
                    xhr.respond(200, { "Content-Type": opts.content_type }, result);
                }
            }.bind(this));
            return resolved;
        },

        /**
         * Runs callback with each registered endpoint passing the object with endpoint settings
         * @param callback
         */
        each_endpoint: function(callback) {
            var content_type, method;
            
            for (var func in this.$meta.properties.url) {
                url = this.$meta.properties.url[func];
                content_type = this.$meta.properties.content_type ? this.$meta.properties.content_type[func] : "application/json";
                method = this.$meta.properties.method ? this.$meta.properties.method[func] : undefined;
                call = this[func].bind(this);

                callback({
                    url: url,
                    content_type: content_type,
                    method: method,
                    call: call
                });
            }
        }

    });

    return FakeServer;

});