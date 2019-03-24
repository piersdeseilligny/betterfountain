import * as helpers from "./helpers";
var regex: { [index: string]: RegExp } = {
    title_page: /(title|credit|author[s]?|source|notes|draft date|date|watermark|contact|copyright)\:.*/i,

    section: /^(#+)(?: *)(.*)/,
    synopsis: /^(?:\=(?!\=+) *)(.*)/,

    scene_heading: /^((?:\*{0,3}_?)?(?:(?:int|ext|est|int\/ext|i\.?\/e\.?)[. ]).+)|^(?:\.(?!\.+))(.+)/i,
    scene_number: /#(.+)#/,

    transition: /^((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO\:|^TO\:$)|^(?:> *)(.+)/,

    dialogue: /^([A-Z*_]+[0-9A-Z (._\-')]*)(\^?)?(?:\n(?!\n+))([\s\S]+)/,
    character: /^(([A-Z0-9 -\.]+(\([A-z0-9 '\-.()]+\))*|(@.*))(\s*\^)?$)/,
    parenthetical: /^(\(.+\))$/,

    action: /^(.+)/g,
    centered: /^(?:> *)(.+)(?: *<)(\n.+)*/g,

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
    lyric: /^(\~.+)/g,
    underline: /(_{1}(?=.+_{1}))(.+?)(_{1})/g,
};
var inline: { [index: string]: any } = {
    note: '<span class=\"note\">$1</span>',

    line_break: '<br />',

    bold_italic_underline: '<span class=\"bold italic underline\">$2</span>',
    bold_underline: '<span class=\"bold underline\">$2</span>',
    italic_underline: '<span class=\"italic underline\">$2</span>',
    bold_italic: '<span class=\"bold italic\">$2</span>',
    bold: '<span class=\"bold\">$2</span>',
    italic: '<span class=\"italic\">$2</span>',
    underline: '<span class=\"underline\">$2</span>',
    lexer: function (s: string, type: string) {
        if (!s) {
            return undefined;
        }

        var styles = ['underline', 'italic', 'bold', 'bold_italic', 'italic_underline', 'bold_underline', 'bold_italic_underline']
            , i = styles.length, style, match;

        s = s.replace(regex.note_inline, inline.note).replace(/\\\*/g, '[star]').replace(/\\_/g, '[underline]').replace(/\n/g, inline.line_break);

        // if (regex.emphasis.test(s)) {                         // this was causing only every other occurence of an emphasis syntax to be parsed
        while (i--) {
            style = styles[i];
            match = regex[style];

            if (match.test(s)) {
                s = s.replace(match, inline[style]);
            }
        }
        // }
        s = s.replace(/\[star\]/g, '*').replace(/\[underline\]/g, '_');
        if (type != "action")
            s = s.trim();
        return s;
    }
};

export var parse = function (original_script: string, cfg: any, generate_html: boolean) {

    var script = original_script,
        result: {
            scriptHtml: string,
            titleHtml: string,
            title_page: any[],
            tokens: any[]
        } = { title_page: [], tokens: [], scriptHtml: "", titleHtml: "" }
    if (!script) {
        return result;
    }

    var new_line_length = script.match(/\r\n/) ? 2 : 1;

    if (!cfg.print_notes) {
        script = script.replace(/ {0,1}\[\[/g, " /*").replace(/\]\] {0,1}/g, "*/");
    }

    var lines = script.split(/\r\n|\r|\n/);

    var create_token = function (text: string, cursor: number, line: number) {

        return helpers.default.create_token({
            text: text,
            start: cursor,
            end: cursor + text.length - 1 + new_line_length,
            line: line
        });
    };

    var lines_length = lines.length,
        current = 0,
        scene_number = 1,
        match, text, last_title_page_token,
        token, last_was_separator = false,
        //top_or_separated = false,
        token_category = "none",
        last_character_index,
        dual_right,
        state = "normal",
        cache_state_for_comment,
        nested_comments = 0,
        title_page_started = false;


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


        token = create_token(text, current, i);
        current = token.end + 1;


        if (text.trim().length === 0 && text !== "  ") {
            var skip_separator = cfg.merge_multiple_empty_lines && last_was_separator;

            if (state == "dialogue")
                result.tokens.push({ type: "dialogue_end" })
            if (state == "dual_dialogue")
                result.tokens.push({ type: "dual_dialogue_end" })
            state = "normal";


            if (skip_separator || state === "title_page") {
                continue;
            }

            dual_right = false;
            token.type = "separator";
            last_was_separator = true;
            result.tokens.push(token);
            continue;
        }

        //top_or_separated = last_was_separator || i === 0;
        token_category = "script";

        if (!title_page_started && regex.title_page.test(token.text)) {
            state = "title_page";
        }

        if (state === "title_page") {
            if (regex.title_page.test(token.text)) {
                var index = token.text.indexOf(":");
                token.type = token.text.substr(0, index).toLowerCase().replace(" ", "_");
                token.text = token.text.substr(index + 1).trim();
                last_title_page_token = token;
                result.title_page.push(token);
                title_page_started = true;
                continue;
            } else if (title_page_started) {
                last_title_page_token.text += (last_title_page_token.text ? "\n" : "") + token.text.trim();
                continue;
            }
        }

        if (state === "normal") {
            if (token.text.match(regex.line_break)) {
                token_category = "none";
            } else if (token.text.match(regex.scene_heading)) {
                token.text = token.text.replace(/^\./, "");
                if (cfg.each_scene_on_new_page && scene_number !== 1) {
                    var page_break = helpers.default.create_token({
                        type: "page_break",
                        start: token.start,
                        end: token.end
                    });
                    result.tokens.push(page_break);
                }

                token.type = "scene_heading";
                token.number = scene_number;
                if (match = token.text.match(regex.scene_number)) {
                    token.text = token.text.replace(regex.scene_number, "");
                    token.number = match[1];
                }
                scene_number++;
            } else if (token.text.match(regex.centered)) {
                token.type = "centered";
                token.text = token.text.replace(/>|</g, "").trim();
            } else if (token.text.match(regex.transition)) {
                token.text = token.text.replace(/> ?/, "");
                token.type = "transition";
            } else if (match = token.text.match(regex.synopsis)) {
                token.text = match[1];
                token.type = token.text ? "synopsis" : "separator";
            } else if (match = token.text.match(regex.section)) {
                token.level = match[1].length;
                token.text = match[2];
                token.type = "section";
            } else if (token.text.match(regex.page_break)) {
                token.text = "";
                token.type = "page_break";
            } else if (token.text.length && token.text[0] === "!") {
                token.type = "action";
                token.text = token.text.substr(1);
            } else if (token.text.match(regex.character)) {
                if (i === lines_length || i === lines_length - 1 || lines[i + 1].trim().length === 0) {
                    token.type = "shot";
                } else {
                    state = "dialogue";
                    token.type = "character";
                    token.text = token.text.replace(/^@/, "");
                    if (token.text[token.text.length - 1] === "^") {
                        state = "dual_dialogue"
                        if (cfg.use_dual_dialogue) {
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
                            token.dual = "right";
                        }
                        token.text = token.text.replace("^", "");
                    }
                    else {
                        result.tokens.push({ type: "dialogue_begin" });
                    }
                    last_character_index = result.tokens.length;
                }
            }
            else {
                token.type = "action";
            }
        } else {
            if (token.text.match(regex.parenthetical)) {
                token.type = "parenthetical";
            } else {
                token.type = "dialogue";
            }
            if (dual_right) {
                token.dual = "right";
            }
        }

        last_was_separator = false;

        if (token_category === "script" && state !== "ignore") {
            if (token.is("scene_heading", "transition")) {
                token.text = token.text.toUpperCase();
                title_page_started = true; // ignore title tags after first heading
            }
            if (token.text && token.text[0] === "~") {
                token.text = "*" + token.text.substr(1) + "*";
            }
            token.text = token.is("action") ? token.text : token.text.trim();
            result.tokens.push(token);
        }

    }

    if (state == "dialogue")
        result.tokens.push({ type: "dialogue_end" })
    if (state == "dual_dialogue")
        result.tokens.push({ type: "dual_dialogue_end" })

    var current_index = 0/*, previous_type = null*/;
    // tidy up separators


    if (generate_html) {
        var html = [];
        var titlehtml = [];
        //Generate html for title page
        while (current_index < result.title_page.length) {
            var current_token = result.title_page[current_index];
            if (current_token.text != "")
                current_token.html = inline.lexer(current_token.text);
            switch (current_token.type) {
                case 'title': titlehtml.push('<h1>' + current_token.html + '</h1>'); break;
                case 'credit': titlehtml.push('<p class=\"credit\">' + current_token.html + '</p>'); break;
                case 'author': titlehtml.push('<p class=\"authors\">' + current_token.html + '</p>'); break;
                case 'authors': titlehtml.push('<p class=\"authors\">' + current_token.html + '</p>'); break;
                case 'source': titlehtml.push('<p class=\"source\">' + current_token.html + '</p>'); break;
                case 'notes': titlehtml.push('<p class=\"notes\">' + current_token.html + '</p>'); break;
                case 'draft_date': titlehtml.push('<p class=\"draft-date\">' + current_token.html + '</p>'); break;
                case 'date': titlehtml.push('<p class=\"date\">' + current_token.html + '</p>'); break;
                case 'contact': titlehtml.push('<p class=\"contact\">' + current_token.html + '</p>'); break;
                case 'copyright': titlehtml.push('<p class=\"copyright\">' + current_token.html + '</p>'); break;
            }
            current_index++;
        }

        //Generate html for script
        current_index = 0;
        var isaction = false;
        while (current_index < result.tokens.length) {
            var current_token = result.tokens[current_index];
            if (current_token.text != "")
                current_token.html = inline.lexer(current_token.text, current_token.type);

           
            if (current_token.type == "action") {
                if(!isaction){
                    //first action element
                    html.push('<p>' + current_token.html);
                } 
                else{
                    //just add a new line to the current paragraph
                    html.push('\n'+current_token.html);
                }
                isaction = true;
            }
            else if(current_token.type == "separator" && isaction){
                if(current_index+1<result.tokens.length-1){
                    //we're not at the end
                    var next_type = result.tokens[current_index+1].type
                    if(next_type == "action" || next_type == "separator"){
                        html.push("\n");
                    }
                }
                else if(isaction){
                    //we're at the end
                    html.push("</p>")
                }
            }
            else {
                if(isaction){
                    //no longer, close the paragraph
                    isaction=false;
                    html.push("</p>");
                }
                switch (current_token.type) {
                    case 'scene_heading':
                        var content = current_token.text;
                        if (cfg.embolden_scene_headers)
                            content = '<span class=\"bold\">' + content + '</span>';
                        html.push('<h3 data-position=\"' + current_token.line + '\" ' + (current_token.number ? ' id=\"' + current_token.number + '\">' : '>') + content + '</h3>');
                        break;
                    case 'transition': html.push('<h2>' + current_token.text + '</h2>'); break;

                    case 'dual_dialogue_begin': html.push('<div class=\"dual-dialogue\">'); break;
                    case 'dialogue_begin': html.push('<div class=\"dialogue' + (current_token.dual ? ' ' + current_token.dual : '') + '\">'); break;
                    case 'character':
                        if (current_token.dual == "left") {
                            html.push('<div class=\"dialogue left\">');
                        }
                        else if (current_token.dual == "right") {
                            html.push('</div><div class=\"dialogue right\">');
                        }
                        html.push('<h4>' + current_token.text + '</h4>');
                        break;
                    case 'parenthetical': html.push('<p class=\"parenthetical\">' + current_token.html + '</p>'); break;
                    case 'dialogue':
                        html.push('<p>' + current_token.html + '</p>');
                        break;
                    case 'dialogue_end': html.push('</div> '); break;
                    case 'dual_dialogue_end': html.push('</div></div> '); break;

                    case 'section': html.push('<p class=\"section\" data-position=\"' + current_token.line + '\" data-depth=\"' + current_token.level + '\">' + current_token.text + '</p>'); break;
                    case 'synopsis': html.push('<p class=\"synopsis\">' + current_token.html + '</p>'); break;
                    case 'lyric': html.push('<p class=\"lyric\">' + current_token.html + '</p>'); break;

                    case 'note': html.push('<p class=\"note\">' + current_token.html + '</p>'); break;
                    case 'boneyard_begin': html.push('<!-- '); break;
                    case 'boneyard_end': html.push(' -->'); break;

                    //case 'action': ; break;
                    case 'centered': html.push('<p class=\"centered\">' + current_token.html + '</p>'); break;

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
            if (cfg.double_space_between_scenes && current_token.is("scene_heading") && current_token.number !== 1) {
                var additional_separator = helpers.default.create_separator(token.start, token.end);
                result.tokens.splice(current_index, 0, additional_separator);
                current_index++;
            }
            //previous_type = current_token.type;
            current_index++;
        }
        result.scriptHtml = html.join('');
        result.titleHtml = titlehtml.join('');
    }
    // clean separators at the end
    while (result.tokens.length > 0 && result.tokens[result.tokens.length - 1].type === "separator") {
        result.tokens.pop();
    }

    return result;
};