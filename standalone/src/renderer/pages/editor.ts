import { Title, Widget } from "@lumino/widgets";
import * as monaco from 'monaco-editor';

export class Editor extends Widget {
    editor: monaco.editor.IStandaloneCodeEditor;
    constructor(contents:string, name:string){
        super();
        this.title.label = name;
        this.title.closable = true;
        this.editor = monaco.editor.create(this.node, {
            value:contents,
            smoothScrolling:true,
            cursorSmoothCaretAnimation:true,
            cursorBlinking:"smooth",
            padding:{
                top:12
            }
        });
    }
    protected onResize(msg:Widget.ResizeMessage){
        if(this.editor){
            this.editor.layout({width:msg.width, height:msg.height});
        }
    }
}