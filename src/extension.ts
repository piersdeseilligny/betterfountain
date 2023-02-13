'use strict';
import { getFountainConfig, changeFountainUIPersistence, uiPersistence, initFountainUIPersistence, ExportConfig } from "./configloader";
import { ExtensionContext, languages, TextDocument } from 'vscode';
import * as vscode from 'vscode';
import * as afterparser from "./afterwriting-parser";
import { GeneratePdf } from "./pdf/pdf";
import { secondsToString, overwriteSceneNumbers, updateSceneNumbers, openFile, shiftScenes } from "./utils";
import * as telemetry from "./telemetry";


export class FountainCommandTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		//throw new Error("Method not implemented.");
		return element;
	}
	getChildren(/*element?: vscode.TreeItem*/): vscode.ProviderResult<any[]> {
		const elements: vscode.TreeItem[] = [];
		const treeExportPdf = new vscode.TreeItem("Export PDF");
		treeExportPdf.iconPath = new vscode.ThemeIcon("export");
		//const treeExportPdfDebug = new vscode.TreeItem("Export PDF with default name");
		const treeExportPdfCustom= new vscode.TreeItem("Export PDF with highlighted characters");
		treeExportPdfCustom.iconPath = new vscode.ThemeIcon("export");
		const treeExportHtml = new vscode.TreeItem("Export HTML");
		treeExportHtml.iconPath = new vscode.ThemeIcon("export");
		treeExportHtml.tooltip = "Export live preview as .html document"
		treeExportHtml.iconPath = new vscode.ThemeIcon("export");
		const treeLivePreview = new vscode.TreeItem("Show live preview");
		treeLivePreview.iconPath = new vscode.ThemeIcon("open-preview");
		const numberScenesOverwrite = new vscode.TreeItem("Number scenes - overwrite");
		numberScenesOverwrite.tooltip = 'Replaces existing scene numbers.';
		numberScenesOverwrite.iconPath = new vscode.ThemeIcon("list-ordered");
		const numberScenesUpdate = new vscode.TreeItem("Number scenes - update");
		numberScenesUpdate.iconPath = new vscode.ThemeIcon("list-ordered");
		numberScenesUpdate.tooltip = 'Retains existing numbers as much as possible. Fills gaps and re-numbers moved scenes.';
		const statistics = new vscode.TreeItem("Calculate screenplay statistics");
		statistics.iconPath = new vscode.ThemeIcon("pulse");
		treeExportPdf.command = {
			command: 'fountain.exportpdf',
			title: ''
		};
		/*treeExportPdfDebug.command = {
			command: 'fountain.exportpdfdebug',
			title: ''
		};*/
		treeExportPdfCustom.command = {
			command: 'fountain.exportpdfcustom',
			title: ''
		};
		treeExportHtml.command = {
			command: 'fountain.exporthtml',
			title: ''
		};
		treeLivePreview.command = {
			command: 'fountain.livepreview',
			title: ''
		};
		treeLivePreview.command = {
			command: 'fountain.livepreviewstatic',
			title: ''
		};
		numberScenesOverwrite.command = {
			command: 'fountain.overwriteSceneNumbers',
			title: ''
		};
		numberScenesUpdate.command = {
			command: 'fountain.updateSceneNumbers',
			title: ''
		};
		statistics.command = {
			command: 'fountain.statistics',
			title: ''
		};
		elements.push(treeExportPdf);
	//	elements.push(treeExportPdfDebug);
		elements.push(treeExportPdfCustom);
		elements.push(treeExportHtml);
		elements.push(treeLivePreview);
		elements.push(statistics);
		elements.push(numberScenesOverwrite);
		elements.push(numberScenesUpdate);

		return elements;
	}
}





import { FountainFoldingRangeProvider } from "./providers/Folding";
import { FountainCompletionProvider } from "./providers/Completion";
import { FountainSymbolProvider } from "./providers/Symbols";
import { showDecorations, clearDecorations } from "./providers/Decorations";

import { createPreviewPanel, previews, FountainPreviewSerializer, getPreviewsToUpdate } from "./providers/Preview";
import { createStatisticsPanel, FountainStatsPanelserializer as FountainStatsPanelSerializer, getStatisticsPanels, refreshPanel, updateDocumentVersion } from "./providers/Statistics";
import { FountainOutlineTreeDataProvider } from "./providers/Outline";
import { performance } from "perf_hooks";
import { exportHtml } from "./providers/StaticHtml";
import { FountainCheatSheetWebviewViewProvider } from "./providers/Cheatsheet";
import { createPdfPreviewPanel } from "./providers/PdfPreview";


/**
 * Approximates length of the screenplay based on the overall length of dialogue and action tokens
 */

function updateStatus(lengthAction: number, lengthDialogue: number): void {
	if (durationStatus != undefined) {

		if (activeFountainDocument() != undefined) {
			durationStatus.show();
			//lengthDialogue is in syllables, lengthAction is in characters
			var durationDialogue = lengthDialogue;
			var durationAction = lengthAction;
			durationStatus.tooltip = "Dialogue: " + secondsToString(durationDialogue) + "\nAction: " + secondsToString(durationAction);
			//durationStatus.text = "charcount: " + (lengthAction)+"c"
			durationStatus.text = secondsToString(durationDialogue + durationAction);
		}
		else {
			durationStatus.hide();
		}
	}
}

var durationStatus: vscode.StatusBarItem;
const outlineViewProvider: FountainOutlineTreeDataProvider = new FountainOutlineTreeDataProvider();
const commandViewProvider: FountainCommandTreeDataProvider = new FountainCommandTreeDataProvider();
var lastShiftedParseId = "";

export let diagnosticCollection = languages.createDiagnosticCollection("fountain");
export let diagnostics: vscode.Diagnostic[] = [];

//return the relevant fountain document for the currently selected preview or text editor
export function activeFountainDocument(): vscode.Uri{
	//first check if any previews have focus
	for (let i = 0; i < previews.length; i++) {
		if(previews[i].panel.active)
			return vscode.Uri.parse(previews[i].uri);
	}
	//no previews were active, is activeTextEditor a fountain document?
	if(vscode.window.activeTextEditor != undefined && vscode.window.activeTextEditor.document.languageId == "fountain"){
		return vscode.window.activeTextEditor.document.uri;
	}
	//As a last resort, check if there are any visible fountain text editors
	for (let i = 0; i < vscode.window.visibleTextEditors.length; i++) {
		if(vscode.window.visibleTextEditors[i].document.languageId == "fountain")
			return vscode.window.visibleTextEditors[i].document.uri;
	}
	//all hope is lost
	return undefined;
}

export function getEditor(uri:vscode.Uri): vscode.TextEditor{
	//search visible text editors
	for (let i = 0; i < vscode.window.visibleTextEditors.length; i++) {
		if(vscode.window.visibleTextEditors[i].document.uri.toString() == uri.toString())
			return vscode.window.visibleTextEditors[i];
	}
	//the editor was not visible,
	return undefined;
}
export async function exportPdf(showSaveDialog:boolean = true, openFileOnSave:boolean = false, highlightCharacters = false) {
	var canceled = false;
	if (canceled) return;
	var editor = getEditor(activeFountainDocument());


	var config = getFountainConfig(activeFountainDocument());
	telemetry.reportTelemetry("command:fountain.exportpdf");

	var parsed = await afterparser.parse(editor.document.getText(), config, false);
	
	var exportconfig : ExportConfig = {highlighted_characters: []}
	var filename = editor.document.fileName.replace(/(\.(((better)?fountain)|spmd|txt))$/, ''); //screenplay.fountain -> screenplay
	if (highlightCharacters) {
		var highlighted_characters = await vscode.window.showQuickPick(Array.from(parsed.properties.characters.keys()) ,{canPickMany:true});
		exportconfig.highlighted_characters = highlighted_characters;

		if(highlighted_characters.length>0){
			var filenameCharacters = [...highlighted_characters]; //clone array
			if(filenameCharacters.length>3){
				filenameCharacters.length=3;
				filenameCharacters.push('+'+(highlighted_characters.length-3)) //add "+n" if there's over 3 highlighted characters
			}
			filename += '(' + filenameCharacters.map(v => v.replace(' ', '')).join(',') + ')'; //remove spaces from names and join
		}
	}
	filename+='.pdf'; //screenplay -> screenplay.pdf
	
	var saveuri = vscode.Uri.file(filename);
	var filepath:vscode.Uri = undefined;
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
	vscode.window.withProgress({ title: "Exporting PDF...", location: vscode.ProgressLocation.Notification }, async progress => {
		GeneratePdf(filepath.fsPath, config, exportconfig, parsed, progress);
	});
	if (openFileOnSave) {openFile(filepath.fsPath)}
}
	

export function activate(context: ExtensionContext) {

	//Init telemetry
	telemetry.initTelemetry();

	//Register for outline tree view
	vscode.window.registerTreeDataProvider("fountain-outline", outlineViewProvider)
	outlineViewProvider.treeView = vscode.window.createTreeView("fountain-outline", { treeDataProvider: outlineViewProvider, showCollapseAll: true });

	//Register command tree view
	vscode.window.registerTreeDataProvider("fountain-commands", outlineViewProvider)
	vscode.window.createTreeView("fountain-commands", { treeDataProvider: commandViewProvider });

	//Register cheatsheet web view
	const cheatsheetViewProvider: FountainCheatSheetWebviewViewProvider = new FountainCheatSheetWebviewViewProvider(context.extensionUri);
	vscode.window.registerWebviewViewProvider("fountain-cheatsheet",cheatsheetViewProvider);

	//Register for line duration length
	durationStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(durationStatus);

	//Register for live preview (dynamic)
	context.subscriptions.push(vscode.commands.registerCommand('fountain.livepreview', () => {
		// Create and show a new dynamic webview for the active text editor
		createPreviewPanel(vscode.window.activeTextEditor,true);
		telemetry.reportTelemetry("command:fountain.livepreview");
	}));
	//Register for live preview (static)
	context.subscriptions.push(vscode.commands.registerCommand('fountain.livepreviewstatic', () => {
		// Create and show a new dynamic webview for the active text editor
		createPreviewPanel(vscode.window.activeTextEditor,false);
		telemetry.reportTelemetry("command:fountain.livepreviewstatic");
	}));
	//Register for PDF preview
	context.subscriptions.push(vscode.commands.registerCommand('fountain.pdfpreview', () => {
		// Create and show a new dynamic webview for the active text editor
		createPdfPreviewPanel(getEditor(activeFountainDocument()));
	}));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.statistics', async () => {
		createStatisticsPanel(getEditor(activeFountainDocument()));
	}));

	//Jump to line command
	context.subscriptions.push(vscode.commands.registerCommand('fountain.jumpto', (args) => {
		let editor = getEditor(activeFountainDocument());
		let range = editor.document.lineAt(Number(args)).range;
		editor.selection = new vscode.Selection(range.start, range.start);
		editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
		//If live screenplay is visible scroll to it with
		if (getFountainConfig(editor.document.uri).synchronized_markup_and_preview){
			previews.forEach(p => {
				if(p.uri == editor.document.uri.toString())
					p.panel.webview.postMessage({ command: 'scrollTo', content: args });
			});
		}
		telemetry.reportTelemetry("command:fountain.jumpto");
	}));


	context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdf', async () => exportPdf()));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdfdebug', async () => exportPdf(false,true)));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdfcustom', async () => exportPdf(true,false,true)));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.exporthtml', async () => exportHtml()));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.overwriteSceneNumbers', overwriteSceneNumbers));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.updateSceneNumbers', updateSceneNumbers));

	initFountainUIPersistence(context); //create the ui persistence save file
	context.subscriptions.push(vscode.commands.registerCommand('fountain.outline.visibleitems', ()=>{

		let quickpick = vscode.window.createQuickPick();
		quickpick.canSelectMany = true;

		quickpick.items = [{
			alwaysShow:true,
			label: "Notes",
			detail: "[[Text enclosed between two brackets]]",
			picked: uiPersistence.outline_visibleNotes
		},{
			alwaysShow:true,
			label:"Synopses",
			detail: "= Any line which starts like this",
			picked: uiPersistence.outline_visibleSynopses
		},{
			alwaysShow:true,
			label:"Sections",
			detail: "# Sections begin with one or more '#'",
			picked: uiPersistence.outline_visibleSections
		},{
			alwaysShow:true,
			label:"Scenes",
			detail: "Any line starting with INT. or EXT. is a scene. Can also be forced by starting a line with '.'",
			picked: uiPersistence.outline_visibleScenes
		}];
		quickpick.selectedItems = quickpick.items.filter(item => item.picked);
		quickpick.onDidChangeSelection((e)=>{
			let visibleScenes = false;
			let visibleSections = false;
			let visibleSynopses = false;
			let visibleNotes = false;
			for (let i = 0; i < e.length; i++) {
				if(e[i].label == "Notes") visibleNotes = true;
				if(e[i].label == "Scenes") visibleScenes = true;
				if(e[i].label == "Sections") visibleSections = true;
				if(e[i].label == "Synopses") visibleSynopses = true;
			}
			changeFountainUIPersistence("outline_visibleNotes", visibleNotes);
			changeFountainUIPersistence("outline_visibleScenes", visibleScenes);
			changeFountainUIPersistence("outline_visibleSections", visibleSections);
			changeFountainUIPersistence("outline_visibleSynopses", visibleSynopses);
			outlineViewProvider.update();
		});
		quickpick.show();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fountain.outline.reveal', ()=>{
		outlineViewProvider.reveal();
		telemetry.reportTelemetry("command:fountain.outline.reveal");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fountain.debugtokens', ()=>{
		let uri = activeFountainDocument();
		let fountain = getEditor(uri).document.getText();
		vscode.workspace.openTextDocument({language:"json"})
		.then(doc => vscode.window.showTextDocument(doc))
        .then(editor => {
            let editBuilder = (textEdit:vscode.TextEditorEdit) => {	
                textEdit.insert(new vscode.Position(0,0), JSON.stringify(afterparser.parse(fountain, getFountainConfig(uri), false), null, 4));
			};
            return editor.edit( editBuilder, {
                    undoStopBefore: true,
                    undoStopAfter: false
                });
        });
	}));

	const shiftScenesUpDn = (direction: number) => {
		var editor = getEditor(activeFountainDocument());
		var parsed = parsedDocuments.get(editor.document.uri.toString());

		/* prevent the shiftScenes() being processed again before the document is reparsed from the previous 
			shiftScenes() (like when holding down the command key) so the selection doesn't slip */
		if (lastShiftedParseId == parsed.parseTime + "_" + direction)
			return;

		shiftScenes(editor, parsed, direction);
		telemetry.reportTelemetry("command:fountain.shiftScenes");
		lastShiftedParseId = parsed.parseTime + "_" + direction;
	};
	context.subscriptions.push(vscode.commands.registerCommand('fountain.shiftScenesUp', () => shiftScenesUpDn(-1)));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.shiftScenesDown', () => shiftScenesUpDn(1)));

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
	if (vscode.window.activeTextEditor != undefined && vscode.window.activeTextEditor.document != undefined && vscode.window.activeTextEditor.document.languageId=="fountain")
		parseDocument(vscode.window.activeTextEditor.document);

	vscode.window.registerWebviewPanelSerializer('fountain-preview', new FountainPreviewSerializer());
	vscode.window.registerWebviewPanelSerializer('fountain-statistics', new FountainStatsPanelSerializer());
}

	var disposeTyping:vscode.Disposable;
	function registerTyping() {
		try {
			const config = getFountainConfig(activeFountainDocument())
			if (config.parenthetical_newline_helper) {
				disposeTyping= vscode.commands.registerCommand('type', (args) => {
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
	if (change.document.languageId=="fountain"){
		parseDocument(change.document);
		updateDocumentVersion(change.document.uri, change.document.version);
	}
});

vscode.workspace.onDidChangeConfiguration(change => {
	if(change.affectsConfiguration("fountain.general.parentheticalNewLineHelper")){
		let config = getFountainConfig(activeFountainDocument());
		if(disposeTyping) disposeTyping.dispose();
		if(config.parenthetical_newline_helper){
			registerTyping();
		}
	}
})


//var lastFountainDocument:TextDocument;
export var parsedDocuments = new Map<string, afterparser.parseoutput>();
let lastParsedUri = "";

export function activeParsedDocument(): afterparser.parseoutput {
	var texteditor = getEditor(activeFountainDocument());
	if(texteditor){
		return parsedDocuments.get(texteditor.document.uri.toString()); 
	}
	else{
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
const decortypesDialogue = vscode.window.createTextEditorDecorationType({
});

let parseTelemetryLimiter = 5;
let parseTelemetryFrequency = 5;

export function parseDocument(document: TextDocument) {
	let t0 = performance.now()

	clearDecorations();

	var previewsToUpdate = getPreviewsToUpdate(document.uri)
	var output = afterparser.parse(document.getText(), getFountainConfig(document.uri), previewsToUpdate.length>0)

	
	if (previewsToUpdate) {
		//lastFountainDocument = document;
		for (let i = 0; i < previewsToUpdate.length; i++) {
			previewsToUpdate[i].panel.webview.postMessage({ command: 'updateTitle', content: output.titleHtml });
			previewsToUpdate[i].panel.webview.postMessage({ command: 'updateScript', content: output.scriptHtml });
			
			if(previewsToUpdate[i].dynamic) {

				previewsToUpdate[i].uri = document.uri.toString();
				previewsToUpdate[i].panel.webview.postMessage({ command: 'setstate', uri: previewsToUpdate[i].uri});
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
	if(output.title_page){
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
	if(editor) editor.setDecorations(decortypesDialogue, decorsDialogue)

	if (document.languageId == "fountain")
		outlineViewProvider.update();
	updateStatus(output.lengthAction, output.lengthDialogue);
	showDecorations(document.uri);

	let t1 = performance.now()
	let parseTime = t1-t0;
	if(parseTelemetryLimiter == parseTelemetryFrequency){
		telemetry.reportTelemetry("afterparser.parsing", undefined, { linecount: document.lineCount, parseduration: parseTime });
	}
	parseTelemetryLimiter--;
	if(parseTelemetryLimiter == 0 ) parseTelemetryLimiter = parseTelemetryFrequency;

}

vscode.window.onDidChangeActiveTextEditor(change => {
	if(change == undefined || change.document == undefined) return;
	if (change.document.languageId == "fountain") {
		parseDocument(change.document);
		/*if(previewpanels.has(change.document.uri.toString())){
			var preview = previewpanels.get(change.document.uri.toString());
			if(!preview.visible && preview.viewColumn!=undefined)
				preview.reveal(preview.viewColumn);
		}*/
	}
})

vscode.workspace.onDidSaveTextDocument(e =>{
	if(e.languageId != "fountain") return;
	let config = getFountainConfig(e.uri);
	if(config.refresh_stats_on_save){
		let statsPanel = getStatisticsPanels(e.uri);
		for (const sp of statsPanel) {
			refreshPanel(sp.panel, e, config);
		}
	}
});



vscode.workspace.onDidCloseTextDocument(e=>{
	parsedDocuments.delete(e.uri.toString());
});