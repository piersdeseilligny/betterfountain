define(function(require) {

    var Protoplast = require('protoplast'),
        PdfController = require('core/controller/pdf-controller'),
        Settings = require('core/model/settings'),
        ScriptModel = require('core/model/script-model');

    /**
     * Core Config with all core controllers and utils.
     *
     * @module bootstrap/core-config
     * 
     * @tutorial bootstrap
     */
    var CoreConfig = Protoplast.extend({

        /**
         * Initialise config by registering object in context
         * @param {Context} context
         */
        init: function(context) {
            context.register('settings', Settings.create());
            context.register('script', ScriptModel.create());
            context.register('pdf', PdfController.create());
        }
        
    });

    return CoreConfig;
});