define(function(require) {
    
    var Protoplast = require('protoplast'),
        $ = require('jquery');

    var MemoryCheck = Protoplast.extend({
        
        check: function() {
            return this.checkDomLeaks();
        },
        
        checkDomLeaks: function() {
            var errors = [], orphans = [];
            for (var i in $.cache) {
                if ($.cache.hasOwnProperty(i)) {
                    if ($.cache[i].handle && $.cache[i].handle.elem && document !== $.cache[i].handle.elem && !$.contains(document, $.cache[i].handle.elem)) {
                        var orphan = $($.cache[i].handle.elem);
                        var outerHtml = orphan.get(0).outerHTML;
                        var closeTagIndex = outerHtml.indexOf('>');
                        var html = outerHtml.substr(0, closeTagIndex + 1);
                        orphans.push(html);

                        $('body').append(orphan);
                        orphan.off();
                        orphan.remove();
                        orphan = null;
                    }
                }
            }
            
            if (orphans.length) {
                errors.push(orphans.length + ' detached DOM elements found:\n\t* ' + orphans.join('\n\t* '));
            }
            
            return errors;
        }
        
    });
    
    return MemoryCheck;
});