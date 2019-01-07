define(function() {
    
    // TODO: Extract fquery to a separate library (+++++)
    var fquerybuilder = function(key_name, base, config) {

        var fquery = {
            flat: !key_name,
            key_name: key_name || '___',
            base: base,
            processors: [],
            result: [],
            config: config || {},
            lock: false
        };

        fquery.not = function(condition) {
            return function(item) {
                return !condition(item);
            };
        };

        fquery.prepare = function(func) {
            fquery.prepare_handler = func;
            return fquery;
        };

        fquery.enter = function(condition, action) {
            var processor = {
                condition: condition,
                action: action
            };
            fquery.processors.push(processor);
            return fquery;
        };

        fquery.exit = function(func) {
            fquery.exit_handler = func;
            return fquery;
        };

        fquery.end = function(func) {
            fquery.end_handler = func;
            return fquery;
        };

        fquery.select = function(key) {
            var selection;
            for (var i = 0; i < fquery.result.length; i++) {
                if (fquery.result[i][fquery.key_name] === key) {
                    selection = fquery.result[i];
                }
            }

            if (selection === undefined) {
                var item = {};
                item[fquery.key_name] = key;
                for (var prop in base) {
                    item[prop] = base[prop];
                }
                fquery.result.push(item);
                fquery.last_selection = item;
                return item;
            } else {
                fquery.last_selection = selection;
                return selection;
            }
        };

        fquery.count = function(counter_name, condition, key, lock) {
            fquery.enter(condition, function(item, fq) {
                var selector = fq.select(key);
                if (!selector.hasOwnProperty(counter_name)) {
                    selector[counter_name] = 0;
                }
                selector[counter_name]++;
                if (lock) {
                    fquery.lock = true;
                }
            });
            return fquery;
        };

        fquery.run = function(data, override_config) {
            var config = override_config || fquery.config;
            fquery.index = -1;
            fquery.source = data;
            fquery.result = [];
            fquery.last_selection = undefined;
            if (fquery.prepare_handler) {
                fquery.prepare_handler(fquery);
            }
            data.forEach(function(item) {
                fquery.index++;
                fquery.processors.forEach(function(processor) {
                    if (!fquery.lock && (processor.condition === true || processor.condition(item))) {
                        processor.action(item, fquery);
                    }
                });
                fquery.lock = false;
            });

            if (fquery.exit_handler) {
                fquery.result.forEach(function(item) {
                    fquery.exit_handler(item, fquery);
                });
            }

            if (config.sort_by) {
                var sort_prop = config.sort_by;
                fquery.result.sort(function(a, b) {
                    return config.asc ? a[sort_prop] - b[sort_prop] : b[sort_prop] - a[sort_prop];
                });
            }

            if (fquery.end_handler) {
                fquery.end_handler(fquery.result, fquery);
            }

            return fquery.flat && fquery.result.length ? fquery.result[0] : fquery.result;
        };


        return fquery;

    };

    return fquerybuilder;
});