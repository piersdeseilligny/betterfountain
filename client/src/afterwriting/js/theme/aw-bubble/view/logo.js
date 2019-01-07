define(function(require) {

    var Protoplast = require('protoplast');

    var Logo = Protoplast.Component.extend({
        
        html: '<p class="logo">' + 
        '<span class="logo__apostrophe">&rsquo;</span><span class="logo__after">after</span><span class="logo__writing">writing</span>' +
        '</p>'
        
    });

    return Logo;
});