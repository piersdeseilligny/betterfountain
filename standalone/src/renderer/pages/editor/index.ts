import { Title, Widget } from "@lumino/widgets";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Uri } from "vscode";
import { AvenueWorker } from "../../../avenue/AvenueWorker";
import { ScreenplayContent } from "../../../main/file/file";
import { appSignals } from "../../renderer";


monaco.languages.register({
    id:"fountain",
});

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
const legend = {
    tokenTypes: [
        'scene'
    ],
    tokenModifiers: [
        'declaration', 'documentation', 'readonly', 'static', 'abstract', 'deprecated',
        'modification', 'async'
    ]
};

class AvenueState implements monaco.languages.IState{

    public canbeTitlePage:boolean;
    public counter:number = 0;

    constructor(oldstate?:AvenueState){
        if(oldstate){
            this.counter = oldstate.counter;
        } 
    }

    clone(): monaco.languages.IState {
        return new AvenueState(this);
    }
    equals(other: AvenueState): boolean {
        return other.counter == this.counter;
    }

}

monaco.languages.setTokensProvider('fountain', {
    getInitialState: () => new AvenueState(),
    tokenize: (line:string, state:AvenueState):monaco.languages.ILineTokens => {
        console.log(state.counter);
        if(line.length>0)
            state.counter++;
        if(state.counter>11) state.counter = 0;
        return {
            endState: state,
            tokens: [{
                startIndex: 0,
                scopes: state.counter.toString()
            }],
        }
    }
});

monaco.editor.defineTheme('fountainTheme', {
    base: 'vs',
    inherit: true,
    rules: [
        { token: '0', foreground: 'FF2000', fontStyle: 'bold' },
        { token: '1', foreground: 'FF7500', fontStyle: 'bold' },
        { token: '2', foreground: 'FFC300', fontStyle: 'bold' },
        { token: '3', foreground: 'E7FF00', fontStyle: 'bold' },
        { token: '4', foreground: 'C0FF00', fontStyle: 'bold' },
        { token: '5', foreground: '21FF00', fontStyle: 'bold' },
        { token: '6', foreground: '00FFE8', fontStyle: 'bold' },
        { token: '7', foreground: '00EFFF', fontStyle: 'bold' },
        { token: '8', foreground: '009FFF', fontStyle: 'bold' },
        { token: '9', foreground: '0048FF', fontStyle: 'bold' },
        { token: '10', foreground: '6300FF', fontStyle: 'bold' },
        { token: '11', foreground: 'D400FF', fontStyle: 'bold' },
    ],
    colors:{}
});

monaco.editor.setTheme('fountainTheme');
(window as any).MonacoEnvironment = {
    getWorkerUrl: function (moduleId:any, label:any) {
        if(label=="avenue") return './avenue.worker.bundle.js'
        return './editor.worker.js';
    }
}
let avenue:monaco.editor.MonacoWebWorker<AvenueWorker>;

export class Editor extends Widget {
    editor: monaco.editor.IStandaloneCodeEditor;
    content: ScreenplayContent;
    
    constructor(content:ScreenplayContent){
        super();
        this.content = content;
        this.title.label = content.filename;
        this.title.closable = true;
        this.makeEditor();
    }

    async makeEditor(){
        /*if(!avenue){
            //Avenue isn't loaded yet
            avenue = await monaco.editor.createWebWorker<AvenueWorker>({
                moduleId:"./avenue.worker.bundle.js",
                label:"avenue"
            });
        }*/

        let model = monaco.editor.createModel(this.content.fountain, "fountain", monaco.Uri.parse(this.content.uri));
        this.editor = monaco.editor.create(this.node, {
            model:model,
            theme: 'fountainTheme',
            'semanticHighlighting.enabled': true,
            'wordWrapColumn': 57,
            'wordWrap':'wordWrapColumn'
        });
        appSignals.changeDocument(this.content);
        this.editor.onDidFocusEditorWidget(()=>{
            appSignals.changeDocument(this.content);
        });
    }

    dispose(): void {
        this.editor.dispose();
        super.dispose();
    }

    protected onResize(msg:Widget.ResizeMessage){
        if(this.editor){
            this.editor.layout({width:msg.width, height:msg.height});
        }
    }
}