import * as pdfmaker from "./pdfmaker";
import * as print from "./print";
import { FountainConfig } from "../configloader";
import * as helpers from "../helpers";
var fliner = require("aw-liner");

export var GeneratePdf = function(outputpath:string, config:FountainConfig, parsedDocument:any, callback:any){
    var liner = new fliner.Liner(helpers.default);
    var filteredtokens:any[] = [];
    var previous_type = "";
    for (let index = 0; index < parsedDocument.tokens.length; index++) {
        var type = parsedDocument.tokens[index].type;
        if (type == "dual_dialogue_begin" || type == "dialogue_begin" || type == "dialogue_end" || type == "dual_dialogue_end" ||
            (!config.print_actions && parsedDocument.tokens[index].is("action", "transition", "centered", "shot")) ||
            (!config.print_notes && type === "note") ||
            (!config.print_headers && type === "scene_heading") ||
            (!config.print_sections && type === "section") ||
            (!config.print_synopsis && type === "synopsis") ||
            (!config.print_dialogues && parsedDocument.tokens[index].is_dialogue()) ||
            (!config.merge_empty_lines && parsedDocument.tokens[index].is("separator") && previous_type === "separator")) {
            continue;
        }
        else{
            previous_type = type;
            filteredtokens.push(parsedDocument.tokens[index]);
        }        
    }
    parsedDocument.tokens = filteredtokens;
    parsedDocument.lines = liner.line(parsedDocument.tokens, {
        print: print.print_profiles[config.print_profile],
        text_more: "(MORE)",
        text_contd: "(CONT'D)",
        split_dialogue: true
    });

    var pdf_options:pdfmaker.Options = {
        filepath: outputpath,
        parsed: parsedDocument,
        print:print.print_profiles[config.print_profile],
        callback:function(something:any){
            return something;
        },
        config:config
    }
    pdfmaker.get_pdf(pdf_options);
}
