define(function(require) {

    var Protoplast = require('protoplast');
    
    /**
     * Base presenter for a main section of a plugin. It provides 3 hook methods:
     * * activate()      called when section is shown; it will automatically show the view for the presenter
     * * deactivate()    called when section is hidden; it will automatically hide the view for the presenter
     * * _scriptChanged  invoked when script changes and section is active; script is parsed before calling the hook
     * 
     * @alias BaseSectionViewPresenter
     */
    var BaseSectionViewPresenter = Protoplast.Object.extend({

        scriptModel: {
            inject: 'script'
        },
        
        /**
         * @type {SectionViewMixin}
         */
        view: null,

        /**
         * Flag used internally to make sure deactivate is not called when section is initially inactive
         * @private
         * @type {boolean}
         */
        _isActive: false,

        _scriptBindings: null,
        
        init: function() {
            var section = this.view.section;
            Protoplast.utils.bind(section, 'isActive', this._isActiveChanged);
        },

        /**
         * Called when section is shown. Parses the script, shows the view and initialises script bindings
         */
        activate: function() {
            this._scriptBindings = Protoplast.utils.bind(this.scriptModel, 'script', this._scriptChanged);

            this.view.show();
            this._isActive = true;
        },

        /**
         * Called when section is closed. Clears bindings and hides the view.
         */
        deactivate: function() {
            this._scriptBindings.stop();
            this.view.hide();
            this._isActive = false;
        },

        _isActiveChanged: function(isActive) {
            if (isActive && !this._isActive) {
                this.activate();
            }
            else if (!isActive && this._isActive) {
                this.deactivate();
            }
        },

        /**
         * Called when script changes. Called only section is active.
         * @protected
         */
        _scriptChanged: function() {}
        
    });

    return BaseSectionViewPresenter;
});