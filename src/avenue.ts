import { token } from "./token";
import * as vscode from "vscode";
import { getEditor } from "./extension";

const regex: { [index: string]: RegExp } = {
    title_page: /(title|credit|author[s]?|source|notes|draft date|date|watermark|contact|copyright|font)\:.*/i,

    section: /^[ \t]*(#+)(?: *)(.*)/,
    synopsis: /^[ \t]*(?:\=(?!\=+) *)(.*)/,

    scene_heading: /^[ \t]*([.](?=[0-9a-z])|(?:[*]{0,3}_?)(?:int|ext|est|int[.]?\/ext|i[.]?\/e)[. ])(.+?)(#[-.0-9a-z]+#)?$/i,
    scene_number: /#(.+)#/,

    transition: /^[ \t]*((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO\:|^TO\:$)|^(?:> *)(.+)/,

    dialogue: /^[ \t]*([*_]+[0-9\p{Lu} (._\-'’)]*)(\^?)?(?:\n(?!\n+))([\s\S]+)/u,

    character: /^[ \t]*(([\p{Lu}0-9- \.#]+(\([A-z0-9 '’\-.()]+\))*|(@.*))(\s*\^)?$)/u,
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
    lyric: /^(\~.+)/g,
    underline: /(_{1}(?=.+_{1}))(.+?)(_{1})/g,
};

/**
 * Preprocess:    calculate which tokens need to be removed and where the new ones should be added
 * Remove:        get rid of any stale tokens
 * Add:           create and append any new tokens
 * Postprocess:   perform any extra remaining work (such as updating the structure)
 * Idle:          no ongoing operations
 */
export enum ParseState { Preprocess = "preprocess", Remove = "remove", Add = "add", Postprocess = "postprocess", Idle = "idle" }

const staleRange = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255,50,50,0.5)',
    isWholeLine:true
  });

/** A high-performance and feature-rich incremental foutain parser */
export class parser {
    constructor() {
        
    }
    tokens:token[]

    public stateChanged: (state:ParseState) => void;
    private _state:ParseState
    get state(){ return this._state}
    set state(val)
    {
        if(this._state != ParseState.Idle) console.timeEnd("Parsing state '" + this._state + "'");
        this._state = val; 
        this.stateChanged(val);
        if(val != ParseState.Idle) console.time("Parsing state '" + val + "'");
    }

    /** Parse only the required part of the document based on a set of changes */
    public parseChanges(change:vscode.TextDocumentChangeEvent){

        this.state = ParseState.Preprocess;

        let startStale = 0; //the offset after which all tokens are stale
        let endStale = 0; //the offset before which all tokens are stale
        for (let i = 0; i < change.contentChanges.length; i++) {
            let cc = change.contentChanges[i];
            if(i==0){
                startStale = cc.rangeOffset;
                endStale = cc.rangeOffset+cc.text.length;
            }
            else{
                if(startStale > cc.rangeOffset) startStale = cc.rangeOffset;
                if(endStale < cc.rangeOffset+cc.text.length) endStale = cc.rangeOffset+cc.text.length;
            }
        }
        
        let documentText = change.document.getText();

        //move the startStale offset back to the previous empty line
        let prevNewLineCounter = 0;
        while(prevNewLineCounter<2 && startStale > 0){
            if(documentText[startStale] == '\n')
                prevNewLineCounter++;
            else if(documentText[startStale] != '\r')
                prevNewLineCounter = 0;
            startStale--;
        }
        //and now continue moving back until we hit a non-linebreak
        var isCRLF = false;
        while(startStale > 0){
            if(documentText[startStale] == '\r') isCRLF = true;
            else if(documentText[startStale] != '\n' && documentText[startStale] != '\r') break;
            startStale--;
        }
        startStale+=2;
        if(isCRLF) startStale++;

        //move the endStale offset towards the next empty line
        let nextNewLineCounter = 0;
        while(nextNewLineCounter<2 && endStale < documentText.length){
            if(documentText[endStale] == '\n')
                nextNewLineCounter++;
            else if(documentText[endStale] != '\r')
                nextNewLineCounter = 0;
            endStale++;
        }
        //and now continue moving forward until we hit a non-linebreak
        while(endStale<documentText.length){
            if(documentText[endStale] != '\n' && documentText[endStale] != '\r') break;
            endStale++;
        }
        endStale--;

        this.parseRange(startStale,endStale, change.document);

        this.state = ParseState.Idle;
    }

    private parseRange(start:number, end:number, doc:vscode.TextDocument){
        getEditor(doc.uri).setDecorations(staleRange, [new vscode.Range(doc.positionAt(start), doc.positionAt(end))]);
    }

    /** Parse the entire document */
    public parseDocument(document:vscode.TextDocument){
        console.log(document.fileName);
        console.log(regex);
    }
}