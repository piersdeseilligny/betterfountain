import * as vscode from "vscode";
import * as path from 'path';
import * as fs from "fs";
import { getEditor, getActiveFountainDocument } from "../utils";
import { FountainConfig, getFountainConfig } from "../configloader";
import { assetsPath, resolveAsUri } from "../utils";
import * as afterparser from "../afterwriting-parser";
import { retrieveScreenPlayStatistics } from "../statistics";

interface statisticsPanel {
  uri: string;
  panel: vscode.WebviewPanel;
  id: Number;
}

export var statsPanels: statisticsPanel[] = [];

export function getStatisticsPanels(docuri: vscode.Uri): statisticsPanel[] {
  let selectedPanels: statisticsPanel[] = []
  for (let i = 0; i < statsPanels.length; i++) {
    if (statsPanels[i].uri == docuri.toString())
      selectedPanels.push(statsPanels[i])
  }
  return selectedPanels;
}

export function updateDocumentVersionStats(docuri: vscode.Uri, version: Number) {
  for (let panel of getStatisticsPanels(docuri)) {
    panel.panel.webview.postMessage({ command: 'updateversion', version: version });
  }
}

export function removeStatisticsPanel(id: Number) {
  for (var i = statsPanels.length - 1; i >= 0; i--) {
    if (statsPanels[i].id == id) {
      statsPanels.splice(i, 1);
    }
  }
}

export async function refreshStatsPanel(statspanel: vscode.WebviewPanel, document: vscode.TextDocument, config: FountainConfig) {
  statspanel.webview.postMessage({ command: "updateversion", version: document.version, loading: true });
  var parsed = afterparser.parse(document.getText(), config, false);
  const stats = await retrieveScreenPlayStatistics(document.getText(), parsed, config, undefined);
  statspanel.webview.postMessage({ command: 'updateStats', content: stats, version: document.version });
}

export function createStatisticsPanel(): vscode.WebviewPanel {
  let editor = getEditor(getActiveFountainDocument());
  if (editor.document.languageId != "fountain") {
    vscode.window.showErrorMessage("You can only view statistics of Fountain documents!");
    return undefined;
  }
  let statspanel: vscode.WebviewPanel;
  let presentstatsPanels = getStatisticsPanels(editor.document.uri);
  presentstatsPanels.forEach(p => {
    if (p.uri == editor.document.uri.toString()) {
      //The stats panel already exists
      p.panel.reveal();
      statspanel = p.panel;
    }
  });

  if (statspanel == undefined) {
    //The stats panel didn't already exist
    var panelname = path.basename(editor.document.fileName).replace(".fountain", "");
    statspanel = vscode.window.createWebviewPanel(
      'fountain-statistics', // Identifies the type of the webview. Used internally
      panelname, // Title of the panel displayed to the user
      vscode.ViewColumn.Three, // Editor column to show the new webview panel in.
      { enableScripts: true, });
  }
  loadWebView(editor.document.uri, statspanel);
  return statspanel;
}

let statsHtml: string | null = null;
function loadStatsHtml() {
  if (!statsHtml) statsHtml = fs.readFileSync(assetsPath() + path.sep + "webviews" + path.sep + "stats.html", 'utf8');
  return statsHtml;
}


async function loadWebView(docuri: vscode.Uri, statspanel: vscode.WebviewPanel) {
  let id = Date.now() + Math.floor((Math.random() * 1000));
  statsPanels.push({ uri: docuri.toString(), panel: statspanel, id: id });

  statspanel.webview.html = loadStatsHtml().replace("$HEADLINKS$",
    `<link rel="stylesheet" href="${resolveAsUri(statspanel, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css')}">
        <script src="${resolveAsUri(statspanel, 'out', 'webviews', 'stats.bundle.js')}" defer></script>
        <link rel="stylesheet" href="${resolveAsUri(statspanel, 'out', 'webviews', 'common.css')}">`)

  var config = getFountainConfig(docuri);
  statspanel.webview.postMessage({ command: 'setstate', uri: docuri.toString() });
  statspanel.webview.postMessage({ command: 'updateconfig', content: config });

  var editor = getEditor(getActiveFountainDocument());
  var config = getFountainConfig(getActiveFountainDocument());

  statspanel.webview.onDidReceiveMessage(async message => {
    if (message.command == "revealLine") {
      const sourceLine = message.content;
      let editor = getEditor(vscode.Uri.parse(message.uri));
      if (editor == undefined) {
        var doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(message.uri));
        editor = await vscode.window.showTextDocument(doc)
      }
      else {
        await vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
      }
      if (editor && !Number.isNaN(sourceLine)) {
        editor.selection = new vscode.Selection(new vscode.Position(sourceLine, 0), new vscode.Position(sourceLine, 0));
        editor.revealRange(
          new vscode.Range(sourceLine, 0, sourceLine + 1, 0),
          vscode.TextEditorRevealType.Default);
      }
    }
    if (message.command == "selectLines") {
      let startline = Math.floor(message.content.start);
      let endline = Math.floor(message.content.end);
      let editor = getEditor(vscode.Uri.parse(message.uri));
      if (editor == undefined) {
        var doc = await vscode.workspace.openTextDocument(vscode.Uri.parse(message.uri));
        editor = await vscode.window.showTextDocument(doc)
      }
      else {
        await vscode.window.showTextDocument(editor.document, editor.viewColumn, false);
      }
      if (editor && !Number.isNaN(startline) && !Number.isNaN(endline)) {
        let startpos = new vscode.Position(startline, 0);
        let endpos = new vscode.Position(endline, editor.document.lineAt(endline).text.length);
        editor.selection = new vscode.Selection(startpos, endpos);
        editor.revealRange(new vscode.Range(startpos, endpos), vscode.TextEditorRevealType.Default);
        vscode.window.showTextDocument(editor.document);
      }
    }
    if (message.command == "saveUiPersistence") {
      //save ui persistence
    }
    if (message.command == "refresh") {
      refreshStatsPanel(statspanel, editor.document, getFountainConfig(docuri));
    }
  });
  
  statspanel.onDidDispose(() => {
    removeStatisticsPanel(id);
  })

  refreshStatsPanel(statspanel, editor.document, config);
}

vscode.workspace.onDidChangeConfiguration(change => {
  if (change.affectsConfiguration("fountain")) {
    statsPanels.forEach(p => {
      var config = getFountainConfig(vscode.Uri.parse(p.uri));
      p.panel.webview.postMessage({ command: 'updateconfig', content: config })
      p.panel.webview.postMessage({ command: 'updateversion', version: -1 });
    });
  }
})

let previousCaretLine = 0;
let previousSelectionStart = 0;
let previousSelectionEnd = 0;
vscode.window.onDidChangeTextEditorSelection(change => {
  if (change.textEditor.document.languageId == "fountain")
    var selection = change.selections[0];
  statsPanels.forEach(p => {
    if (p.uri == change.textEditor.document.uri.toString()) {
      if (selection.active.line != previousCaretLine) {
        previousCaretLine = selection.active.line;
        p.panel.webview.postMessage({ command: 'updatecaret', content: selection.active.line, linescount: change.textEditor.document.lineCount, source: "click" });
      }
      if (previousSelectionStart != selection.start.line || previousSelectionEnd != selection.end.line) {
        previousSelectionStart = selection.start.line;
        previousSelectionEnd = selection.end.line;
        p.panel.webview.postMessage({ command: 'updateselection', content: { start: selection.start.line, end: selection.end.line } });
      }

    }
  });
})

export class FountainStatsPanelserializer implements vscode.WebviewPanelSerializer {
  async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
    // `state` is the state persisted using `setState` inside the webview

    // Restore the content of our webview.
    //
    // Make sure we hold on to the `webviewPanel` passed in here and
    // also restore any event listeners we need on it.

    let docuri = vscode.Uri.parse(state.docuri);
    loadWebView(docuri, webviewPanel);
  }
}