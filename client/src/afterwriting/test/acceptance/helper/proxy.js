define(function(require) {

    var p = require('protoplast');

    /**
     * Simple proxy that forwards HTTP requests to registered fake servers
     */
    var Proxy = p.extend({

        $create: function() {
            this.servers = [];
        },

        setup: function() {
            var self = this;
            this.xhr = sinon.useFakeXMLHttpRequest();
            this.xhr.onCreate = function(xhr) {
                var xhr_send = xhr.send;
                xhr.send = function(data) {
                    xhr_send.call(this, data);
                    self.resolve(xhr);
                }
            };
            this.servers.forEach(function(server) {
                server.setup(this);
            }, this);
        },

        restore: function() {
            this.xhr.restore();
            this.servers.forEach(function(server) {
                server.restore(this);
            }, this);
        },

        register_server: function(server) {
            this.servers.push(server);
        },

        resolve: function(xhr) {
            var resolved = this.servers.some(function(server) {
                return server.resolve_xhr(xhr);
            });
            if (!resolved) {
                console.warn('Unresolved request: ', xhr.method, xhr.url);
            }
        }

    });

    return Proxy;

});