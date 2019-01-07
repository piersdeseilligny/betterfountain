define(function(require) {

    var saveAs = require('saveAs'),
        forms = require('utils/forms'),
        pdfmaker = require('utils/pdfmaker'),
        IoModel = require('plugin/io/model/io-model'),
        MobileScriptSettings = require('plugin/io/model/mobile-script-settings'),
        MobileScriptModel = require('plugin/io/model/mobile-script-model'),
        Protoplast = require('protoplast');

    /**
     * Controller responsible for saving mobile-friendly version of PDF output
     */
    var SaveMobileController = Protoplast.Object.extend({

        ioModel: {
            inject: IoModel
        },

        mobileScriptSettings: {
            inject: MobileScriptSettings
        },

        mobileScriptModel: {
            inject: MobileScriptModel
        },

        saveMobilePdfLocally: function() {

            forms.text('Select file name:', this.ioModel.pdfFileName || 'screenplay.pdf', function(result) {
                pdfmaker.get_pdf({
                    callback: function(pdf) {
                        saveAs(pdf.blob, result.text);
                    },
                    print: this.mobileScriptSettings.print,
                    config: {
                        print_title_page: true,
                        print_header: false,
                        print_footer: false,
                        print_watermark: false,
                        scene_continuation_top: false,
                        scene_continuation_bottom: false,
                        text_scene_continued: '',
                        show_page_numbers: false,
                        embolden_scene_headers: true,
                        underline_scene_headers: true,
                        number_sections: false,
                        scenes_numbers: false
                    },
                    parsed: this.mobileScriptModel.parsed
                });
            }.bind(this));
        }

    });

    return SaveMobileController;
});