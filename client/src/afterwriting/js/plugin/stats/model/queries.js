define(function(require) {
    var helper = require('utils/helper'),
        fquery = require('utils/fountain/query'),
        fhelpers = require('utils/fountain/helpers');

    var h = fhelpers.fq;

    var plugin = {};

    var create_days_and_nights = function() {

        var runner = {};
        
        runner.run = function(tokens, stats_keep_last_scene_time) {
            var query = fquery('label', {
                value: 0
            });
            query.prepare(function(fq) {
                fq.recognized_scenes = 0;
            });
            query.count('value', h.has_scene_time('DAY'), 'DAY', true)
                .count('value', h.has_scene_time('NIGHT'), 'NIGHT', true)
                .count('value', h.has_scene_time('DUSK'), 'DUSK', true)
                .count('value', h.has_scene_time('DAWN'), 'DAWN', true);
            query.enter(h.is('scene_heading'), function(item, fq) {
                if (stats_keep_last_scene_time && fq.last_selection) {
                    fq.last_selection.value++;
                }
            });
            query.exit(function(item, fq) {
                fq.recognized_scenes += item.value;
            });
            query.end(function(result, fq) {
                var all_scenes = fquery().count('scenes', h.is('scene_heading')).run(fq.source).scenes;

                result.push({
                    label: 'OTHER',
                    value: all_scenes - fq.recognized_scenes
                });
            });
            return query.run(tokens);
        };
        
        return runner;
    };

    var create_int_and_ext = function() {

        var query = fquery('label', {value: 0});
        query.prepare(function(fq) {
            fq.recognized_scenes = 0;
        });
        query.enter(h.is('scene_heading'), function(item, fq) {
            fq.select(item.location_type()).value++;
        });
        return query;
    };

    var create_scene_length = function() {
        var runner = {};
        runner.run = function(tokens, stats_keep_last_scene_time) {
            var query = fquery('token', {
                length: 0
            });
            query.prepare(function(fq) {
                fq.current_header = undefined;
            });
            query.enter(h.is('scene_heading'), function(token, fq) {
                fq.current_header = fq.select(token);
                fq.current_header.header = token.text;
                fq.current_header.location_type = token.location_type();
            });
            query.enter(true, function(item, fq) {
                if (fq.current_header) {
                    fq.current_header.length += item.lines.length;
                    if (fq.current_header.token.has_scene_time('DAY')) {
                        fq.current_header.type = 'day';
                    } else if (fq.current_header.token.has_scene_time('NIGHT')) {
                        fq.current_header.type = 'night';
                    } else {
                        fq.current_header.type = fq.last_header_type || 'other';
                    }
                    fq.last_header_type = stats_keep_last_scene_time ? fq.current_header.type : undefined;
                }
            });
            return query.run(tokens);
        };
        return runner;
    };

    var apply_character_levels = function(plan, basics) {
        plan.sort(function(a, b) {
            return b.nof_scenes - a.nof_scenes;
        });

        var level = 1,
            prev, post, prev_top = 0;

        var level_value = function(character) {
            return character.nof_scenes * character.lines / basics.dialogue_lines;
        };

        if (plan.length > 0) {
            plan[0].level = 1;
            for (var i = 1; i < plan.length; i++) {
                if (i === plan.length - 1) {
                    plan[i].level = level;
                } else {
                    prev = level_value(plan[i]) / level_value(plan[prev_top]);
                    post = level_value(plan[i + 1]) / level_value(plan[i]);
                    if (post > prev && level < 3) {
                        level++;
                        prev_top = i;
                    }
                    plan[i].level = level;
                }
            }
        }
    };

    var create_characters = function() {
        var runner = {};
        runner.run = function(tokens, basics, config) {
            var characters_query = fquery('name', {
                nof_scenes: 0,
                lines: 0
            });
            characters_query.enter(h.is('scene_heading'), function(item, fq) {
                fq.current_scene = item;
            });
            characters_query.enter(h.is('character'), function(item, fq) {
                var selector = fq.select(item.name());
                fq.current_character = selector;
                selector.scenes = selector.scenes || [];
                selector.scenes.indexOf(fq.current_scene) === -1 && selector.scenes.push(fq.current_scene);
                selector.nof_scenes = selector.scenes.length;
            });
            characters_query.enter(h.is_dialogue(), function(item, fq) {
                fq.current_character.lines += item.lines.length;
            });
            characters_query.exit(function(selection) {
                selection.time = (selection.lines / basics.dialogue_lines) * basics.dialogue_time;
            });
            var list = characters_query.run(tokens, config);
            apply_character_levels(list.concat(), basics);
            return list;
        };
        return runner;
    };

    var create_locations = function() {
        var query = fquery('name', {
            count: 0
        }, {
            sort_by: 'count'
        });
        query.enter(h.is('scene_heading'), function(item, fq) {
            fq.select(item.location()).count++;
        });
        return query;
    };

    var create_locations_breakdown = function() {
        var runner = {};
        runner.run = function(tokens,lines_per_page) {
            var query = fquery('token', {
                scenes: 0,
                lines: 0,
                scenes_lines: null
            });
            query.prepare(function(fq) {
                fq.current = null;
            });
            query.enter(h.is('scene_heading'), function(item, fq) {
                var same_scene = fq.current && fq.current.token.location() === item.location();
                fq.current = fq.select(same_scene ? fq.current.token : item);
                if (!same_scene) {
                    fq.current.location = item.location();
                    fq.current.scenes_lines = [];
                }

                fq.current.scenes++;
                fq.current.scenes_lines.push(0);

            });
            query.enter(query.not(h.is('scene_heading')), function(item, fq) {
                if (fq.current) {
                    fq.current.lines += item.lines.length;
                    fq.current.pages = fq.current.lines / lines_per_page;
                    fq.current.scenes_lines[fq.current.scenes_lines.length - 1] += item.lines.length;
                }
            });
            return query.run(tokens);
        };
        return runner;
    };

    var create_dialogue_breakdown = function() {
        var runner = {};
        runner.run = function(tokens, basics, max) {
            max = max || 10;
            var top_characters = plugin.characters.run(tokens, basics, {
                sort_by: 'nof_scenes'
            }).splice(0, max);
            top_characters.sort(function(a, b) {
                return a.name > b.name ? 1 : -1;
            });
            var top_index = {};
            top_characters.forEach(function(character, index) {
                top_index[character.name] = index;
            });

            // characters in scene
            var characters_in_scene = fquery('scene');
            characters_in_scene.enter(h.is('scene_heading'), function(item, fq) {
                fq.current_scene = item;
            });
            characters_in_scene.enter(h.is('character'), function(item, fq) {
                var selector = fq.select(fq.current_scene);
                selector.characters = selector.characters || [];
                selector.characters.indexOf(item.name()) === -1 && top_index[item.name()] !== undefined && selector.characters.push(item.name());
            });
            var characters_by_scene = characters_in_scene.run(tokens);
            var links_query = fquery('link_id', {
                scenes: 0
            });
            links_query.enter(true, function(item, fq) {
                var perms = helper.pairs(item.characters);
                perms.each(function(a, b) {
                    a = top_index[a];
                    b = top_index[b];
                    var selector = fq.select(helper.double_id(a, b));
                    selector.from = a;
                    selector.to = b;
                    selector.scenes++;
                });
            });
            var result = {
                characters: top_characters,
                links: links_query.run(characters_by_scene)
            };
            return result;
        };
        return runner;
    };

    var create_page_balance = function() {
        var query = fquery('page_number', {
            action_lines: 0,
            dialogue_lines: 0,
            total_lines: 0,
            first_line: null,
        });
        query.prepare(function(fq) {
            fq.current_page = 1;
        });
        query.enter(h.is('page_break'), function(item, fq) {
            fq.current_page++;
        });
        query.enter(query.not(h.is('page_break')), function(item, fq) {
            var selector = fq.select(fq.current_page);
            selector.first_line = selector.first_line || item;
        });
        query.enter(h.is('scene_heading', 'action'), function(item, fq) {
            var selector = fq.select(fq.current_page);
            selector.action_lines++;
            selector.total_lines++;
        });
        query.enter(h.is_dialogue(), function(item, fq) {
            var selector = fq.select(fq.current_page);
            selector.dialogue_lines++;
            selector.total_lines++;
        });
        query.exit(function(selector) {
            selector.dialogue_time = selector.total_lines ? selector.dialogue_lines / selector.total_lines : 0;
            selector.action_time = selector.total_lines ? selector.action_lines / selector.total_lines : 0;
            selector.dialogue_percentage = selector.total_lines ? selector.dialogue_lines / selector.total_lines : 0;
            selector.action_percentage = selector.total_lines ? selector.action_lines / selector.total_lines : 0;
        });
        return query;
    };


    var create_tempo = function() {

        var runner = {};
        runner.run = function(tokens) {

            var query = fquery('scene_number');
            query.prepare(function(fq) {
                fq.current_scene_number = 0;
                fq.current_scene = null;
                fq.total_lines = 0;
            });
            query.enter(h.is('scene_heading'), function(item, fq) {
                fq.current_scene_number++;
                fq.current_scene = item;
                var selector = fq.select(fq.current_scene_number);
                selector.blocks = [];
                selector.lines = 0;
                selector.scene_heading = item.text;
            });
            query.enter(h.is('action', 'dialogue'), function(item, fq) {
                if (fq.current_scene_number) {
                    var selector = fq.select(fq.current_scene_number);
                    var total = item.lines.length;
                    selector.blocks.push({
                        token: item,
                        lines: total
                    });
                    selector.lines += total;
                    fq.total_lines += total;
                }
            });
            query.exit(function(item) {
                item.avg_lines_per_block = item.lines / item.blocks.length;
                item.blocks.forEach(function(block) {
                    block.line_tempo_change = (item.avg_lines_per_block - block.lines) / block.lines;
                });
            });
            query.end(function(result, fq) {
                result = result.filter(function(scene) {
                    return scene.lines > 0;
                });
                fq.avg_lines_per_scene = fq.total_lines / result.length;
                result.forEach(function(scene) {
                    scene.line_tempo_change = (fq.avg_lines_per_scene - scene.lines) / scene.lines;
                });
            });


            var scenes = query.run(tokens);

            var scenes_weight = scenes.length / 10;
            var result = [{
                line: '',
                scene: '',
                tempo: 0,
            }];
            var current_tempo = 0;
            var max = -Infinity,
                min = Infinity;
            scenes.forEach(function(scene) {
                scene.blocks.forEach(function(block) {
                    current_tempo *= 0.9;
                    block.token.lines.forEach(function(line) {
                        current_tempo *= 0.9;
                        current_tempo += scenes_weight * scene.line_tempo_change + block.line_tempo_change;
                        result.push({
                            scene: scene.scene_heading,
                            line: line.text,
                            line_no: line.token.line,
                            tempo: parseFloat(current_tempo.toFixed(2))
                        });
                        if (current_tempo < min) {
                            min = current_tempo;
                        }
                        if (current_tempo > max) {
                            max = current_tempo;
                        }
                    });
                });
            });
            result.push({
                line: '',
                scene: '',
                tempo: 0,
            });

            return result;
        };

        return runner;
    };

    plugin.days_and_nights = create_days_and_nights();
    plugin.int_and_ext = create_int_and_ext();
    plugin.scene_length = create_scene_length();
    plugin.characters = create_characters();
    plugin.locations = create_locations();
    plugin.dialogue_breakdown = create_dialogue_breakdown();
    plugin.page_balance = create_page_balance();
    plugin.tempo = create_tempo();
    plugin.locationsBreakdown = create_locations_breakdown();

    return plugin;

});