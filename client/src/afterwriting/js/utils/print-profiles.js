define(function(require) {

    var browser = require('utils/browser'),
        PrintProfileUtil = require('utils/print-profile-util');

    var A4_DEFAULT_MAX = 58,
        US_DEFAULT_MAX = 61;

    var print_profiles = {
        "a4": {
            paper_size: "a4",
            font_size: 12,
            lines_per_page: 57,
            top_margin: 1.0,
            page_width: 8.27,
            page_height: 11.7,
            left_margin: 1.5,
            right_margin: 1,
            font_width: 0.1,
            font_height: 0.1667,
            line_spacing: 1,
            page_number_top_margin: 0.5,
            dual_max_factor: 0.75,
            title_page: {
                top_start: 3.5,
                left_side: ['notes', 'copyright'],
                right_side: ['draft date', 'date', 'contact']
            },
            scene_heading: {
                feed: 1.5,
                max: A4_DEFAULT_MAX
            },
            action: {
                feed: 1.5,
                max: A4_DEFAULT_MAX
            },
            shot: {
                feed: 1.5,
                max: A4_DEFAULT_MAX
            },
            character: {
                feed: 3.5,
                max: 33
            },
            parenthetical: {
                feed: 3,
                max: 26
            },
            dialogue: {
                feed: 2.5,
                max: 36
            },
            transition: {
                feed: 0.0,
                max: A4_DEFAULT_MAX
            },
            centered: {
                feed: 1.5,
                style: 'center',
                max: A4_DEFAULT_MAX
            },
            synopsis: {
                feed: 0.5,
                max: A4_DEFAULT_MAX,
                italic: true,
                color: '#888888',
                padding: 0,
                feed_with_last_section: true
            },
            section: {
                feed: 0.5,
                max: A4_DEFAULT_MAX,
                color: '#555555',
                level_indent: 0.2
            },
            note: {
                color: '#888888',
                italic: true
            }
        }
    };

    print_profiles.usletter = JSON.parse(JSON.stringify(print_profiles.a4));
    var letter = print_profiles.usletter;
    letter.paper_size = 'letter';
    letter.lines_per_page = 55;
    letter.page_width = 8.5;
    letter.page_height = 11;

    letter.scene_heading.max = US_DEFAULT_MAX;
    letter.action.max = US_DEFAULT_MAX;
    letter.shot.max = US_DEFAULT_MAX;
    letter.transition.max = US_DEFAULT_MAX;
    letter.section.max = US_DEFAULT_MAX;
    letter.synopsis.max = US_DEFAULT_MAX;

    // font size = experimental feature
    var url_params = browser.url_params();
    if (url_params.fontSize) {
        var fontSize = parseInt(url_params.fontSize, 10);
        print_profiles.usletter = PrintProfileUtil.withNewFontSize(print_profiles.usletter, fontSize);
        print_profiles.a4 = PrintProfileUtil.withNewFontSize(print_profiles.a4, fontSize);
    }

    return print_profiles;
});