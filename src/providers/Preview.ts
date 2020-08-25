import * as vscode from "vscode";
import * as path from 'path';
import * as fs from "fs";
import { parsedDocuments, diagnostics, diagnosticCollection, getEditor, parseDocument } from "../extension";
import { getFountainConfig } from "../configloader";
import { TopmostLineMonitor, getVisibleLine } from "../utils/topMostLineMonitor";

interface preview{
    uri:string;
    dynamic:boolean;
    panel:vscode.WebviewPanel;
    id:Number;
}

export var previews:preview[] = [];
var isScrolling = false;

export function getPreviewPanels(docuri:vscode.Uri):preview[]{
    let selectedPreviews:preview[] = []
    for (let i = 0; i < previews.length; i++) {
        if(previews[i].uri == docuri.toString())
            selectedPreviews.push(previews[i])
    }
    return selectedPreviews;
}
export function removePreviewPanel(id:Number){
    for (var i = previews.length - 1; i >= 0; i--) {
        if(previews[i].id == id){
            previews.splice(i, 1);
        }
    }
}

export function getPreviewsToUpdate(docuri:vscode.Uri):preview[]{
    let selectedPreviews:preview[] = [];
    for (let i = 0; i < previews.length; i++) {
        if(previews[i].uri == docuri.toString() || previews[i].dynamic)
            selectedPreviews.push(previews[i]);
    }
    return selectedPreviews;
}

export function createPreviewPanel(editor:vscode.TextEditor, dynamic:boolean): vscode.WebviewPanel{
	if(editor.document.languageId!="fountain"){
		vscode.window.showErrorMessage("You can only preview Fountain documents as a screenplay!");
		return undefined;
    }
    let preview:vscode.WebviewPanel;
    let presentPreviews = getPreviewPanels(editor.document.uri);
    presentPreviews.forEach(p => {
        if(p.uri == editor.document.uri.toString() && p.dynamic == dynamic){
            //The preview already exists
            p.panel.reveal();
            preview = p.panel;
            dynamic = p.dynamic;
        }
    });

    if(preview == undefined){
        //The preview didn't already exist
        var previewname = path.basename(editor.document.fileName).replace(".fountain","");
        if(dynamic) previewname = "Fountain Preview";
        preview = vscode.window.createWebviewPanel(
            'fountain-preview', // Identifies the type of the webview. Used internally
            previewname, // Title of the panel displayed to the user
            vscode.ViewColumn.Three, // Editor column to show the new webview panel in.
            { enableScripts: true, retainContextWhenHidden:true });
    }
    loadWebView(editor.document.uri, preview, dynamic);
    return preview;
}

const webviewHtml = fs.readFileSync(assetsPath() + path.sep + "preview.html", 'utf8');
function assetsPath(): string{
    return __dirname.substr(0, __dirname.lastIndexOf(path.sep));
}


function loadWebView(docuri: vscode.Uri, preview:vscode.WebviewPanel, dynamic:boolean) {
    let id = Date.now()+Math.floor((Math.random()*1000));
    previews.push({uri:docuri.toString(), dynamic:dynamic, panel:preview, id:id });

	preview.webview.onDidReceiveMessage(async message => {
        if (message.command == "updateFontResult") {
            if (message.content == false && parsedDocuments.get(vscode.Uri.parse(message.uri).toString()).properties.fontLine != -1) {
                //The font could not be rendered
                diagnostics.length = 0;
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(parsedDocuments.get(vscode.Uri.parse(message.uri).toString()).properties.fontLine, 0), new vscode.Position(parsedDocuments.get(docuri.toString()).properties.fontLine, 5)), "This font could not be rendered in the live preview. Is it installed?", vscode.DiagnosticSeverity.Error));
                diagnosticCollection.set(vscode.Uri.parse(message.uri), diagnostics);
            }
            else {
                //Yay, the font has been rendered
                diagnosticCollection.set(vscode.Uri.parse(message.uri), []);
            }
        }
        else if(message.command == "revealLine"){
            if(!getFountainConfig(vscode.Uri.parse(message.uri)).synchronized_markup_and_preview) return;
            isScrolling = true;
            console.log("jump to line:"+message.content);
            const sourceLine = Math.floor(message.content);
            const fraction = message.content - sourceLine;
            let editor = getEditor(vscode.Uri.parse(message.uri));
            if(editor && !Number.isNaN(sourceLine))
            {
                const text = editor.document.lineAt(sourceLine).text;
                const start = Math.floor(fraction * text.length);
                editor.revealRange(
                    new vscode.Range(sourceLine, start, sourceLine + 1, 0),
                    vscode.TextEditorRevealType.AtTop);
            }
        }
        if(message.command == "changeselection"){
            var linePos=Number(message.line);
            var charPos=Number(message.character);
            if(Number.isNaN(linePos)) return;
            if(Number.isNaN(charPos)) charPos = 0;

            let selectionposition = new vscode.Position(message.line, message.character);

            let editor = getEditor(vscode.Uri.parse(message.uri));
            if(editor == undefined){
                var doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(message.uri));
                editor = await vscode.window.showTextDocument(doc)
            }
            else{
                await vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
            }
            
            editor.selection = new vscode.Selection(selectionposition, selectionposition);
            editor.revealRange(new vscode.Range(linePos,0,linePos+1,0), vscode.TextEditorRevealType.InCenterIfOutsideViewport);


        }
    });
    preview.onDidDispose(()=>{
        removePreviewPanel(id);
    })

    
    preview.webview.html = webviewHtml.replace(/\$ROOTDIR\$/g, preview.webview.asWebviewUri(vscode.Uri.file(assetsPath())).toString());
    preview.webview.postMessage({ command: 'setstate', uri: docuri.toString(), dynamic: dynamic })
    var config = getFountainConfig(docuri);
    preview.webview.postMessage({ command: 'updateconfig', content: config })

    var editor = getEditor(docuri);
    if(editor){
        parseDocument(editor.document);
        if(config.synchronized_markup_and_preview){
            preview.webview.postMessage({ command: 'highlightline', content:editor.selection.start.line})
            preview.webview.postMessage({ command: 'showsourceline', content: getVisibleLine(editor), linescount: editor.document.lineCount, source: "scroll" });
        }
            
    }
}

const _topmostLineMonitor = new TopmostLineMonitor();
_topmostLineMonitor.onDidChanged(event => {
	scrollTo(event.line, event.resource);
});

function scrollTo(topLine: number, resource:vscode.Uri) {
	if (isScrolling) {
        isScrolling = false;
        return;
    }

    let editor = getEditor(resource);
    if(getFountainConfig(editor.document.uri).synchronized_markup_and_preview){
        previews.forEach(p => {
            if(p.uri == resource.toString()){
                p.panel.webview.postMessage({ command: 'showsourceline', content: topLine, linescount: editor.document.lineCount, source: "scroll" });
            }
        });
    }

}


vscode.workspace.onDidChangeConfiguration(change => {
    previews.forEach(p => {
        var config = getFountainConfig(vscode.Uri.parse(p.uri));
        if (change.affectsConfiguration("fountain"))
            p.panel.webview.postMessage({ command: 'updateconfig', content: config })
    });
})

vscode.window.onDidChangeTextEditorSelection(change => {
	if(change.textEditor.document.languageId == "fountain")
	var config = getFountainConfig(change.textEditor.document.uri);
	if (config.synchronized_markup_and_preview) {
        var selection = change.selections[0];
        previews.forEach(p => {
            if(p.uri == change.textEditor.document.uri.toString())
                p.panel.webview.postMessage({ command: 'showsourceline', content: selection.active.line, linescount: change.textEditor.document.lineCount, source: "click" });
        });
	}
})

export class FountainPreviewSerializer implements vscode.WebviewPanelSerializer {
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
      // `state` is the state persisted using `setState` inside the webview
  
      // Restore the content of our webview.
      //
      // Make sure we hold on to the `webviewPanel` passed in here and
      // also restore any event listeners we need on it.


      let docuri = vscode.Uri.parse(state.docuri);
      loadWebView(docuri, webviewPanel, state.dynamic);
      //webviewPanel.webview.postMessage({ command: 'updateTitle', content: state.title_html });
      //webviewPanel.webview.postMessage({ command: 'updateScript', content: state.screenplay_html });
    }
  }