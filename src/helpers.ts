import { create_token } from "./token";
class operatorClass{
    is:any;
    is_dialogue:any;
    name:any;
    location:any;
    has_scene_time:any;
    location_type:any;
    enrich_token:any;
};
class helperClass{
    fq:any;
    first_text(type:any, list:any, default_value:any) {
        for (var i = 0; i < list.length; i++) {
            if (list[i].type === type) {
                return list[i].text;
            }
        }
        return default_value;
    };
    create_line(line:any) {
        line.text = line.text || "";
        line.type = line.type || "unknown";
        line.start = line.start || 0;
        line.end = line.end || 0;
        line.token = line.token || function(){var t = create_token(); t.type = line.type; return t};
        line.token.lines = line.token.lines || [line];
        return enrich_line(line);
    };
    create_separator(start:any, end:any) {
        var t = create_token();
        t.text="";
        t.start = start;
        t.end = end;
        t.type = "separator";
        return t;
    };
    version_generator = function(current?:any) {
        current = current || "0";

        var numbers = current.split('.').concat([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

        var bump = function(level:any) {
            numbers[level - 1]++;
            for (var i = level; i < numbers.length; i++) {
                numbers[i] = 0;
            }
        };

        var to_str = function() {
            var copy = numbers.concat();
            copy.reverse();
            while (copy.length > 1 && copy[0] === 0) {
                copy.shift();
            }
            copy.reverse();
            return copy.join('.');
        };

        var increase = function(level:any) {
            if (arguments.length === 0) {
                return to_str();
            }
            bump(level);
            return to_str();
        };

        return increase;
    };
    get_indentation = function(text:string) {
        var match = (text || '').match(/^(\s+)/);
        return match ? match[0] : '';
    };
    blank_text = function(text:string) {
        return (text || '').replace(/./g, ' ');
    };
    operators:operatorClass;
}

var operators = new operatorClass;
var helpers = new helperClass();

operators.is = function() {
    var types = Array.prototype.slice.call(arguments);
    return types.indexOf(this.type) !== -1;
};

operators.is_dialogue = function() {
    return this.is("character", "parenthetical", "dialogue");
};

operators.name = function() {
    var character = this.text;
    var p = character.indexOf("(");
    if (p !== -1) {
        character = character.substring(0, p);
    }
    character = character.trim();
    return character;
};

operators.location = function() {
    var location = this.text.trim();
    location = location.replace(/^(INT\.?\/EXT\.?)|(I\/E)|(INT\.?)|(EXT\.?)/, "");
    var dash = location.lastIndexOf(" - ");
    if (dash !== -1) {
        location = location.substring(0, dash);
    }
    return location.trim();
};

operators.has_scene_time = function(time:any) {
    var suffix = this.text.substring(this.text.indexOf(" - "));
    return this.is("scene_heading") && suffix.indexOf(time) !== -1;
};

operators.location_type = function() {
    var location = this.text.trim();
    if (/^I(NT.?)?\/E(XT.?)?/.test(location)) {
        return "mixed";
    }
    else if (/^INT.?/.test(location)) {
        return "int";
    }
    else if (/^EXT.?/.test(location)) {
        return "ext";
    }
    return "other";
};


helpers.operators = operators;

var create_token_delegator = function(line:any, name:string) {
    return function() {
        return line.token ? line.token[name].apply(line.token, arguments) : null;
    };
};

var create_fquery_delegator = function(name:string) {
    return function() {
        var args = arguments;
        return function(item:any) {
            return item[name].apply(item, args);
        };
    };
};

helpers.fq = {};
for (var name in operators) {
    helpers.fq[name] = create_fquery_delegator(name);
}

var enrich_line = function(line:any) {
    for (var name in operators) {
        line[name] = create_token_delegator(line, name);
    }
    return line;
};

export default helpers;