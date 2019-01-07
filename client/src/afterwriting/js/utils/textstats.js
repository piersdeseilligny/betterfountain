define('utils/textstats', function(require){

    var module = {};

    module.get_characters = function(text) {
        var i, characters = {};
        for (i = 0; i < text.length; i++) {
            characters[text[i]] = true;
        }
        return Object.keys(characters);
    };

    return module;

});