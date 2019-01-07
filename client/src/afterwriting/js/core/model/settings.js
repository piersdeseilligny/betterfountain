define(function(require) {

    var Protoplast = require('protoplast'),
        print_profiles = require('utils/print-profiles');

    // TODO: Decouple plugin-specific settings (+++)
    // TODO: Rename Settings properties to CamelCase (+++)
    var Settings = Protoplast.Model.extend({

        snippets: null,

        // Parser settings

        double_space_between_scenes: {
            name: 'double_space_between_scenes',
            value: false
        },

        use_dual_dialogue: {
            name: 'use_dual_dialogue',
            value: true
        },

        each_scene_on_new_page: {
            name: 'each_scene_on_new_page',
            value: false
        },

        print_sections: {
            name: 'print_sections',
            value: false
        },

        print_synopsis: {
            name: 'print_synopsis',
            value: false
        },

        print_actions: {
            name: 'print_actions',
            value: true
        },

        print_headers: {
            name: 'print_headers',
            value: true
        },

        print_dialogues: {
            name: 'print_dialogues',
            value: true
        },

        print_notes: {
            name: 'print_notes',
            value: false
        },

        // Liner settings

        text_more: {
            name: 'text_more',
            value: '(MORE)'
        },

        text_contd: {
            name: 'text_contd',
            value: "(CONT'D)"
        },

        split_dialogue: {
            name: 'split_dialogue',
            value: true
        },

        // PDF settings

        font_family: {
            name: 'font_family',
            value: 'CourierPrime'
        },

        print_profile: {
            name: 'print_profile',
            value: "a4"
        },

        embolden_scene_headers: {
            name: 'embolden_scene_headers',
            value: false
        },

        underline_scene_headers: {
            name: 'underline_scene_headers',
            value: false
        },

        show_page_numbers: {
            name: 'show_page_numbers',
            value: true
        },

        print_title_page: {
            name: 'print_title_page',
            value: true
        },

        text_scene_continued: {
            name: 'text_scene_continued',
            value: 'CONTINUED'
        },

        number_sections: {
            name: 'number_sections',
            value: false
        },

        print_header: {
            name: 'print_header',
            value: ''
        },

        print_footer: {
            name: 'print_footer',
            value: ''
        },

        print_watermark: {
            name: 'print_watermark',
            value: ''
        },

        scenes_numbers: {
            name: 'scenes_numbers',
            value: 'none'
        },

        scene_continuation_bottom: {
            name: 'scene_continuation_bottom',
            value: false
        },

        scene_continuation_top: {
            name: 'scene_continuation_top',
            value: false
        },

        // App settings

        show_background_image: {
            name: 'show_background_image',
            value: true
        },

        load_last_opened: {
            name: 'load_last_opened',
            value: false
        },

        night_mode: {
            name: 'night_mode',
            value: false
        },

        use_print_settings_for_stats: {
            name: 'use_print_settings_for_stats',
            value: true
        },

        cloud_lazy_loading: {
            name: 'cloud_lazy_loading',
            value: false
        },

        pdfjs_viewer: {
            name: 'pdfjs_viewer',
            value: false
        },

        stats_keep_last_scene_time: {
            name: 'stats_keep_last_scene_time',
            value: true
        },

        stats_who_with_who_max: {
            name: 'stats_who_with_who_max',
            value: 10
        },
    
        merge_empty_lines: {
            name: 'merge_empty_lines',
            value: true
        },

        $create: function() {
            var savedProperties = this.$meta.properties.name;
            for (var property in savedProperties) {
                if (savedProperties.hasOwnProperty(property)) {
                    this.on(property + '_changed', this._triggerChanged.bind(this, property, savedProperties[property]));
                }
            }
        },

        toJSON: function() {
            var json = {};
            var savedProperties = this.$meta.properties.name;
            for (var property in savedProperties) {
                if (savedProperties.hasOwnProperty(property)) {
                    json[savedProperties[property]] = this[property];
                }
            }
            return json;
        },

        fromJSON: function(json) {
            var savedProperties = this.$meta.properties.name, jsonProperty;
            for (var property in savedProperties) {
                if (savedProperties.hasOwnProperty(property)) {
                    jsonProperty = savedProperties[property];
                    if (json.hasOwnProperty(jsonProperty)) {
                        this[property] = json[jsonProperty];
                    }
                }
            }
        },

        print: {
            get: function() {
                return print_profiles[this.print_profile];
            }
        },

        _triggerChanged: function(property, key) {
            this.dispatch('changed', {key: key, value: this[property]});
        }
    });

    return Settings;
});