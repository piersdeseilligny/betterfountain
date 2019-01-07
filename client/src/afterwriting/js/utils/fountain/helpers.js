define('utils/fountain/helpers', function() {

    var operators = {};

    var module = {
        operators: operators
    };

    operators.is = function() {
        var types = Array.prototype.slice.call(arguments);
        return types.indexOf(this.type) !== -1;
    };

    operators.is_dialogue = function() {
        return this.is('character', 'parenthetical', 'dialogue');
    };

    operators.name = function() {
        var character = this.text;
        var p = character.indexOf('(');
        if (p !== -1) {
            character = character.substring(0, p);
        }
        character = character.trim();
        return character;
    };

    operators.location = function() {
        var location = this.text.trim();
        location = location.replace(/^(INT\.?\/EXT\.?)|(I\/E)|(INT\.?)|(EXT\.?)/, '');
        var dash = location.lastIndexOf(' - ');
        if (dash !== -1) {
            location = location.substring(0, dash);
        }
        return location.trim();
    };

    operators.has_scene_time = function(time) {
        var suffix = this.text.substring(this.text.indexOf(' - '));
        return this.is('scene_heading') && suffix.indexOf(time) !== -1;
    };

    operators.location_type = function() {
        var location = this.text.trim();
        if (/^I(NT.?)?\/E(XT.?)?/.test(location)) {
            return 'mixed';
        }
        else if (/^INT.?/.test(location)) {
            return 'int';
        }
        else if (/^EXT.?/.test(location)) {
            return 'ext';
        }
        return 'other';
    };

    var enrich_token = function(token) {
        for (var name in operators) {
            token[name] = operators[name];
        }
        return token;
    };

    var create_token_delegator = function(line, name) {
        return function() {
            return line.token ? line.token[name].apply(line.token, arguments) : null;
        };
    };

    var create_fquery_delegator = function(name) {
        return function() {
            var args = arguments;
            return function(item) {
                return item[name].apply(item, args);
            };
        };
    };

    module.fq = {};
    for (var name in operators) {
        module.fq[name] = create_fquery_delegator(name);
    }

    var enrich_line = function(line) {
        for (var name in operators) {
            line[name] = create_token_delegator(line, name);
        }
        return line;
    };

    module.first_text = function(type, list, default_value) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].type === type) {
                return list[i].text;
            }
        }
        return default_value;
    };

    module.create_line = function(line) {
        line.text = line.text || "";
        line.type = line.type || "unknown";
        line.start = line.start || 0;
        line.end = line.end || 0;
        line.token = line.token || module.create_token({
            type: line.type
        });
        line.token.lines = line.token.lines || [line];
        return enrich_line(line);
    };

    module.create_token = function(token) {
        token.text = token.text || "";
        token.type = token.type || "unknown";
        token.start = token.start || 0;
        token.end = token.end || 0;
        token.lines = token.lines || [];
        return enrich_token(token);
    };

    module.create_separator = function(start, end) {
        return module.create_token({
            text: '',
            start: start,
            end: end,
            lines: [''],
            type: 'separator'
        });
    };

    return module;
});