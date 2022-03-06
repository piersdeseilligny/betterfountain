import * as pdfmaker from "./pdfmaker";
import * as print from "./print";
import { FountainConfig, ExportConfig } from "../configloader";
import * as helpers from "../helpers";
import * as fliner from "./liner";
import * as vscode from "vscode";

//Creates the PDF, or returns stats if output path is "$STATS$"
export var GeneratePdf = function (outputpath: string, config: FountainConfig, exportconfig : ExportConfig, parsedDocument: any, progress?: vscode.Progress<{ message?: string; increment?: number; }> ):any {

    if(progress) progress.report({message: "Converting to individual lines", increment: 25});
    var liner: any = new fliner.Liner(helpers.default, config.print_dialogue_numbers);
    var watermark = undefined;
    var header = undefined;
    var footer = undefined;
    var font = "Courier Prime";
    if(parsedDocument.title_page){
        for (let index = 0; index < parsedDocument.title_page['hidden'].length; index++) {
            if (parsedDocument.title_page['hidden'][index].type == "watermark")
                watermark = parsedDocument.title_page['hidden'][index].text;
            if (parsedDocument.title_page['hidden'][index].type == "header")
                header = parsedDocument.title_page['hidden'][index].text;
            if (parsedDocument.title_page['hidden'][index].type == "footer")
            footer = parsedDocument.title_page['hidden'][index].text;
            if (parsedDocument.title_page['hidden'][index].type == "font")
                font = parsedDocument.title_page['hidden'][index].text;
        }
    }
    var current_index = 0, previous_type: string = null;

    // tidy up separators
    let invisibleSections = [];
    while (current_index < parsedDocument.tokens.length) {
        var current_token = parsedDocument.tokens[current_index];

        if (current_token.type == "dual_dialogue_begin" || current_token.type == "dialogue_begin" || current_token.type == "dialogue_end" || current_token.type == "dual_dialogue_end" ||
            (!config.print_actions && current_token.is("action", "transition", "centered", "shot")) ||
            (!config.print_notes && current_token.type === "note") ||
            (!config.print_headers && current_token.type === "scene_heading") ||
            (!config.print_sections && current_token.type === "section") ||
            (!config.print_synopsis && current_token.type === "synopsis") ||
            (!config.print_dialogues && current_token.is_dialogue()) ||
            (config.merge_empty_lines && current_token.is("separator") && previous_type === "separator")) {
            
                if(current_token.type == "section"){
                    //on the next scene header, add an invisible section (for keeping track of sections when creating bookmarks and generating pdf-side)
                    invisibleSections.push(current_token);
                }
                parsedDocument.tokens.splice(current_index, 1);

                continue;
        }
        if(current_token.type == "scene_heading"){
            if(invisibleSections.length>0)
            current_token.invisibleSections = invisibleSections;
            invisibleSections = [];
        }

        if (config.double_space_between_scenes && current_token.is("scene_heading") && current_token.number !== 1) {
            var additional_separator = helpers.default.create_separator(parsedDocument.tokens[current_index].start, parsedDocument.tokens[current_index].end);
            parsedDocument.tokens.splice(current_index, 0, additional_separator);
            current_index++;
        }
        previous_type = current_token.type;
        current_index++;
    }

    // clean separators at the end
    while (parsedDocument.tokens.length > 0 && parsedDocument.tokens[parsedDocument.tokens.length - 1].type === "separator") {
        parsedDocument.tokens.pop();
    }

    if (!config.print_watermark && watermark != undefined)
        config.print_watermark = watermark;
    if (!config.print_header && header != undefined)
        config.print_header = header;
    if(!config.print_footer && footer != undefined)
        config.print_footer = footer;

    parsedDocument.lines = liner.line(parsedDocument.tokens, {
        print: print.print_profiles[config.print_profile],
        text_more: config.text_more,
        text_contd: config.text_contd,
        split_dialogue: true
    });

    var pdf_options: pdfmaker.Options = {
        filepath: outputpath,
        parsed: parsedDocument,
        print: print.print_profiles[config.print_profile],
        config: config,
        font: font,
        exportconfig:exportconfig
    }

    if(outputpath=="$STATS$") 
        return pdfmaker.get_pdf_stats(pdf_options);
    else
        pdfmaker.get_pdf(pdf_options, progress);
}
