define(function(require) {

    var Protoplast = require('protoplast'),
        SwitcherPresenter = require('theme/aw-bubble/presenter/switcher-presenter');

    var Switcher = Protoplast.Component.extend({
        
        $meta: {
            presenter: SwitcherPresenter
        },
        
        sectionName: null,

        title: '',

        html: '<a href="javascript:void(0)" class="switch"></a>',
        
        init: function() {
            this.root.onclick = this.dispatch.bind(this, 'clicked');
        },
        
        updateTitle: {
            bindWith: 'title',
            value: function() {
                this.root.innerHTML = this.title;
            }
        },
        
        updateSectionName: {
            bindWith: 'sectionName',
            value: function() {
                this.root.setAttribute('section', this.sectionName);
            }
        }
        
    });

    return Switcher;
});