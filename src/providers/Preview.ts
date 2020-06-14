import * as vscode from "vscode";
import * as path from 'path';
import * as fs from "fs";
import { parsedDocuments, diagnostics, diagnosticCollection, getEditor, activePreviewChanged, parseDocument } from "../extension";
import { getFountainConfig } from "../configloader";
import { TopmostLineMonitor } from "../utils/topMostLineMonitor";

export var previewpanels = new Map<string, vscode.WebviewPanel>();
var isScrolling = false;

export function createPreviewPanel(editor:vscode.TextEditor): vscode.WebviewPanel{
	if(editor.document.languageId!="fountain"){
		vscode.window.showErrorMessage("You can only preview Fountain documents as a screenplay!");
		return undefined;
    }
    let preview:vscode.WebviewPanel;
    if(previewpanels.has(editor.document.uri.toString())){
        //preview already exists, simply show it
        preview = previewpanels.get(editor.document.uri.toString());
        preview.reveal(preview.viewColumn);
        loadWebView(editor.document.uri, preview);
    }
    else{
        preview = vscode.window.createWebviewPanel(
            'fountain-preview', // Identifies the type of the webview. Used internally
            path.basename(editor.document.fileName).replace(".fountain",""), // Title of the panel displayed to the user
            vscode.ViewColumn.Three, // Editor column to show the new webview panel in.
            { enableScripts: true, retainContextWhenHidden:true }
        );    
    }
    return preview;
}

const webviewHtml = fs.readFileSync(assetsPath() + path.sep + "webview.html", 'utf8');
function assetsPath(): string{
    return __dirname.substr(0, __dirname.lastIndexOf(path.sep));
}

function loadWebView(docuri: vscode.Uri, preview:vscode.WebviewPanel) {
    var cleandir = assetsPath().split(String.fromCharCode(92)).join("/");
    previewpanels.set(docuri.toString(), preview);
    preview.onDidChangeViewState(e =>{
        if(e.webviewPanel.active){
            activePreviewChanged(docuri);
        }
        if(e.webviewPanel.visible){
            console.log(previewpanels);
        }
    });
	preview.webview.onDidReceiveMessage(async message => {
        if (message.command == "updateFontResult") {
            if (message.content == false && parsedDocuments.get(docuri.toString()).properties.fontLine != -1) {
                //The font could not be rendered
                diagnostics.length = 0;
                diagnostics.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(parsedDocuments.get(docuri.toString()).properties.fontLine, 0), new vscode.Position(parsedDocuments.get(docuri.toString()).properties.fontLine, 5)), "This font could not be rendered in the live preview. Is it installed?", vscode.DiagnosticSeverity.Error));
                diagnosticCollection.set(docuri, diagnostics);
            }
            else {
                //Yay, the font has been rendered
                diagnosticCollection.set(docuri, []);
            }
        }
        else if(message.command == "revealLine"){
            if(!getFountainConfig(docuri).synchronized_markup_and_preview) return;
            isScrolling = true;
            console.log("jump to line:"+message.content);
            const sourceLine = Math.floor(message.content);
            const fraction = message.content - sourceLine;
            let editor = getEditor(docuri);
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

            let editor = getEditor(docuri);
            if(editor == undefined){
                var doc = await vscode.workspace.openTextDocument(docuri);
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
        previewpanels.delete(docuri.toString());
    })

    preview.webview.html = webviewHtml.replace(/\$ROOTDIR\$/g, cleandir);
    preview.webview.postMessage({ command: 'seturi', content: docuri.toString() })
    var config = getFountainConfig(docuri);
    preview.webview.postMessage({ command: 'updateconfig', content: config })

    var editor = getEditor(docuri);
    if(editor){
        parseDocument(editor.document);
        preview.webview.postMessage({ command: 'highlightline', content:editor.selection.start.line})
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
    console.log(previewpanels.keys);
	if (previewpanels.has(resource.toString()) && editor != undefined) {
		previewpanels.get(resource.toString()).webview.postMessage({ command: 'showsourceline', content: topLine, linescount: editor.document.lineCount, source: "scroll" });
	}
}


vscode.workspace.onDidChangeConfiguration(change => {
	previewpanels.forEach((previewpanel, docuri) => {
		var config = getFountainConfig(vscode.Uri.parse(docuri));
		if (change.affectsConfiguration("fountain")) {
			if (previewpanel) {
				var config = getFountainConfig(vscode.Uri.parse(docuri));
				previewpanel.webview.postMessage({ command: 'updateconfig', content: config })
			}
		}
	})
})

vscode.window.onDidChangeTextEditorSelection(change => {
	if(change.textEditor.document.languageId == "fountain")
	var config = getFountainConfig(change.textEditor.document.uri);
	if (config.synchronized_markup_and_preview) {
		var selection = change.selections[0];
		if (previewpanels.has(change.textEditor.document.uri.toString())) {
			previewpanels.get(change.textEditor.document.uri.toString()).webview.postMessage({ command: 'showsourceline', content: selection.active.line, linescount: change.textEditor.document.lineCount, source: "click" });
		}
	}
})

export class FountainPreviewSerializer implements vscode.WebviewPanelSerializer {
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
      // `state` is the state persisted using `setState` inside the webview
  
      // Restore the content of our webview.
      //
      // Make sure we hold on to the `webviewPanel` passed in here and
      // also restore any event listeners we need on it.


      var docuri = vscode.Uri.parse(state.docuri);
      loadWebView(docuri, webviewPanel);
      //webviewPanel.webview.postMessage({ command: 'updateTitle', content: state.title_html });
      //webviewPanel.webview.postMessage({ command: 'updateScript', content: state.screenplay_html });
    }
  }