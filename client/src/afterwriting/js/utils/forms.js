define(function(require) {
    var $ = require('jquery');

    var module = {};

    module.text = function(label, default_value, callback) {

        var html = '<p>' + label + '</p><p><input name="text" class="text_input" value="' + default_value + '"style="width: 90%" autofocus /></p>';

        $.prompt(html, {
            promptspeed: 200,
            loaded: function() {
                setTimeout(function() {
                    $(this).find('.text_input').select().focus();
                }.bind(this), 300);
            },
            buttons: {
                'OK': true,
                'Cancel': false
            },
            submit: function(e, v, m, f) {
                if (v) {
                    callback(f);
                }
            }
        });
    };

    return module;
});