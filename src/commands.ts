'use strict';
import { parsedDocuments, outlineViewProvider } from "./extension";
import { previews } from "./providers/Preview";
import { getFountainConfig, ExportConfig, changeFountainUIPersistence, uiPersistence } from "./configloader";
import * as vscode from 'vscode';
import * as afterparser from "./afterwriting-parser";
import { GeneratePdf } from "./pdf/pdf";
import { getActiveFountainDocument, getEditor, openFile, shiftScenes } from "./utils";
import * as telemetry from "./telemetry";

export async function exportPdf(showSaveDialog: boolean = true, openFileOnSave: boolean = false, highlightCharacters = false) {
  var canceled = false;
  if (canceled) return;
  var editor = getEditor(getActiveFountainDocument());


  var config = getFountainConfig(getActiveFountainDocument());
  telemetry.reportTelemetry("command:fountain.exportpdf");

  var parsed = await afterparser.parse(editor.document.getText(), config, false);

  var exportconfig: ExportConfig = { highlighted_characters: [] };
  var filename = editor.document.fileName.replace(/(\.(((better)?fountain)|spmd|txt))$/, ''); //screenplay.fountain -> screenplay
  if (highlightCharacters) {
    var highlighted_characters = await vscode.window.showQuickPick(Array.from(parsed.properties.characters.keys()), { canPickMany: true });
    exportconfig.highlighted_characters = highlighted_characters;

    if (highlighted_characters.length > 0) {
      var filenameCharacters = [...highlighted_characters]; //clone array
      if (filenameCharacters.length > 3) {
        filenameCharacters.length = 3;
        filenameCharacters.push('+' + (highlighted_characters.length - 3)); //add "+n" if there's over 3 highlighted characters
      }
      filename += '(' + filenameCharacters.map(v => v.replace(' ', '')).join(',') + ')'; //remove spaces from names and join
    }
  }
  filename += '.pdf'; //screenplay -> screenplay.pdf

  var saveuri = vscode.Uri.file(filename);
  var filepath: vscode.Uri = undefined;
  if (showSaveDialog) {
    filepath = await vscode.window.showSaveDialog(
      {
        filters: { "PDF File": ["pdf"] },
        defaultUri: saveuri
      });
  } else {
    filepath = saveuri;
  }
  if (filepath == undefined) return;
  vscode.window.withProgress({ title: "Exporting PDF...", location: vscode.ProgressLocation.Notification }, async (progress) => {
    GeneratePdf(filepath.fsPath, config, exportconfig, parsed, progress);
  });
  if (openFileOnSave) { openFile(filepath.fsPath); }
}

var lastShiftedParseId = "";

export function shiftScenesUpDn (direction: number) {
  var editor = getEditor(getActiveFountainDocument());
  var parsed = parsedDocuments.get(editor.document.uri.toString());

  /* prevent the shiftScenes() being processed again before the document is reparsed from the previous 
    shiftScenes() (like when holding down the command key) so the selection doesn't slip */
  if (lastShiftedParseId == parsed.parseTime + "_" + direction)
    return;

  shiftScenes(editor, parsed, direction);
  telemetry.reportTelemetry("command:fountain.shiftScenes");
  lastShiftedParseId = parsed.parseTime + "_" + direction;
}

export function debugTokens() {
  const uri = getActiveFountainDocument();
  const fountain = getEditor(uri).document.getText();
  vscode.workspace.openTextDocument({ language: "json" })
    .then(doc => vscode.window.showTextDocument(doc))
    .then(editor => {
      const editBuilder = (textEdit: vscode.TextEditorEdit) => {
        textEdit.insert(new vscode.Position(0, 0), JSON.stringify(afterparser.parse(fountain, getFountainConfig(uri), false), null, 4));
      };
      return editor.edit(editBuilder, {
        undoStopBefore: true,
        undoStopAfter: false
      });
    });
}

export function visibleItems() {
  const quickpick = vscode.window.createQuickPick();
  quickpick.canSelectMany = true;

  quickpick.items = [{
    alwaysShow: true,
    label: "Notes",
    detail: "[[Text enclosed between two brackets]]",
    picked: uiPersistence.outline_visibleNotes
  }, {
    alwaysShow: true,
    label: "Synopses",
    detail: "= Any line which starts like this",
    picked: uiPersistence.outline_visibleSynopses
  }, {
    alwaysShow: true,
    label: "Sections",
    detail: "# Sections begin with one or more '#'",
    picked: uiPersistence.outline_visibleSections
  }, {
    alwaysShow: true,
    label: "Scenes",
    detail: "Any line starting with INT. or EXT. is a scene. Can also be forced by starting a line with '.'",
    picked: uiPersistence.outline_visibleScenes
  }];
  quickpick.selectedItems = quickpick.items.filter(item => item.picked);
  quickpick.onDidChangeSelection((e) => {
    let visibleScenes = false;
    let visibleSections = false;
    let visibleSynopses = false;
    let visibleNotes = false;
    for (let i = 0; i < e.length; i++) {
      if (e[i].label == "Notes") visibleNotes = true;
      if (e[i].label == "Scenes") visibleScenes = true;
      if (e[i].label == "Sections") visibleSections = true;
      if (e[i].label == "Synopses") visibleSynopses = true;
    }
    changeFountainUIPersistence("outline_visibleNotes", visibleNotes);
    changeFountainUIPersistence("outline_visibleScenes", visibleScenes);
    changeFountainUIPersistence("outline_visibleSections", visibleSections);
    changeFountainUIPersistence("outline_visibleSynopses", visibleSynopses);
    outlineViewProvider.update();
  });
  quickpick.show();
}

export function jumpTo(args: any) {
  const editor = getEditor(getActiveFountainDocument());
  const range = editor.document.lineAt(Number(args)).range;
  editor.selection = new vscode.Selection(range.start, range.start);
  editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
  //If live screenplay is visible scroll to it with
  if (getFountainConfig(editor.document.uri).synchronized_markup_and_preview) {
    previews.forEach(p => {
      if (p.uri == editor.document.uri.toString())
        p.panel.webview.postMessage({ command: 'scrollTo', content: args });
    });
  }
  telemetry.reportTelemetry("command:fountain.jumpto");
}