define(function(require) {

    var $ = require('jquery'),
        Protoplast = require('protoplast'),
        AppViewPresenter = require('view/app-view-presenter'),
        BubbleTheme = require('theme/aw-bubble/view/main');

    /**
     * @module view/app-view
     * @class View.AppView
     */
    var AppView = Protoplast.Component.extend({
        
        $meta: {
            presenter: AppViewPresenter
        },
        
        html: '<div class="app"><div data-comp="theme"></div></div>',
        
        theme: {
            component: BubbleTheme
        },

        init: function() {
            $('.loader').remove();
        },

        destroy: function() {
            Protoplast.Component.destroy.call(this);
            $.jstree.destroy();
            this._cleanUpJsTree();
            $.prompt.close();
        },

        // TODO: Check why $.jstree.destroy(); does not remove handlers properly (+)
        _cleanUpJsTree: function() {
            for (var i in $.cache) {
                if ($.cache.hasOwnProperty(i)) {
                    if ($.cache[i].handle && $.cache[i].handle.elem && document !== $.cache[i].handle.elem && !$.contains(document, $.cache[i].handle.elem) && $($.cache[i].handle.elem).hasClass('vakata-context')) {
                        var orphan = $($.cache[i].handle.elem);
                        $('body').append(orphan);
                        orphan.off();
                        orphan.remove();
                        orphan = null;
                    }
                }
            }
        }
        
    });

    return AppView;
});