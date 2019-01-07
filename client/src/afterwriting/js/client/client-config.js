define(function(require) {

    var CoreConfig = require('bootstrap/core-config'),
        ClientController = require('client/client-controller'),
        Options = require('client/options'),
        ConfigLoader = require('client/config-loader');

    /**
     * Config for command line tool.
     *
     * @module client/client-config
     * @augments bootstrap/core-config
     */
    var ClientConfig = CoreConfig.extend({
        
        init: function(context) {

            CoreConfig.init.call(this, context);

            context.register('options', Options.create());
            context.register('configLoader', ConfigLoader.create());
            context.register(ClientController.create());
        }
        
    });

    return ClientConfig;
});