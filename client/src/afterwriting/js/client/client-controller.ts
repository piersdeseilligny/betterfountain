var Protoplast = require('protoplast');
var fs = require('fs');
var stdio = require('stdio');

export class Options{
    source:string;
    pdf:string;
    overwrite:boolean;
}
export class Config{
        embolden_scene_headers:boolean;
        show_page_numbers:boolean;
        split_dialogue:boolean;
        print_title_page:boolean;
        print_profile:string;
        double_space_between_scenes:boolean;
        print_sections:boolean;
        print_synopsis:boolean;
        print_actions:boolean;
        print_headers:boolean;
        print_dialogues:boolean;
        number_sections:boolean;
        use_dual_dialogue:boolean;
        print_notes:boolean;
        print_header:string;
        print_footer:string;
        print_watermark:string;
        scenes_numbers:string;
        each_scene_on_new_page:boolean;
    }

var options = new Options();

var ClientController = Protoplast.Object.extend({

    scriptModel: {
        inject: 'script'
    },

    settings: {
        inject: 'settings'
    },

    pdfController: {
        inject: 'pdf'
    },

    render: function(options:Options, config:Config) {
        console.info('Loading script:', options.source);
        fs.readFile(options.source, 'utf8', function (err:any, text:string) {
            if (err) {
                console.error('Cannot open script file', options.source);
            } else {
                this.settings = config;
                this.scriptModel.script = text;

                if (options.pdf) {
                    this._validatePdf(function () {
                        console.log('Generating PDF', options.pdf);
                            this.pdfController.getPdf(function () {
                                console.log('Done!');
                                process.exit(0);
                            }, this.options.ops.pdf, false);
                    }.bind(this));
                }
            }
        });
    },
    _fileExists: function(path:string) {
        try {
            fs.statSync(path);
            return true;
        } catch (e) {
            return false;
        }
    },

    _validatePdf: function(callback:any) {
        if (this._fileExists(this.options.ops.pdf) && !this.options.ops.overwrite) {
            stdio.question('File ' + this.options.ops.pdf + ' already exists. Do you want to overwrite it?', ['y','n'], function(err:any, decision:any){
                if (decision === 'y') {
                    callback();
                }
            });
        }
        else {
            callback();
        }
    }
});

export default ClientController;