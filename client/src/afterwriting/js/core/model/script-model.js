define(function(require) {

    var Protoplast = require('protoplast'),
        fquery = require('utils/fountain/query'),
        fhelpers = require('utils/fountain/helpers'),
        fparser = require('aw-parser'),
        fliner = require('aw-liner'),
        converter = require('utils/converters/scriptconverter'),
        preprocessor = require('utils/fountain/preprocessor');

    var h = fhelpers.fq;
    
    var ScriptModel = Protoplast.Model.extend({

        settings: {
            inject: 'settings'
        },

        /**
         * Basic stats query
         */
        _basicStats: null,

        format: null,
        
        liner: null,

        parser: null,
        
        $create: function() {
            this.parser = fparser.parser;
            this.liner = new fliner.Liner(fparser.helpers);
        },
        
        parsed: {
            computed: ['script'],
            lazy: true,
            value: function() {
                var parsed;

                parsed = this.parser.parse(this.script, {
                    print_headers: this.settings.print_headers,
                    print_actions: this.settings.print_actions,
                    print_dialogues: this.settings.print_dialogues,
                    print_notes: this.settings.print_notes,
                    print_sections: this.settings.print_sections,
                    print_synopsis: this.settings.print_synopsis,
                    each_scene_on_new_page: this.settings.each_scene_on_new_page,
                    double_space_between_scenes: this.settings.double_space_between_scenes,
                    use_dual_dialogue: this.settings.use_dual_dialogue,
                    merge_multiple_empty_lines: this.settings.merge_empty_lines
                });

                parsed.lines = this.liner.line(parsed.tokens, {
                    print: this.settings.print,
                    text_more: this.settings.text_more,
                    text_contd: this.settings.text_contd,
                    split_dialogue: this.settings.split_dialogue
                });
                
                return parsed;
            }
        },

        parsed_stats: {
            computed: ['parsed'],
            lazy: true,
            value: function() {
                var parsed_stats;

                if (this.settings.use_print_settings_for_stats) {
                    parsed_stats = this.parsed;
                } else {
                    var stats_config = Object.create(this.settings);
                    stats_config.print_actions = true;
                    stats_config.print_headers = true;
                    stats_config.print_dialogues = true;
                    stats_config.print_sections = false;
                    stats_config.print_notes = false;
                    stats_config.print_synopsis = false;
                    parsed_stats = this.parser.parse(this.script, stats_config);
                    parsed_stats.lines = this.liner.line(parsed_stats.tokens, stats_config);
                }

                return parsed_stats;
            }
        },

        script: {
            set: function(value) {
                var result = converter.to_fountain(value);
                result.value = preprocessor.process_snippets(result.value, this.settings.snippets);
                this.format = this.format || result.format;
                this._script = result.value;
                this.dispatch('script_changed');
            },
            get: function() {
                return this._script;
            }
        },

        getBasicStats: function() {
            this._createStatsQuery(); // to refresh config-related properties
            return this._basicStats.run(this.parsed_stats.lines);
        },

        _createStatsQuery: function() {
            var print = this.settings.print;
            var basic = fquery(null, {
                last_page_lines: 0,
                scenes: 0,
                pages: 0,
                filled_pages: 0,
                action_lines: 0,
                dialogue_lines: 0,
                action_scenes: 0,
                dialogue_scenes: 0
            });
            basic.prepare(function(fq) {
                fq.current_scene_heading_token = null;
                fq.dialogue_in_the_scene = false;
            });
            basic.count('action_lines', h.is('action', 'scene_heading', 'shot'));
            basic.count('dialogue_lines', h.is_dialogue());
            basic.count('pages', h.is('page_break'));
            basic.enter(h.is_dialogue(), function(item, fq) {
                fq.dialogue_in_the_scene = true;
            });
            basic.enter(h.is('scene_heading'), function(item, fq) {
                if (fq.current_scene_heading_token !== item.token) {
                    fq.select().scenes++;
                    fq.current_scene_heading_token = item.token;
                    if (fq.select().scenes > 1) {
                        if (fq.dialogue_in_the_scene) {
                            fq.select().dialogue_scenes += 1;
                        } else {
                            fq.select().action_scenes += 1;
                        }
                        fq.dialogue_in_the_scene = false;
                    }
                }
            });
            basic.enter(true, function(item, fq) {
                var selector = fq.select();
                if (item.is('page_break')) {
                    selector.filled_pages += (selector.last_page_lines + 1) / print.lines_per_page;
                    selector.last_page_lines = 0;
                } else {
                    selector.last_page_lines++;
                }
            });
            basic.exit(function(item, fq) {
                // last scene
                if (fq.dialogue_in_the_scene) {
                    fq.select().dialogue_scenes++;
                } else {
                    fq.select().action_scenes++;
                }

                var all = item.action_lines + item.dialogue_lines;
                item.pages = item.pages + item.last_page_lines / print.lines_per_page;
                item.filled_pages += item.last_page_lines / print.lines_per_page;
                item.action_time = (item.action_lines / all) * item.filled_pages;
                item.dialogue_time = (item.dialogue_lines / all) * item.filled_pages;
            });
            basic.end(function(result) {
                if (result.length === 0) {
                    result.push({
                        pages: 0.0,
                        filled_pages: 0.0,
                        scenes: 0,
                        action_time: 0.0,
                        dialogue_time: 0.0,
                        dialogue_lines: 0,
                        characters: [],
                        locations: []
                    });
                }
            });

            this._basicStats = basic;
        }

    });

    return ScriptModel;
});