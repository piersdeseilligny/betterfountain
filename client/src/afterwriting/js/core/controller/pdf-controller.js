define(function(require) {

    var Protoplast = require('protoplast'),
        fonts = require('utils/fonts'),
        fontUtils = require('utils/font-utils'),
        pdfmaker = require('utils/pdfmaker'),
        textstats = require('utils/textstats');

    var PdfController = Protoplast.Object.extend({

        settings: {
            inject: 'settings'
        },

        scriptModel: {
            inject: 'script'
        },

        fontFixEnabled: false,

        getPdf: function(callback, filePath, customFonts) {

            // LOAD IN CUSTOM FONT PROFILE(S)
            if (customFonts) {
                for (var fontName in customFonts) {
                    fonts[fontName] = {};
                    for (var fontType in customFonts[fontName]) {
                        fonts[fontName][fontType] = {
                            family: customFonts[fontName][fontType].family,
                            src: fontUtils.convertBase64ToBinary(customFonts[fontName][fontType].src)
                        };
                    }
                }
            }

            pdfmaker.get_pdf(
                {
                    callback: callback,
                    filepath: filePath,
                    print: this.settings.print,
                    config: {
                        fonts: fonts[this.settings.font_family] || null ,
                        print_title_page: this.settings.print_title_page,
                        print_header: this.settings.print_header,
                        print_footer: this.settings.print_footer,
                        print_watermark: this.settings.print_watermark,
                        scene_continuation_top: this.settings.scene_continuation_top,
                        scene_continuation_bottom: this.settings.scene_continuation_bottom,
                        text_scene_continued: this.settings.text_scene_continued,
                        show_page_numbers: this.settings.show_page_numbers,
                        embolden_scene_headers: this.settings.embolden_scene_headers,
                        underline_scene_headers: this.settings.underline_scene_headers,
                        number_sections: this.settings.number_sections,
                        scenes_numbers: this.settings.scenes_numbers
                    },
                    parsed: this.scriptModel.parsed,
                    hooks: {before_script: this._fontFix}
                });
        },

        _fontFix: function(doc) {
            if (this.fontFixEnabled) {
                var unicode_sample = textstats.get_characters(this.scriptModel.script);
                unicode_sample.forEach(function(character) {
                    doc.format_text(character, 0, 0, {color: '#eeeeee'});
                });
            }
        }

    });

    return PdfController;
});