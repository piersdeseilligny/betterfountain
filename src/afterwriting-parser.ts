import { calculateDialogueDuration, trimCharacterExtension, last, trimCharacterForceSymbol, parseLocationInformation, slugify } from "./utils";
import { token, create_token } from "./token";
import { Range, Position } from "vscode";
import { getFountainConfig } from "./configloader";
import * as vscode from 'vscode';
import { AddDialogueNumberDecoration } from "./providers/Decorations";
import helpers from "./helpers";

declare global {
    interface Array<T> {
        pushSorted(el:any, compareFn:Function):number
    }
}
Array.prototype.pushSorted = function(el, compareFn) {
    this.splice((function(arr) {
      var m = 0;
      var n = arr.length - 1;
  
      while(m <= n) {
        var k = (n + m) >> 1;
        var cmp = compareFn(el, arr[k]);
  
        if(cmp > 0) m = k + 1;
          else if(cmp < 0) n = k - 1;
          else return k;
      }
  
      return -m - 1;
    })(this), 0, el);
  
    return this.length;
  };

//Unicode uppercase letters:
export const regex: { [index: string]: RegExp } = {
    title_page: /(title|credit|author[s]?|source|notes|draft date|date|watermark|contact( info)?|revision|copyright|font|tl|tc|tr|cc|br|bl|header|footer)\:.*/i,

    section: /^[ \t]*(#+)(?: *)(.*)/,
    synopsis: /^[ \t]*(?:\=(?!\=+) *)(.*)/,

    scene_heading: /^[ \t]*([.](?![.])|(?:[*]{0,3}_?)(?:int|ext|est|int[.]?\/ext|i[.]?\/e)[. ])(.+?)(#[-.0-9a-z]+#)?$/i,
    scene_number: /#(.+)#/,

    transition: /^[ \t]*((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO\:|^TO\:$)|^(?:> *)(.+)/,

    dialogue: /^[ \t]*([*_]+[^\p{Ll}\p{Lo}\p{So}\r\n]*)(\^?)?(?:\n(?!\n+))([\s\S]+)/u,

    character: /^[ \t]*(?![#!]|(\[\[)|(SUPERIMPOSE:))(((?!@)[^\p{Ll}\r\n]*?\p{Lu}[^\p{Ll}\r\n]*?)|((@)[^\r\n]*?))(\(.*\))?(\s*\^)?$/u,
    parenthetical: /^[ \t]*(\(.+\))$/,

    action: /^(.+)/g,
    centered: /^[ \t]*(?:> *)(.+)(?: *<)(\n.+)*/g,

    page_break: /^\={3,}$/,
    line_break: /^ {2}$/,

    note_inline: /(?:\[{2}(?!\[+))([\s\S]+?)(?:\]{2}(?!\[+))/g,

    emphasis: /(_|\*{1,3}|_\*{1,3}|\*{1,3}_)(.+)(_|\*{1,3}|_\*{1,3}|\*{1,3}_)/g,
    bold_italic_underline: /(_{1}\*{3}(?=.+\*{3}_{1})|\*{3}_{1}(?=.+_{1}\*{3}))(.+?)(\*{3}_{1}|_{1}\*{3})/g,
    bold_underline: /(_{1}\*{2}(?=.+\*{2}_{1})|\*{2}_{1}(?=.+_{1}\*{2}))(.+?)(\*{2}_{1}|_{1}\*{2})/g,
    italic_underline: /(?:_{1}\*{1}(?=.+\*{1}_{1})|\*{1}_{1}(?=.+_{1}\*{1}))(.+?)(\*{1}_{1}|_{1}\*{1})/g,
    bold_italic: /(\*{3}(?=.+\*{3}))(.+?)(\*{3})/g,
    bold: /(\*{2}(?=.+\*{2}))(.+?)(\*{2})/g,
    italic: /(\*{1}(?=.+\*{1}))(.+?)(\*{1})/g,
    link: /(\[?(\[)([^\]\[]*\[?[^\]\[]*\]?[^\]\[]*)(\])(\()(.+?)(?:\s+(["'])(.*?)\4)?(\)))/g,
   // image: /(!\[?(\[)([^\]\[]*\[?[^\]\[]*[^\]\[]*)(\])(\()(.+?)(?:\s+(["'])(.*?)\4)?(\)))/g,
    lyric: /^(\~.+)/g,
    underline: /(_{1}(?=.+_{1}))(.+?)(_{1})/g,
};
export interface titleKeywordFormat{
    position:'cc'|'br'|'bl'|'tr'|'tc'|'tl'|'cc'|'hidden',
    index:number
}

export const titlePageDisplay: {[index:string]:titleKeywordFormat} = {
    title:{position:'cc', index:0},
    credit:{position:'cc', index:1},
    author:{position:'cc', index:2},
    authors:{position:'cc', index:3},
    source:{position:'cc', index:4},

    watermark:{position:'hidden', index:-1},
    font:{position:'hidden', index:-1},
    header:{position:'hidden', index:-1},
    footer:{position:'hidden', index:-1},

    notes:{position:'bl', index:0},
    copyright:{position:'bl', index:1},

    revision:{position:'br', index:0},
    date:{position:'br', index:1},
    draft_date:{position:'br', index:2},
    contact:{position:'br', index:3},
    contact_info:{position:'br', index:4},


    br:{position:'br', index:-1},
    bl:{position:'bl', index:-1},
    tr:{position:'tr', index:-1},
    tc:{position:'tc', index:-1},
    tl:{position:'tl', index:-1},
    cc:{position:'cc', index:-1}
}

interface LexerReplacements{
    [key:string]:string,
    //image: string,
    link:string,
    note:string,
    line_break:string,
    bold_italic_underline:string,
    bold_underline:string,
    italic_underline:string,
    bold_italic:string,
    bold:string,
    italic:string,
    underline:string
}

var htmlreplacements:LexerReplacements = {
    //image: '<img alt="$3" title="$3" src="$6">',
    link: '<a href=\"$6\">$3</a>',
    note: '<span class=\"note\">$1</span>',

    line_break: '<br />',

    bold_italic_underline: '<span class=\"bold italic underline\">$2</span>',
    bold_underline: '<span class=\"bold underline\">$2</span>',
    italic_underline: '<span class=\"italic underline\">$2</span>',
    bold_italic: '<span class=\"bold italic\">$2</span>',
    bold: '<span class=\"bold\">$2</span>',
    italic: '<span class=\"italic\">$2</span>',
    underline: '<span class=\"underline\">$2</span>',
};
export function lexer(s: string, type: string, replacer:LexerReplacements, titlepage:boolean = false) {
    if (!s) {
        return s;
    }

    var styles = ['underline', 'italic', 'bold', 'bold_italic', 'italic_underline', 'bold_underline', 'bold_italic_underline']
        , i = styles.length, style, match;

    if(titlepage){
        s = s.replace(regex.link, replacer.link);
    }
    s = s.replace(regex.note_inline, replacer.note).replace(/\\\*/g, '[star]').replace(/\\_/g, '[underline]').replace(/\n/g, replacer.line_break);

    // if (regex.emphasis.test(s)) {                         // this was causing only every other occurence of an emphasis syntax to be parsed
    while (i--) {
        style = styles[i];
        match = regex[style];

        if (match.test(s)) {
            s = s.replace(match, replacer[style]);
        }
    }
    // }
    s = s.replace(/\[star\]/g, '*').replace(/\[underline\]/g, '_');
    if (type != "action")
        s = s.trim();
    return s;
}
export class Location {
    scene_number: number;
    name: string;
    interior: boolean;
    exterior: boolean;
    time_of_day: string;
}
export class StructToken {
    text: string;
    isnote: boolean;
    id: any;
    children: any; //Children of the section
    range: Range; //Range of the scene/section header
    level: number;
    section: boolean; // true->section, false->scene
    synopses: { synopsis: string; line: number }[];
    notes: { note: string; line: number }[];
}
export class screenplayProperties {
    scenes: { scene: string; text:string, line: number, actionLength: number, dialogueLength: number }[];
    sceneLines: number[];
    sceneNames: string[];
    titleKeys: string[];
    firstTokenLine: number;
    fontLine: number;
    lengthAction: number; //Length of the action character count
    lengthDialogue: number; //Length of the dialogue character count
    characters: Map<string, number[]>;
    locations: Map<string, Location[]>;
    structure: StructToken[];
}
export interface parseoutput {
    scriptHtml: string,
    titleHtml: string,
    title_page: {[index:string]:token[]},
    tokens: token[],
    tokenLines: { [line: number]: number }
    lengthAction: number,
    lengthDialogue: number,
    parseTime: number,
    properties: screenplayProperties
}
export var parse = function (original_script: string, cfg: any, generate_html: boolean): parseoutput {
    var lastFountainEditor: vscode.Uri;
    var config = getFountainConfig(lastFountainEditor);
    var script = original_script,
        result: parseoutput = {
            title_page: {
                tl:[],
                tc:[],
                tr:[],
                cc:[],
                bl:[],
                br:[],
                hidden:[]
            },
            tokens: [],
            scriptHtml: "",
            titleHtml: "",
            lengthAction: 0,
            lengthDialogue: 0,
            tokenLines: {},
            parseTime: +new Date(),
            properties:
            {
                sceneLines: [],
                scenes: [],
                sceneNames: [],
                titleKeys: [],
                firstTokenLine: Infinity,
                fontLine: -1,
                lengthAction: 0,
                lengthDialogue: 0,
                characters: new Map<string, number[]>(),
                locations: new Map<string, Location[]>(),
                structure: []
            }
        };
    if (!script) {
        return result;
    }

    var new_line_length = script.match(/\r\n/) ? 2 : 1;



    var lines = script.split(/\r\n|\r|\n/);
    var pushToken = function (token: token) {
        result.tokens.push(token);
        if (thistoken.line)
            result.tokenLines[thistoken.line] = result.tokens.length - 1;
    }

    var lines_length = lines.length,
        current = 0,
        scene_number = 1,
        current_depth = 0,
        match, text, last_title_page_token,
        thistoken: token,
        last_was_separator = false,
        //top_or_separated = false,
        token_category = "none",
        last_character_index,
        dual_right,
        state = "normal",
        previousCharacter,
        cache_state_for_comment,
        nested_comments = 0,
        title_page_started = false


    var reduce_comment = function (prev: any, current: any) {
        if (current === "/*") {
            nested_comments++;
        } else if (current === "*/") {
            nested_comments--;
        } else if (!nested_comments) {
            prev = prev + current;
        }
        return prev;
    };

    var if_not_empty = function (a: any) {
        return a;
    };

    var lengthActionSoFar = 0; //total action length until the previous scene header
    var lengthDialogueSoFar = 0; //total dialogue length until the previous scene header

    var takeCount = 1; //total number of takes

    function updatePreviousSceneLength() {
        var action = result.lengthAction - lengthActionSoFar;
        var dialogue = result.lengthDialogue - lengthDialogueSoFar;
        lengthActionSoFar = result.lengthAction;
        lengthDialogueSoFar = result.lengthDialogue;

        if (result.properties.scenes.length > 0) {
            result.properties.scenes[result.properties.scenes.length - 1].actionLength = action;
            result.properties.scenes[result.properties.scenes.length - 1].dialogueLength = dialogue;
        }
    }

    const latestSectionOrScene = (depth: number, condition: (token: StructToken) => boolean): StructToken => {
        try {
            if (depth <= 0) {
                return null;
            }
            else if (depth == 1) {
                var lastItem:StructToken = last(result.properties.structure.filter(condition));
                return lastItem;
            }
            else {
                var prevSection = latestSectionOrScene(depth - 1, condition)
                if (prevSection.children != null) {
                    var lastChild = last(prevSection.children.filter(condition))
                    if (lastChild) return lastChild
                }
                // nest ###xyz inside #abc if there's no ##ijk to nest within
                return prevSection;
            }
        }
        catch {
            var section: StructToken = null;
            while (!section && depth > 0) section = latestSectionOrScene(--depth, condition);
            return section;
        }
    }

    const processInlineNote = (text: string, linenumber:number): number => {
        let irrelevantTextLength = 0;
        if (match = text.match(new RegExp(regex.note_inline))) {
            var level = latestSectionOrScene(current_depth + 1, () => true);
            if (level) {
                level.notes = level.notes || []
                for (let i = 0; i < match.length; i++) {
                    match[i] = match[i].slice(2, match[i].length - 2);
                    level.notes.push({ note: match[i], line: thistoken.line });
                    irrelevantTextLength += match[i].length+4;
                }
            }
            else{
                for(let i = 0; i < match.length; i++){
                    match[i] = match[i].slice(2, match[i].length - 2);
                    result.properties.structure.push({text: match[i], id:'/' + linenumber, isnote:true, children:[],level:0,notes:[],range:new Range(new Position(linenumber, 0), new Position(linenumber, match[i].length+4)), section:false,synopses:[] })
                    irrelevantTextLength += match[i].length+4;
                }
            }
        }
        return irrelevantTextLength;
    }
    const processDialogueBlock = (token:token) => {
        let textWithoutNotes = token.text.replace(regex.note_inline, "");
        processInlineNote(token.text, token.line);
        token.time = calculateDialogueDuration(textWithoutNotes);
        if (!cfg.print_notes) {
            token.text = textWithoutNotes;
            if(token.text.trim().length == 0) token.ignore = true;
        }
        result.lengthDialogue += token.time;
    }
    const processActionBlock = (token:token) => {
        let irrelevantActionLength = processInlineNote(token.text, token.line);
        token.time = (token.text.length - irrelevantActionLength) / 20;
        if (!cfg.print_notes) {
            token.text = token.text.replace(regex.note_inline, "");
            if(token.text.trim().length == 0) token.ignore = true;
        }
        result.lengthAction += token.time;
    }

    let ignoredLastToken = false;
    for (var i = 0; i < lines_length; i++) {
        text = lines[i];

        // replace inline comments
        text = text.split(/(\/\*){1}|(\*\/){1}|([^\/\*]+)/g).filter(if_not_empty).reduce(reduce_comment, "");

        if (nested_comments && state !== "ignore") {
            cache_state_for_comment = state;
            state = "ignore";
        } else if (state === "ignore") {
            state = cache_state_for_comment;
        }

        if (nested_comments === 0 && state === "ignore") {
            state = cache_state_for_comment;
        }


        thistoken = create_token(text, current, i, new_line_length);
        current = thistoken.end + 1;

        
        if (text.trim().length === 0 && text !== "  ") {
            var skip_separator = (cfg.merge_multiple_empty_lines && last_was_separator) || (ignoredLastToken && result.tokens.length>1 && result.tokens[result.tokens.length-1].type == "separator");

            if(ignoredLastToken) ignoredLastToken=false;

            if (state == "dialogue")
                pushToken(create_token(undefined, undefined, undefined, undefined, "dialogue_end"));
            if (state == "dual_dialogue")
                pushToken(create_token(undefined, undefined, undefined, undefined, "dual_dialogue_end"));
            state = "normal";


            if (skip_separator || state === "title_page") {
                continue;
            }

            dual_right = false;
            thistoken.type = "separator";
            last_was_separator = true;
            pushToken(thistoken);
            continue;
        }

        //top_or_separated = last_was_separator || i === 0;
        token_category = "script";

        if (!title_page_started && regex.title_page.test(thistoken.text)) {
            state = "title_page";
        }

        if (state === "title_page") {
            if (regex.title_page.test(thistoken.text)) {
                var index = thistoken.text.indexOf(":");
                thistoken.type = thistoken.text.substr(0, index).toLowerCase().replace(" ", "_");
                thistoken.text = thistoken.text.substr(index + 1).trim();
                last_title_page_token = thistoken;
                let keyformat = titlePageDisplay[thistoken.type];
                if(keyformat){
                    thistoken.index = keyformat.index;
                    result.title_page[keyformat.position].push(thistoken);
                }
                title_page_started = true;
                continue;
            } else if (title_page_started) {
                last_title_page_token.text += (last_title_page_token.text ? "\n" : "") + thistoken.text.trim();
                continue;
            }
        }

        const latestSection = (depth: number): StructToken => latestSectionOrScene(depth, token => token.section)


        
        if (state === "normal") {
            if (thistoken.text.match(regex.line_break)) {
                token_category = "none";
            } else if (result.properties.firstTokenLine == Infinity) {
                result.properties.firstTokenLine = thistoken.line;
            }
            let sceneHeadingMatch = thistoken.text.match(regex.scene_heading);
            if (sceneHeadingMatch) {
                thistoken.text = thistoken.text.replace(/^\./, "");
                if (cfg.each_scene_on_new_page && scene_number !== 1) {
                    var page_break = create_token();
                    page_break.type = "page_break";
                    page_break.start = thistoken.start;
                    page_break.end = thistoken.end;
                    pushToken(page_break);
                }
                thistoken.type = "scene_heading";
                thistoken.number = scene_number.toString();
                if (match = thistoken.text.match(regex.scene_number)) {
                    thistoken.text = thistoken.text.replace(regex.scene_number, "");
                    thistoken.number = match[1];
                }
                let cobj: StructToken = new StructToken();
                cobj.text = thistoken.text;
                cobj.children = null;
                cobj.range = new Range(new Position(thistoken.line, 0), new Position(thistoken.line, thistoken.text.length));



                if (current_depth == 0) {
                    cobj.id = '/' + thistoken.line;
                    result.properties.structure.push(cobj);
                }
                else {
                    var level = latestSection(current_depth);
                    if(level){
                        cobj.id = level.id + '/' + thistoken.line;
                        level.children.push(cobj);
                    }
                    else{
                        cobj.id = '/' + thistoken.line;
                        result.properties.structure.push(cobj);
                    }
                }

                updatePreviousSceneLength();
                result.properties.scenes.push({ scene: thistoken.number, text:thistoken.text, line: thistoken.line, actionLength: 0, dialogueLength: 0 })
                result.properties.sceneLines.push(thistoken.line);
                result.properties.sceneNames.push(thistoken.text);

                const location = parseLocationInformation(sceneHeadingMatch);
                if (location) {
                    const locationSlug = slugify(location.name);
                    if (result.properties.locations.has(locationSlug)) {
                        const values = result.properties.locations.get(locationSlug);
                        if (values.findIndex(it => it.scene_number == scene_number) == -1) {
                            values.push({
                                scene_number: scene_number,
                                ...location
                            });
                        }
                        result.properties.locations.set(locationSlug, values);
                    }
                    else {
                        result.properties.locations.set(locationSlug, [{scene_number,...location}]);
                    }
                }
                scene_number++;
                
            } else if (thistoken.text.length && thistoken.text[0] === "!") {
                thistoken.type = "action";
                thistoken.text = thistoken.text.substr(1);
                processActionBlock(thistoken);
            } else if (thistoken.text.match(regex.centered)) {
                thistoken.type = "centered";
                thistoken.text = thistoken.text.replace(/>|</g, "").trim();
            } else if (thistoken.text.match(regex.transition)) {
                thistoken.text = thistoken.text.replace(/> ?/, "");
                thistoken.type = "transition";
            } else if (match = thistoken.text.match(regex.synopsis)) {
                thistoken.text = match[1];
                thistoken.type = thistoken.text ? "synopsis" : "separator";

                var level = latestSectionOrScene(current_depth + 1, () => true);
                if (level) {
                    level.synopses = level.synopses || []
                    level.synopses.push({ synopsis: thistoken.text, line: thistoken.line })
                }
            } else if (match = thistoken.text.match(regex.section)) {
                thistoken.level = match[1].length;
                thistoken.text = match[2];
                thistoken.type = "section";
                let cobj: StructToken = new StructToken();
                cobj.text = thistoken.text;
                current_depth = thistoken.level;
                cobj.level = thistoken.level;
                cobj.children = [];
                cobj.range = new Range(new Position(thistoken.line, 0), new Position(thistoken.line, thistoken.text.length));
                cobj.section = true;

                const level = current_depth > 1 && latestSectionOrScene(current_depth, token => token.section && token.level < current_depth)
                if (current_depth == 1 || !level) {
                    cobj.id = '/' + thistoken.line;
                    result.properties.structure.push(cobj)
                }
                else {
                    cobj.id = level.id + '/' + thistoken.line;
                    level.children.push(cobj);
                }
            } else if (thistoken.text.match(regex.page_break)) {
                thistoken.text = "";
                thistoken.type = "page_break";
            } else if (thistoken.text.match(regex.character) && i != lines_length && i != lines_length - 1 && ((lines[i + 1].trim().length == 0) ? (lines[i + 1] == "  ") : true)) {
                // The last part of the above statement ('(lines[i + 1].trim().length == 0) ? (lines[i+1] == "  ") : false)')
                // means that if the trimmed length of the following line (i+1) is equal to zero, the statement will only return 'true',
                // and therefore consider the token as a character, if the content of the line is exactly two spaces.
                // If the trimmed length is larger than zero, then it will be accepted as dialogue regardless
                state = "dialogue";
                thistoken.type = "character";
                thistoken.takeNumber = takeCount++;
                if (config.print_dialogue_numbers) AddDialogueNumberDecoration(thistoken)
                thistoken.text = trimCharacterForceSymbol(thistoken.text);
                if (thistoken.text[thistoken.text.length - 1] === "^") {
                    if (cfg.use_dual_dialogue) {
                        state = "dual_dialogue"
                        // update last dialogue to be dual:left
                        var dialogue_tokens = ["dialogue", "character", "parenthetical"];
                        while (dialogue_tokens.indexOf(result.tokens[last_character_index].type) !== -1) {
                            result.tokens[last_character_index].dual = "left";
                            last_character_index++;
                        }
                        //update last dialogue_begin to be dual_dialogue_begin and remove last dialogue_end
                        var foundmatch = false;
                        var temp_index = result.tokens.length;
                        temp_index = temp_index - 1;
                        while (!foundmatch) {
                            temp_index--;
                            switch (result.tokens[temp_index].type) {
                                case "dialogue_end":
                                    result.tokens.splice(temp_index);
                                    temp_index--;
                                    break;
                                case "separator": break;
                                case "character": break;
                                case "dialogue": break;
                                case "parenthetical": break;
                                case "dialogue_begin":
                                    result.tokens[temp_index].type = "dual_dialogue_begin";
                                    foundmatch = true;
                                    break;
                                default: foundmatch = true;
                            }
                        }
                        dual_right = true;
                        thistoken.dual = "right";
                    }
                    else{
                        pushToken(create_token(undefined, undefined, undefined, undefined, "dialogue_begin"));
                    }
                    thistoken.text = thistoken.text.replace(/\^$/, "");
                }
                else {
                    pushToken(create_token(undefined, undefined, undefined, undefined, "dialogue_begin"));
                }
                let character = trimCharacterExtension(thistoken.text).trim();
                previousCharacter = character;
                if (result.properties.characters.has(character)) {
                    var values = result.properties.characters.get(character);
                    if (values.indexOf(scene_number) == -1) {
                        values.push(scene_number);
                    }
                    result.properties.characters.set(character, values);
                }
                else {
                    result.properties.characters.set(character, [scene_number]);
                }
                last_character_index = result.tokens.length;
            }
            else {
                thistoken.type = "action";
                processActionBlock(thistoken);
            }
        } else {
            if (thistoken.text.match(regex.parenthetical)) {
                thistoken.type = "parenthetical";
            } else {
                thistoken.type = "dialogue";
                processDialogueBlock(thistoken);
                thistoken.character = previousCharacter;
            }
            if (dual_right) {
                thistoken.dual = "right";
            }
        }

        if (thistoken.type != "action" && !(thistoken.type == "dialogue" && thistoken.text == "  ")) {
            thistoken.text = thistoken.text.trim();
        }

        last_was_separator = false;

        if (token_category === "script" && state !== "ignore") {
            if (thistoken.is("scene_heading", "transition")) {
                thistoken.text = thistoken.text.toUpperCase();
                title_page_started = true; // ignore title tags after first heading
            }
            if (thistoken.text && thistoken.text[0] === "~") {
                thistoken.text = "*" + thistoken.text.substr(1) + "*";
            }
            if (thistoken.type != "action" && thistoken.type != "dialogue")
                thistoken.text = thistoken.text.trim();

            if(thistoken.ignore){
                ignoredLastToken = true;
            }
            else{
                ignoredLastToken = false;
                pushToken(thistoken);
            }   
        }

    }

    if (state == "dialogue") {
        pushToken(create_token(undefined, undefined, undefined, undefined, "dialogue_end"));
    }

    if (state == "dual_dialogue") {
        pushToken(create_token(undefined, undefined, undefined, undefined, "dual_dialogue_end"));
    }

    
    // tidy up separators

    if(!title_page_started){
        result.title_page = undefined;
    }

    if (generate_html) {
        var html = [];
        var titlehtml = [];
        var header = undefined;
        var footer = undefined;
        //Generate html for title page
        if(result.title_page){
            for (const section of Object.keys(result.title_page)) {
                result.title_page[section].sort(helpers.sort_index);
                titlehtml.push(`<div class="titlepagesection" data-position="${section}">`);
                let current_index = 0/*, previous_type = null*/;
                while (current_index < result.title_page[section].length) {
                    var current_token: token = result.title_page[section][current_index];
                    if(current_token.ignore){
                        current_index++;
                        continue;
                    }
                    if (current_token.text != "") {
                        current_token.html = lexer(current_token.text, undefined, htmlreplacements, true);
                    }
                    switch (current_token.type) {
                        case 'title': titlehtml.push(`<h1 class="haseditorline titlepagetoken" id="sourceline_${current_token.line}">${current_token.html}</h1>`); break;
                        case 'header': header = current_token; break;
                        case 'footer': footer = current_token; break;
                        default: titlehtml.push(`<p class="${current_token.type} haseditorline titlepagetoken" id="sourceline_${current_token.line}">${current_token.html}</p>`); break;
                    }
                    current_index++;
                }
                titlehtml.push(`</div>`);
            }
        }
        if(header)
            html.push(`<div class="header" id="sourceline_${header.line}">${header.html}</div>`);
        else if(config.print_header)
            html.push(`<div class="header">${lexer(config.print_header, undefined, htmlreplacements, true)}</div>`);

        if(footer)
            html.push(`<div class="footer" id="sourceline_${footer.line}">${footer.html}</div>`);
        else if(config.print_footer)
            html.push(`<div class="footer">${lexer(config.print_footer, undefined, htmlreplacements, true)}</div>`);



        //Generate html for script
        let current_index = 0;
        var isaction = false;
        while (current_index < result.tokens.length) {
            var current_token: token = result.tokens[current_index];
            if (current_token.text != "") {
                current_token.html = lexer(current_token.text, current_token.type, htmlreplacements);
            } else {
                current_token.html = "";
            }

            if ((current_token.type == "action" || current_token.type == "centered") && !current_token.ignore) {
                let classes = "haseditorline";

                let elStart = "\n";
                if(!isaction) elStart = "<p>" //first action element
                if(current_token.type == "centered"){
                    if(isaction) elStart = ""; //It's centered anyway, no need to add anything
                    classes += " centered";
                }
                html.push(`${elStart}<span class="${classes}" id="sourceline_${current_token.line}">${current_token.html}</span>`);
                
                isaction = true;
            }
            else if (current_token.type == "separator" && isaction) {
                if (current_index + 1 < result.tokens.length - 1) {
                    //we're not at the end
                    var next_type = result.tokens[current_index + 1].type
                    if (next_type == "action" || next_type == "separator" || next_type == "centered") {
                        html.push("\n");
                    }
                }
                else if (isaction) {
                    //we're at the end
                    html.push("</p>")
                }
            }
            else {
                if (isaction) {
                    //no longer, close the paragraph
                    isaction = false;
                    html.push("</p>");
                }
                switch (current_token.type) {
                    case 'scene_heading':
                        var content = current_token.html;
                        if (cfg.embolden_scene_headers) {
                            content = '<span class=\"bold haseditorline\" id="sourceline_' + current_token.line + '">' + content + '</span>';
                        }

                        html.push('<h3 class="haseditorline" data-scenenumber=\"' + current_token.number + '\" data-position=\"' + current_token.line + '\" ' + (current_token.number ? ' id=\"sourceline_' + current_token.line + '">' : '>') + content + '</h3>');
                        break;
                    case 'transition': html.push('<h2 class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.text + '</h2>'); break;

                    case 'dual_dialogue_begin': html.push('<div class=\"dual-dialogue\">'); break;

                    case 'dialogue_begin': html.push('<div class=\"dialogue' + (current_token.dual ? ' ' + current_token.dual : '') + '\">'); break;

                    case 'character':
                        if (current_token.dual == "left") {
                            html.push('<div class=\"dialogue left\">');
                        } else if (current_token.dual == "right") {
                            html.push('</div><div class=\"dialogue right\">');
                        }

                        if (config.print_dialogue_numbers) {
                            html.push('<h4 class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.takeNumber + ' – ' + current_token.text + '</h4>');
                        } else {
                            html.push('<h4 class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.text + '</h4>');
                        }

                        break;
                    case 'parenthetical': html.push('<p class="haseditorline parenthetical\" id="sourceline_' + current_token.line + '" >' + current_token.html + '</p>'); break;
                    case 'dialogue':
                        if (current_token.text == "  ")
                            html.push('<br>');
                        else
                            html.push('<p class="haseditorline" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>');
                        break;
                    case 'dialogue_end': html.push('</div> '); break;
                    case 'dual_dialogue_end': html.push('</div></div> '); break;

                    case 'section': html.push('<p class="haseditorline section" id="sourceline_' + current_token.line + '" data-position=\"' + current_token.line + '\" data-depth=\"' + current_token.level + '\">' + current_token.text + '</p>'); break;
                    case 'synopsis': html.push('<p class="haseditorline synopsis" id="sourceline_' + current_token.line + '" >' + current_token.html + '</p>'); break;
                    case 'lyric': html.push('<p class="haseditorline lyric" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;

                    case 'note': html.push('<p class="haseditorline note" id="sourceline_' + current_token.line + '">' + current_token.html + '</p>'); break;
                    case 'boneyard_begin': html.push('<!-- '); break;
                    case 'boneyard_end': html.push(' -->'); break;

                    case 'page_break': html.push('<hr />'); break;
                    /* case 'separator':
                         html.push('<br />');
                         break;*/
                }
            }

            //This has to be dealt with later, the tokens HAVE to stay, to keep track of the structure
            /*
            if (
                (!cfg.print_actions && current_token.is("action", "transition", "centered", "shot")) ||
                (!cfg.print_notes && current_token.type === "note") ||
                (!cfg.print_headers && current_token.type === "scene_heading") ||
                (!cfg.print_sections && current_token.type === "section") ||
                (!cfg.print_synopsis && current_token.type === "synopsis") ||
                (!cfg.print_dialogues && current_token.is_dialogue()) ||
                (cfg.merge_multiple_empty_lines && current_token.is("separator") && previous_type === "separator")) {

                result.tokens.splice(current_index, 1);
                continue;
            }
            */

            //previous_type = current_token.type;
            current_index++;
        }
        result.scriptHtml = html.join('');
        if (titlehtml && titlehtml.length > 0)
            result.titleHtml = titlehtml.join('');
        else
            result.titleHtml = undefined;
    }
    // clean separators at the end
    while (result.tokens.length > 0 && result.tokens[result.tokens.length - 1].type === "separator") {
        result.tokens.pop();
    }
    return result;
};
