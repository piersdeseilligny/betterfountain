define('utils/fountain/preprocessor', function(require) {

    var module = {};

    var capitalize = function(text) {
        return text.charAt(0).toLocaleUpperCase() + text.slice(1);
    };

    var chain_values = function(current, next) {
        return current ? (current + '.' + next) : next;
    };

    var merge_keys = function(obj, result, chain) {
        chain = chain || "";
        Object.keys(obj).forEach(function(key) {
            if (typeof (obj[key]) === "string") {
                result[chain_values(chain, key)] = obj[key];
            } else {
                merge_keys(obj[key], result, chain_values(chain, key));
            }
        });
    };

    var replaceAll = function(text, value, new_value) {
        return text.replace(new RegExp(value, "g"), new_value);
    };

    module.process_snippets = function(text, variables) {
        var merged_variables = {}, all_variables;

        merge_keys(variables || {}, merged_variables);

        all_variables = Object.keys(merged_variables);

        all_variables.sort(function(a, b) {
            var a_value = merged_variables[a];
            if (a_value.toLocaleUpperCase().indexOf(b.toLocaleUpperCase()) !== -1) {
                return -1;
            }
            else {
                return 1;
            }
        });

        all_variables.forEach(function(variable) {
            text = replaceAll(text, '\\$' + variable, merged_variables[variable]);
            text = replaceAll(text, '\\$' + variable.toLocaleUpperCase(), merged_variables[variable].toLocaleUpperCase());
            text = replaceAll(text, '\\$' + capitalize(variable), capitalize(merged_variables[variable]));
        });
        return text;
    };

    return module;

});