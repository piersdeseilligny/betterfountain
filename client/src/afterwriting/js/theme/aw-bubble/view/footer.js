define(function(require) {

    var Protoplast = require('protoplast'),
        FooterPresenter = require('theme/aw-bubble/presenter/footer-presenter');

    var Footer = Protoplast.Component.extend({

        $meta: {
            presenter: FooterPresenter
        },
        
        html: '<footer class="main-footer"></footer>',

        content: null,

        init: function() {
            Protoplast.utils.bind(this, 'content', this.render.bind(this));
        },

        render: function() {
            this.root.innerHTML = this.content;
        }
        
    });

    return Footer;
});