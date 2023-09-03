'use strict';
import { getFountainConfig, initFountainUIPersistence } from "./configloader";
import { ExtensionContext, languages, TextDocument } from 'vscode';
import * as vscode from 'vscode';
import * as afterparser from "./afterwriting-parser";
import { getActiveFountainDocument, getEditor, secondsToString, overwriteSceneNumbers, updateSceneNumbers } from "./utils";
import * as telemetry from "./telemetry";
import { FountainFoldingRangeProvider } from "./providers/Folding";
import { FountainCompletionProvider } from "./providers/Completion";
import { FountainSymbolProvider } from "./providers/Symbols";
import { showDecorations, clearDecorations } from "./providers/Decorations";
import { FountainCommandTreeDataProvider } from "./providers/Commands";
import { createPreviewPanel, FountainPreviewSerializer, getPreviewsToUpdate } from "./providers/Preview";
import { createStatisticsPanel, FountainStatsPanelserializer as FountainStatsPanelSerializer, getStatisticsPanels, refreshStatsPanel, updateDocumentVersionStats } from "./providers/Statistics";
import { FountainOutlineTreeDataProvider } from "./providers/Outline";
import { FountainCharacterTreeDataProvider } from "./providers/Characters";
import { performance } from "perf_hooks";
import { exportHtml } from "./providers/StaticHtml";
import { FountainCheatSheetWebviewViewProvider } from "./providers/Cheatsheet";
import { createPdfPreviewPanel, FountainPdfPanelserializer, getPdfPreviewPanels, refreshPdfPanel, updateDocumentVersionPdfPreview } from "./providers/PdfPreview";
import * as commands from "./commands";
import { FountainLocationTreeDataProvider } from "./providers/Locations";

/**
 * Approximates length of the screenplay based on the overall length of dialogue and action tokens
 */
function updateStatus(lengthAction: number, lengthDialogue: number): void {
  if (durationStatus != undefined) {
    if (getActiveFountainDocument() != undefined) {
      durationStatus.show();
      var durationDialogue = lengthDialogue;
      var durationAction = lengthAction;
      durationStatus.tooltip = "Dialogue: " + secondsToString(durationDialogue) + "\nAction: " + secondsToString(durationAction);
      durationStatus.text = secondsToString(durationDialogue + durationAction);
    } else {
      durationStatus.hide();
    }
  }
}

var durationStatus: vscode.StatusBarItem;
export const outlineViewProvider: FountainOutlineTreeDataProvider = new FountainOutlineTreeDataProvider();
const charactersViewProvider: FountainCharacterTreeDataProvider = new FountainCharacterTreeDataProvider();
const locationsViewProvider: FountainLocationTreeDataProvider = new FountainLocationTreeDataProvider();
const commandViewProvider: FountainCommandTreeDataProvider = new FountainCommandTreeDataProvider();


export let diagnosticCollection = languages.createDiagnosticCollection("fountain");
export let diagnostics: vscode.Diagnostic[] = [];

/**
 * Called when the extension is activated
 * @param context Collection of utilities private to an extension.
 */
export function activate(context: ExtensionContext) {

  telemetry.initTelemetry();

  registerOutlineTreeView();
  registerCharactersTreeView();
  registerLocationsTreeView();
  registerCommandTreeView();
  registerCheatsheetWebView();

  //Register Status Bar Items
  durationStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(durationStatus);

  //Register Commands
  context.subscriptions.push(vscode.commands.registerCommand('fountain.livepreview', () => {
    createPreviewPanel(vscode.window.activeTextEditor, true);
    telemetry.reportTelemetry("command:fountain.livepreview");
  }));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.livepreviewstatic', () => {
    createPreviewPanel(vscode.window.activeTextEditor, false);
    telemetry.reportTelemetry("command:fountain.livepreviewstatic");
  }));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.pdfpreview', createPdfPreviewPanel));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.statistics', createStatisticsPanel));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.jumpto', commands.jumpTo));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdf', commands.exportPdf));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdfdebug', async () => commands.exportPdf(false, true)));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdfcustom', async () => commands.exportPdf(true, false, true)));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.exporthtml', exportHtml));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.overwriteSceneNumbers', overwriteSceneNumbers));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.updateSceneNumbers', updateSceneNumbers));

  initFountainUIPersistence(context); //create the ui persistence save file
  context.subscriptions.push(vscode.commands.registerCommand('fountain.outline.visibleitems', commands.visibleItems));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.outline.reveal', () => {
    outlineViewProvider.reveal();
    telemetry.reportTelemetry("command:fountain.outline.reveal");
  }));

  context.subscriptions.push(vscode.commands.registerCommand('fountain.debugtokens', commands.debugTokens));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.shiftScenesUp', () => commands.shiftScenesUpDn(-1)));
  context.subscriptions.push(vscode.commands.registerCommand('fountain.shiftScenesDown', () => commands.shiftScenesUpDn(1)));

  vscode.workspace.onWillSaveTextDocument(e => {
    const config = getFountainConfig(e.document.uri);
    if (config.number_scenes_on_save === true) {
      overwriteSceneNumbers();
    }
  });

  registerTyping();

  //Setup custom folding mechanism
  languages.registerFoldingRangeProvider({ language: 'fountain' }, new FountainFoldingRangeProvider());

  //Setup autocomplete
  languages.registerCompletionItemProvider({ language: 'fountain' }, new FountainCompletionProvider(), '\n', '\r', '-', ' ');

  //Setup symbols (outline)
  languages.registerDocumentSymbolProvider({ language: 'fountain' }, new FountainSymbolProvider());


  //parse the document
  if (vscode.window.activeTextEditor != undefined && vscode.window.activeTextEditor.document != undefined && vscode.window.activeTextEditor.document.languageId == "fountain")
    parseDocument(vscode.window.activeTextEditor.document);

  vscode.window.registerWebviewPanelSerializer('fountain-preview', new FountainPreviewSerializer());
  vscode.window.registerWebviewPanelSerializer('fountain-pdfpreview', new FountainPdfPanelserializer());
  vscode.window.registerWebviewPanelSerializer('fountain-statistics', new FountainStatsPanelSerializer());

  function registerCheatsheetWebView() {
    const cheatsheetViewProvider: FountainCheatSheetWebviewViewProvider = new FountainCheatSheetWebviewViewProvider(context.extensionUri);
    vscode.window.registerWebviewViewProvider("fountain-cheatsheet", cheatsheetViewProvider);
  }
  
  function registerCommandTreeView() {
    vscode.window.registerTreeDataProvider("fountain-commands", outlineViewProvider);
    vscode.window.createTreeView("fountain-commands", { treeDataProvider: commandViewProvider });
  }
  
  function registerCharactersTreeView() {
    vscode.window.registerTreeDataProvider("fountain-characters", charactersViewProvider);
    vscode.window.createTreeView("fountain-characters", { treeDataProvider: charactersViewProvider, showCollapseAll: true });
  }

  function registerLocationsTreeView() {
    vscode.window.registerTreeDataProvider("fountain-locations", locationsViewProvider);
    vscode.window.createTreeView("fountain-locations", { treeDataProvider: locationsViewProvider, showCollapseAll: true });
  }
  
  function registerOutlineTreeView() {
    vscode.window.registerTreeDataProvider("fountain-outline", outlineViewProvider);
    outlineViewProvider.treeView = vscode.window.createTreeView("fountain-outline", { treeDataProvider: outlineViewProvider, showCollapseAll: true });
  }
}

var disposeTyping: vscode.Disposable;
function registerTyping() {
  try {
    const config = getFountainConfig(getActiveFountainDocument())
    if (config.parenthetical_newline_helper) {
      disposeTyping = vscode.commands.registerCommand('type', (args) => {
        //Automatically skip to the next line at the end of parentheticals
        if (args.text == "\n") {
          const editor = vscode.window.activeTextEditor;
          if (editor.selection.isEmpty) {
            const position = editor.selection.active;
            var linetext = editor.document.getText(new vscode.Range(new vscode.Position(position.line, 0), new vscode.Position(position.line, 256)));
            if (position.character == linetext.length - 1) {
              if (linetext.match(/^\s*\(.*\)$/g) || linetext.match(/^\s*((([A-Z0-9 ]+|@.*)(\([A-z0-9 '\-.()]+\))+|)$)/)) {
                var newpos = new vscode.Position(position.line, linetext.length);
                editor.selection = new vscode.Selection(newpos, newpos);
              }
            }
          }
        }
        vscode.commands.executeCommand('default:type', {
          text: args.text
        });
      });
    }
  }
  catch {
    let moreDetails = "More details";
    let openGithub1 = "View issue on vscode repo";
    vscode.window.showInformationMessage("Conflict with another extension! The 'type' command for vscode can only be registered by a single extension. You may want to disable the 'Parenthetical New Line Helper' setting in order to avoid further conflicts from BetterFountain", moreDetails, openGithub1).then(val => {
      switch (val) {
        case moreDetails: {
          vscode.env.openExternal(vscode.Uri.parse('https://github.com/piersdeseilligny/betterfountain/issues/84'));
          break;
        }
        case openGithub1: {
          vscode.env.openExternal(vscode.Uri.parse('https://github.com/Microsoft/vscode/issues/13441'));
          break;
        }
      }
    })
  }
}

vscode.workspace.onDidChangeTextDocument(change => {
  if (change.document.languageId == "fountain") {
    parseDocument(change.document);
    updateDocumentVersionPdfPreview(change.document.uri, change.document.version);
    updateDocumentVersionStats(change.document.uri, change.document.version);
  }
});

vscode.workspace.onDidChangeConfiguration(change => {
  if (change.affectsConfiguration("fountain.general.parentheticalNewLineHelper")) {
    let config = getFountainConfig(getActiveFountainDocument());
    if (disposeTyping) disposeTyping.dispose();
    if (config.parenthetical_newline_helper) {
      registerTyping();
    }
  }
})

export var parsedDocuments = new Map<string, afterparser.parseoutput>();
let lastParsedUri = "";

export function activeParsedDocument(): afterparser.parseoutput {
  var texteditor = getEditor(getActiveFountainDocument());
  if (texteditor) {
    return parsedDocuments.get(texteditor.document.uri.toString());
  }
  else {
    return parsedDocuments.get(lastParsedUri);
  }
}

export class FountainStructureProperties {
  scenes: { scene: number; line: number }[];
  sceneLines: number[];
  sceneNames: string[];
  titleKeys: string[];
  firstTokenLine: number;
  fontLine: number;
  lengthAction: number; //Length of the action character count
  lengthDialogue: number; //Length of the dialogue character count
  characters: Map<string, number[]>;
}

var fontTokenExisted: boolean = false;
const decortypesDialogue = vscode.window.createTextEditorDecorationType({});

let parseTelemetryLimiter = 5;
let parseTelemetryFrequency = 5;

export function parseDocument(document: TextDocument) {
  let t0 = performance.now()

  clearDecorations();

  var previewsToUpdate = getPreviewsToUpdate(document.uri)
  var output = afterparser.parse(document.getText(), getFountainConfig(document.uri), previewsToUpdate.length > 0)


  if (previewsToUpdate) {
    //lastFountainDocument = document;
    for (let i = 0; i < previewsToUpdate.length; i++) {
      previewsToUpdate[i].panel.webview.postMessage({ command: 'updateTitle', content: output.titleHtml });
      previewsToUpdate[i].panel.webview.postMessage({ command: 'updateScript', content: output.scriptHtml });

      if (previewsToUpdate[i].dynamic) {

        previewsToUpdate[i].uri = document.uri.toString();
        previewsToUpdate[i].panel.webview.postMessage({ command: 'setstate', uri: previewsToUpdate[i].uri });
      }
    }
  }
  lastParsedUri = document.uri.toString();
  parsedDocuments.set(lastParsedUri, output);
  var tokenlength = 0;
  const decorsDialogue: vscode.DecorationOptions[] = [];
  tokenlength = 0;
  parsedDocuments.get(document.uri.toString()).properties.titleKeys = [];
  var fontTokenExists = false;
  if (output.title_page) {
    while (tokenlength < output.title_page['hidden'].length) {
      if (output.title_page['hidden'][tokenlength].type == "font" && output.title_page['hidden'][tokenlength].text.trim() != "") {
        parsedDocuments.get(document.uri.toString()).properties.fontLine = output.title_page['hidden'][tokenlength].line;
        var fontname = output.title_page['hidden'][tokenlength].text;
        previewsToUpdate.forEach(p => {
          p.panel.webview.postMessage({ command: 'updateFont', content: fontname });
        });
        fontTokenExists = true;
        fontTokenExisted = true;
      }
      tokenlength++;
    }
  }
  if (!fontTokenExists && fontTokenExisted) {
    previewsToUpdate.forEach(p => {
      p.panel.webview.postMessage({ command: 'removeFont' });
    });
    fontTokenExisted = false;
    diagnosticCollection.set(document.uri, []);
  }
  var editor = getEditor(document.uri);
  if (editor) editor.setDecorations(decortypesDialogue, decorsDialogue)

  if (document.languageId == "fountain") {
    outlineViewProvider.update();
    charactersViewProvider.update();
    locationsViewProvider.update();
  }
  updateStatus(output.lengthAction, output.lengthDialogue);
  showDecorations(document.uri);

  let t1 = performance.now()
  let parseTime = t1 - t0;
  if (parseTelemetryLimiter == parseTelemetryFrequency) {
    telemetry.reportTelemetry("afterparser.parsing", undefined, { linecount: document.lineCount, parseduration: parseTime });
  }
  parseTelemetryLimiter--;
  if (parseTelemetryLimiter == 0) parseTelemetryLimiter = parseTelemetryFrequency;
}

vscode.window.onDidChangeActiveTextEditor(change => {
  if (change == undefined || change.document == undefined) return;
  if (change.document.languageId == "fountain") {
    parseDocument(change.document);
    /*if(previewpanels.has(change.document.uri.toString())){
      var preview = previewpanels.get(change.document.uri.toString());
      if(!preview.visible && preview.viewColumn!=undefined)
        preview.reveal(preview.viewColumn);
    }*/
  }
})

vscode.workspace.onDidSaveTextDocument(e => {
  if (e.languageId != "fountain") return;
  let config = getFountainConfig(e.uri);
  if (config.refresh_stats_on_save) {
    let statsPanel = getStatisticsPanels(e.uri);
    for (const sp of statsPanel) {
      refreshStatsPanel(sp.panel, e, config);
    }
  }
  if (config.refresh_pdfpreview_on_save) {
    let pdfPanels = getPdfPreviewPanels(e.uri);
    for (const pp of pdfPanels) {
      refreshPdfPanel(pp.panel, e, config);
    }
  }
});

vscode.workspace.onDidCloseTextDocument(e => {
  parsedDocuments.delete(e.uri.toString());
});