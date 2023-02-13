import * as vscode from "vscode";
import * as path from 'path';
import * as fs from "fs";
import { getEditor, activeFountainDocument } from "../extension";
import { FountainConfig, getFountainConfig } from "../configloader";
import { assetsPath } from "../utils";
import * as afterparser from "../afterwriting-parser";
import { GeneratePdf } from "../pdf/pdf";

interface pdfpreviewPanel{
    uri:string;
    panel:vscode.WebviewPanel;
    id:Number;
}

export var pdfPanels:pdfpreviewPanel[] = [];

export function getPdfPreviewPanels(docuri:vscode.Uri):pdfpreviewPanel[]{
    let selectedPanels:pdfpreviewPanel[] = []
    for (let i = 0; i < pdfPanels.length; i++) {
        if(pdfPanels[i].uri == docuri.toString())
            selectedPanels.push(pdfPanels[i])
    }
    return selectedPanels;
}

export function updateDocumentVersion(docuri:vscode.Uri, version:Number){
    for(let panel of getPdfPreviewPanels(docuri)){
        panel.panel.webview.postMessage({command:'updateversion', version:version});
    }
}

export function removePdfPreviewPanel(id:Number){
    for (var i = pdfPanels.length - 1; i >= 0; i--) {
        if(pdfPanels[i].id == id){
            pdfPanels.splice(i, 1);
        }
    }
}

export async function refreshPanel(pdfpanel:vscode.WebviewPanel, document:vscode.TextDocument, config:FountainConfig){
    pdfpanel.webview.postMessage({ command:"updateversion", version:document.version, loading:true});
    var parsed = afterparser.parse(document.getText(), config, false);
    //Create PDF
    let pdfAsBase64 = await GeneratePdf("$PREVIEW$", config, undefined, parsed, undefined);
    pdfpanel.webview.postMessage({command:"updatepdf", version:document.version, content:pdfAsBase64})
    //Post Update to panel
}

export function createPdfPreviewPanel(editor:vscode.TextEditor): vscode.WebviewPanel{
	if(editor.document.languageId!="fountain"){
		vscode.window.showErrorMessage("You can only view the PDF Preview of Fountain documents!");
		return undefined;
    }
    let pdfpanel:vscode.WebviewPanel;
    let presentpdfPanels = getPdfPreviewPanels(editor.document.uri);
    presentpdfPanels.forEach(p => {
        if(p.uri == editor.document.uri.toString()){
            //The pdf panel already exists
            p.panel.reveal();
            pdfpanel = p.panel;
        }
    });

    if(pdfpanel == undefined){
        //The pdf panel didn't already exist
        var panelname = path.basename(editor.document.fileName).replace(".fountain","");
        pdfpanel = vscode.window.createWebviewPanel(
            'fountain-statistics', // Identifies the type of the webview. Used internally
            panelname, // Title of the panel displayed to the user
            vscode.ViewColumn.Three, // Editor column to show the new webview panel in.
            { enableScripts: true,  });
    }
    loadWebView(editor.document.uri, pdfpanel);
    return pdfpanel;
}

let pdfHtml: string | null = null;
function loadPdfPreviewHtml() {
    if(!pdfHtml) pdfHtml = fs.readFileSync(assetsPath() + path.sep + "webviews" + path.sep + "preview_pdf.html", 'utf8');
    return pdfHtml;
}

const extensionpath = vscode.extensions.getExtension("piersdeseilligny.betterfountain").extensionPath;
const resolveAsUri = (panel:vscode.WebviewPanel,...p: string[]):string => {
    const uri = vscode.Uri.file(path.join(extensionpath, 'out', 'webviews', ...p));
    return panel.webview.asWebviewUri(uri).toString();
  };

async function loadWebView(docuri: vscode.Uri, pdfpanel:vscode.WebviewPanel) {
    let id = Date.now()+Math.floor((Math.random()*1000));
    pdfPanels.push({uri:docuri.toString(),panel:pdfpanel, id:id });
    
    const cspSource = pdfpanel.webview.cspSource;
    pdfpanel.webview.html = loadPdfPreviewHtml()
        .replace("$HEADLINKS$",
        `
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; connect-src ${cspSource}; script-src 'unsafe-inline' ${cspSource}; style-src 'unsafe-inline' ${cspSource}; img-src blob: data: ${cspSource};">
        <link rel="resource" type="application/l10n" href="${resolveAsUri(
            pdfpanel,
            'lib',
            'web',
            'locale',
            'locale.properties'
          )}">
      <link rel="stylesheet" href="${resolveAsUri(pdfpanel,'pdfjs', 'web', 'viewer.css')}">
      <script src="${resolveAsUri(pdfpanel,'pdfjs', 'build', 'pdf.js')}"></script>
      <script src="${resolveAsUri(pdfpanel,'pdfjs', 'build', 'pdf.worker.js')}"></script>
      <script src="${resolveAsUri(pdfpanel,'pdfjs', 'web', 'viewer.js')}"></script>`);

    var config = getFountainConfig(docuri);
    pdfpanel.webview.postMessage({ command: 'setstate', uri: docuri.toString() });
    pdfpanel.webview.postMessage({ command: 'updateconfig', content: config });

    var editor = getEditor(activeFountainDocument());
    var config = getFountainConfig(activeFountainDocument());

    pdfpanel.webview.onDidReceiveMessage(async message => {
        if(message.command == "revealLine"){
            const sourceLine = message.content;
            let editor = getEditor(vscode.Uri.parse(message.uri));
            if(editor == undefined){
                var doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(message.uri));
                editor = await vscode.window.showTextDocument(doc)
            }
            else{
                await vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
            }
            if(editor && !Number.isNaN(sourceLine))
            {
                editor.selection = new vscode.Selection(new vscode.Position(sourceLine,0),new vscode.Position(sourceLine,0));
                editor.revealRange(
                    new vscode.Range(sourceLine, 0, sourceLine + 1, 0),
                    vscode.TextEditorRevealType.Default);
            }
        }
        if(message.command == "selectLines"){
            let startline = Math.floor(message.content.start);
            let endline = Math.floor(message.content.end);
            let editor = getEditor(vscode.Uri.parse(message.uri));
            if(editor == undefined){
                var doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(message.uri));
                editor = await vscode.window.showTextDocument(doc)
            }
            else{
                await vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
            }
            if(editor && !Number.isNaN(startline) && !Number.isNaN(endline))
            {
                let startpos = new vscode.Position(startline,0);
                let endpos = new vscode.Position(endline,editor.document.lineAt(endline).text.length);
                editor.selection = new vscode.Selection(startpos,endpos);
                editor.revealRange(new vscode.Range(startpos,endpos), vscode.TextEditorRevealType.Default);
                vscode.window.showTextDocument(editor.document);
            }
        }
        if(message.command== "saveUiPersistence"){
            //save ui persistence
        }
        if(message.command== "refresh"){
            refreshPanel(pdfpanel, editor.document, config);
        }
    });
    pdfpanel.onDidDispose(()=>{
        removePdfPreviewPanel(id);
    })


    refreshPanel(pdfpanel, editor.document, config);
}

vscode.workspace.onDidChangeConfiguration(change => {
    if (change.affectsConfiguration("fountain")){
        pdfPanels.forEach(p => {
            var config = getFountainConfig(vscode.Uri.parse(p.uri));
                p.panel.webview.postMessage({ command: 'updateconfig', content: config })
                p.panel.webview.postMessage({command:'updateversion', version:-1});
        });
    }
})

let previousCaretLine = 0;
let previousSelectionStart = 0;
let previousSelectionEnd = 0;
vscode.window.onDidChangeTextEditorSelection(change => {
	if(change.textEditor.document.languageId == "fountain")
    var selection = change.selections[0];
    pdfPanels.forEach(p => {
        if(p.uri == change.textEditor.document.uri.toString()){
            if(selection.active.line != previousCaretLine){
                previousCaretLine = selection.active.line;
                p.panel.webview.postMessage({ command: 'updatecaret', content: selection.active.line, linescount: change.textEditor.document.lineCount, source: "click" });
            } 
            if(previousSelectionStart != selection.start.line || previousSelectionEnd != selection.end.line){
                previousSelectionStart = selection.start.line;
                previousSelectionEnd = selection.end.line;
                p.panel.webview.postMessage({ command: 'updateselection', content: { start:selection.start.line, end:selection.end.line }});
            }
                
        }
    });
})

export class FountainPdfPanelserializer implements vscode.WebviewPanelSerializer {
    async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
      // `state` is the state persisted using `setState` inside the webview
  
      // Restore the content of our webview.
      //
      // Make sure we hold on to the `webviewPanel` passed in here and
      // also restore any event listeners we need on it.


      let docuri = vscode.Uri.parse(state.docuri);
      loadWebView(docuri, webviewPanel);
      //webviewPanel.webview.postMessage({ command: 'updateTitle', content: state.title_html });
      //webviewPanel.webview.postMessage({ command: 'updateScript', content: state.screenplay_html });
    }
  }