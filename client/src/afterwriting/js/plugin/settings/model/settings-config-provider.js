define(function(require) {

    var Protoplast = require('protoplast'),
        Input = require('core/view/control/input'),
        Checkbox = require('core/view/control/checkbox'),
        Dropdown = require('core/view/control/dropdown'),
        SettingsGroup = require('plugin/settings/model/settings-group'),
        SettingsEntry = require('plugin/settings/model/settings-entry');

    var SettingsConfigProvider = Protoplast.Object.extend({

        /**
         * Return list of groups used by settings addon
         */
        getSettingGroups: function() {
            return Protoplast.Collection.create([
                this.getPrintGroup(),
                this.getLayoutGroup(),
                this.getTextGroup(),
                this.getMiscellaneousGroup(),
                this.getStatsGroup(),
                this.getExperimentalGroup()
            ]);
        },

        getPrintGroup: function() {
            var printGroup = SettingsGroup.create('Print');

            printGroup.addEntry(this.createDropdown('print_profile', 'Page size', [{label: 'A4', value: 'a4'}, {label: 'US letter', value: 'usletter'}]));
            printGroup.addEntry(this.createDropdown('font_family', 'Font', [{label: 'Courier Prime', value: 'CourierPrime'}, {label: 'Courier', value: 'Courier'}]));
            printGroup.addEntry(this.createCheckbox('print_title_page', 'Print title page'));
            printGroup.addEntry(this.createCheckbox('print_sections', 'Print sections'));
            printGroup.addEntry(this.createCheckbox('print_synopsis', 'Print synopsis'));
            printGroup.addEntry(this.createCheckbox('print_notes', 'Print notes'));
            printGroup.addEntry(this.createCheckbox('print_headers', 'Print headers'));
            printGroup.addEntry(this.createCheckbox('print_actions', 'Print actions'));
            printGroup.addEntry(this.createCheckbox('print_dialogues', 'Print dialogue'));
            printGroup.addEntry(this.createInput('print_header', 'Header'));
            printGroup.addEntry(this.createInput('print_footer', 'Footer'));
            printGroup.addEntry(this.createInput('print_watermark', 'Watermark'));
            return printGroup;
        },

        getLayoutGroup: function() {
            var layoutGroup = SettingsGroup.create('Layout');
            layoutGroup.addEntry(this.createCheckbox('split_dialogue', 'Split dialogue between pages'));
            layoutGroup.addEntry(this.createCheckbox('use_dual_dialogue', 'Accept dual dialogue'));
            layoutGroup.addEntry(this.createCheckbox('double_space_between_scenes', 'Double space between scenes'));
            layoutGroup.addEntry(this.createCheckbox('each_scene_on_new_page', 'Page break after a scene'));
            layoutGroup.addEntry(this.createCheckbox('number_sections', 'Prefix sections with numbers'));
            layoutGroup.addEntry(this.createCheckbox('embolden_scene_headers', 'Embolden scene headers'));
            layoutGroup.addEntry(this.createCheckbox('underline_scene_headers', 'Underline scene headers'));
            layoutGroup.addEntry(this.createDropdown('scenes_numbers', 'Scene numbers', [
                {label: 'none', value: 'none'},
                {label: 'left', value: 'left'},
                {label: 'right', value: 'right'},
                {label: 'both', value: 'both'}
            ]));
            layoutGroup.addEntry(this.createCheckbox('scene_continuation_bottom', 'Scene continuation (the bottom of a page)'));
            layoutGroup.addEntry(this.createCheckbox('scene_continuation_top', 'Scene continuation (the top of the next page)'));
            layoutGroup.addEntry(this.createCheckbox('merge_empty_lines', 'Merge empty lines'));
            return layoutGroup;
        },

        getTextGroup: function() {
            var textGroup = SettingsGroup.create('Text');
            textGroup.addEntry(this.createInput('text_more', 'Override (MORE) text to'));
            textGroup.addEntry(this.createInput('text_contd', "Override (CONT'D) text to"));
            textGroup.addEntry(this.createInput('text_scene_continued', 'Override CONTINUED (scene continuation) text to'));
            return textGroup;
        },

        getMiscellaneousGroup: function() {
            var miscellaneousGroup = SettingsGroup.create('Miscellaneous');
            miscellaneousGroup.addEntry(this.createCheckbox('show_background_image','Show background image'));
            miscellaneousGroup.addEntry(this.createCheckbox('load_last_opened','Load last opened on startup'));
            miscellaneousGroup.addEntry(this.createCheckbox('night_mode','Night mode'));
            return miscellaneousGroup;
        },

        getStatsGroup: function() {
            var statsGroup = SettingsGroup.create('Statistics');
            statsGroup.addEntry(this.createCheckbox('stats_keep_last_scene_time', 'Keep last scene slugline time of day if not specified'));
            statsGroup.addEntry(this.createInput('stats_who_with_who_max', '"Who with whom" max characters'));
            return statsGroup;
        },

        getExperimentalGroup: function() {
            var experimentalGroup = SettingsGroup.create('Experimental');
            experimentalGroup.addEntry(this.createCheckbox('cloud_lazy_loading', 'GoogleDrive/Dropbox lazy loading'));
            experimentalGroup.addEntry(this.createCheckbox('pdfjs_viewer', 'JavaScript PDF viewer'));
            return experimentalGroup;
        },

        createDropdown: function(key, label, options) {
            var dropdown = Dropdown.create();
            dropdown.options = options;
            return SettingsEntry.create(key, label, dropdown);
        },

        createCheckbox: function(key, label) {
            var checkbox = Checkbox.create();
            checkbox.id = key;
            return SettingsEntry.create(key, label, checkbox);
        },

        createInput: function(key, label) {
            var input = Input.create();
            return SettingsEntry.create(key, label, input);
        }

    });

    return SettingsConfigProvider;
});