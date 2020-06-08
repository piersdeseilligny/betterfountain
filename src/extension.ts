'use strict';
import { getFountainConfig } from "./configloader";
import * as path from 'path';
import { ExtensionContext, languages, TextDocument } from 'vscode';
import * as vscode from 'vscode';
import * as afterparser from "./afterwriting-parser";
import { GeneratePdf } from "./pdf/pdf";
import { secondsToString, numberScenes } from "./utils";
import { retrieveScreenPlayStatistics, statsAsHtml } from "./statistics";

export class FountainOutlineTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	public readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<vscode.TreeItem | null> =
		new vscode.EventEmitter<vscode.TreeItem | null>();
	public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this.onDidChangeTreeDataEmitter.event;

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		//throw new Error("Method not implemented.");
		return element;
	}
	getChildren(element?: vscode.TreeItem): vscode.ProviderResult<any[]> {
		var elements: vscode.TreeItem[] = [];
		if (element == null) {
			for (let index = 0; index < parsedDocument.properties.structure.length; index++) {
				const token = parsedDocument.properties.structure[index];
				var item = new vscode.TreeItem(token.text);
				item.id = token.id;
				if (token.children != null) {
					item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
				}
				item.contextValue = "scene_heading"
				item.command = {
					command: 'fountain.jumpto',
					title: '',
					arguments: [token.id.substring(1)]
				};
				elements.push(item);
			}
		}

		//What follows is possibly the ugliest code I have ever written. My apologies.
		else if (element.collapsibleState != vscode.TreeItemCollapsibleState.None) {
			var ids: string[] = element.id.split("/");
			if (ids.length >= 2) {
				for (let index = 0; index < parsedDocument.properties.structure.length; index++) {
					const token = parsedDocument.properties.structure[index];
					var tokenids: string[] = token.id.split("/");
					if (tokenids[1] == ids[1]) {
						for (let index1 = 0; index1 < token.children.length; index1++) {
							const token1 = token.children[index1];
							var token1ids: string[] = token1.id.split("/");
							if (ids.length >= 3) {
								//START
								if (token1ids[2] == ids[2]) {
									for (let index2 = 0; index2 < token1.children.length; index2++) {
										const token2 = token1.children[index2];
										var token2ids: string[] = token2.id.split("/");
										if (ids.length >= 4) {
											//START
											if (token2ids[3] == ids[3]) {
												for (let index3 = 0; index3 < token2.children.length; index3++) {
													const token3 = token2.children[index3];
													var item = new vscode.TreeItem(token3.text);
													item.id = token3.id;
													var token3ids: string[] = token3.id.split("/");
													if (token3.children != null) {
														item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
													}
													item.command = {
														command: 'fountain.jumpto',
														title: '',
														arguments: [token3ids[4]]
													};
													elements.push(item);
												}
											}
											//END
										}
										else {
											var item = new vscode.TreeItem(token2.text);
											item.id = token2.id;
											if (token2.children != null) {
												item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
											}
											item.command = {
												command: 'fountain.jumpto',
												title: '',
												arguments: [token2ids[3]]
											};
											elements.push(item);
										}
									}
								}
								//END
							}
							else {
								var item = new vscode.TreeItem(token1.text);
								item.id = token1.id;
								if (token1.children != null) {
									item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
								}
								item.command = {
									command: 'fountain.jumpto',
									title: '',
									arguments: [token1ids[2]]
								};
								elements.push(item);
							}
						}
					}
				}
			}
		}
		return elements;
	}
	update(): void {
		this.onDidChangeTreeDataEmitter.fire(void 0);
	}
}
export class FountainCommandTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		//throw new Error("Method not implemented.");
		return element;
	}
	getChildren(/*element?: vscode.TreeItem*/): vscode.ProviderResult<any[]> {
		const elements: vscode.TreeItem[] = [];
		const treeExportPdf = new vscode.TreeItem("Export PDF");
		const treeLivePreview = new vscode.TreeItem("Show live preview");
		const numberScenes = new vscode.TreeItem("Number all scenes (replaces existing scene numbers)");
		const statistics = new vscode.TreeItem("Calculate screenplay statistics");
		treeExportPdf.command = {
			command: 'fountain.exportpdf',
			title: ''
		};
		treeLivePreview.command = {
			command: 'fountain.livepreview',
			title: ''
		};
		numberScenes.command = {
			command: 'fountain.numberScenes',
			title: ''
		}
		statistics.command = {
			command: 'fountain.statistics',
			title: ''
		};
		elements.push(treeExportPdf);
		elements.push(treeLivePreview);
		elements.push(numberScenes);
		elements.push(statistics);
		return elements;
	}
}

//hierarchyend is the last line of the token's hierarchy. Last line of document for the root, last line of current section, etc...



var previewpanel: vscode.WebviewPanel;
import fs = require('fs');
import { FountainFoldingRangeProvider } from "./providers/Folding";
import { FountainCompletionProvider } from "./providers/Completion";
import { FountainSymbolProvider } from "./providers/Symbols";
import { showDecorations, clearDecorations } from "./providers/Decorations";
import { TopmostLineMonitor } from "./utils/topMostLineMonitor";

const webviewHtml = fs.readFileSync(__dirname + path.sep + 'webview.html', 'utf8');
function updateWebView(titlepage: string, script: string) {

	var config = getFountainConfig(lastFountainEditor);
	var directConfig = vscode.workspace.getConfiguration("fountain.pdf", vscode.window.activeTextEditor.document.uri);
	var pageClasses = "innerpage";
	if (config.scenes_numbers == "left")
		pageClasses = "innerpage numberonleft";
	else if (config.scenes_numbers == "right")
		pageClasses = "innerpage numberonright";
	else if (config.scenes_numbers == "both")
		pageClasses = "innerpage numberonleft numberonright";

		var themeClass=directConfig.previewTheme + "_theme";
		if(directConfig.previewTexture){
			themeClass+= " textured";
		}

	var cleandir = __dirname.split(String.fromCharCode(92)).join("/");
	previewpanel.webview.html = webviewHtml.replace("$TITLEPAGE$", titlepage)
		.replace("$SCRIPT$", script)
		.replace("$SCRIPTCLASS$", pageClasses)
		.replace(/\$ROOTDIR\$/g, cleandir)
		.replace("$PAGETHEME$", themeClass);

	parseDocument(vscode.window.activeTextEditor.document);
}


/**
 * Approximates length of the screenplay based on the overall length of dialogue and action tokens
 */

function updateStatus(lengthAction: number, lengthDialogue: number): void {
	if (durationStatus != undefined) {

		if (vscode.window.activeTextEditor != undefined && vscode.window.activeTextEditor.document.languageId == "fountain") {
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
var lastFountainEditor: vscode.Uri;

let diagnosticCollection = languages.createDiagnosticCollection("fountain");
let diagnostics: vscode.Diagnostic[] = [];
let isscrolling = true;
const _topmostLineMonitor = new TopmostLineMonitor();

export function activate(context: ExtensionContext) {
	//Register for outline tree view
	vscode.window.registerTreeDataProvider("fountain-outline", outlineViewProvider)
	vscode.window.createTreeView("fountain-outline", { treeDataProvider: outlineViewProvider });

	//Register command tree view
	vscode.window.registerTreeDataProvider("fountain-commands", outlineViewProvider)
	vscode.window.createTreeView("fountain-commands", { treeDataProvider: commandViewProvider });

	//Register for line duration length
	durationStatus = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	context.subscriptions.push(durationStatus);

	//Register for live preview
	context.subscriptions.push(vscode.commands.registerCommand('fountain.livepreview', () => {

		// Create and show a new webview

		previewpanel = vscode.window.createWebviewPanel(
			'fountainPreview', // Identifies the type of the webview. Used internally
			"Screenplay preview", // Title of the panel displayed to the user
			vscode.ViewColumn.Three, // Editor column to show the new webview panel in.
			{ enableScripts: true } // Webview options. More on these later.
		);
		previewpanel.webview.onDidReceiveMessage(message => {
			if (message.command == "updateFontResult") {
				if (message.content == false && parsedDocument.properties.fontLine != -1) {
					//The font could not be rendered
					diagnostics = []
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(parsedDocument.properties.fontLine, 0), new vscode.Position(parsedDocument.properties.fontLine, 5)), "This font could not be rendered in the live preview. Is it installed?", vscode.DiagnosticSeverity.Error));
					diagnosticCollection.set(vscode.window.activeTextEditor.document.uri, diagnostics);
				}
				else {
					//Yay, the font has been rendered
					diagnosticCollection.set(vscode.window.activeTextEditor.document.uri, []);
				}
			}
			if(message.command = "revealLine"){
				isscrolling = true;
				console.log("jump to line:"+message.content);
				let editor = vscode.window.activeTextEditor;
				const sourceLine = Math.floor(message.content);
				const fraction = message.content - sourceLine;
				const text = editor.document.lineAt(sourceLine).text;
				const start = Math.floor(fraction * text.length);
				editor.revealRange(
					new vscode.Range(sourceLine, start, sourceLine + 1, 0),
					vscode.TextEditorRevealType.AtTop);
				}
		});
		var rawcontent = vscode.window.activeTextEditor.document.getText();
		var output = afterparser.parse(rawcontent, getFountainConfig(lastFountainEditor), true);
		updateWebView(output.titleHtml, output.scriptHtml);
	}));

	//Jump to line command
	context.subscriptions.push(vscode.commands.registerCommand('fountain.jumpto', (args) => {
		let editor = vscode.window.activeTextEditor;
		let range = editor.document.lineAt(Number(args)).range;
		editor.selection = new vscode.Selection(range.start, range.start);
		editor.revealRange(range, vscode.TextEditorRevealType.AtTop);
		//If live screenplay is visible scroll to it with
		if (previewpanel != null) {
			previewpanel.webview.postMessage({ command: 'scrollTo', content: args });
		}
	}));


	context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdf', async () => {
		var canceled = false;
		/*if(vscode.window.activeTextEditor.document.isDirty){
			await vscode.window.showWarningMessage("The PDF will not include unsaved changes!", {modal:true}, "Export anyway", "Save document first").then((value:any)=>{
				canceled = (value==undefined);
				switch (value) {
					case "Export anyway":
						break;
					case "Save document first":
						if(!vscode.window.activeTextEditor.document.save() && vscode.window.activeTextEditor.document.isDirty)
						vscode.window.showInformationMessage("Document could not be saved!")
						break;
				}
			});
		}*/
		if (canceled) return;
		var saveuri = vscode.Uri.file(vscode.window.activeTextEditor.document.fileName.replace('.fountain', ''));
		var filepath = await vscode.window.showSaveDialog(
			{
				filters: { "PDF File": ["pdf"] },
				defaultUri: saveuri
			});
		if (filepath == undefined) return;

		var config = getFountainConfig(lastFountainEditor);
		var parsed = afterparser.parse(vscode.window.activeTextEditor.document.getText(), getFountainConfig(lastFountainEditor), false);
		GeneratePdf(filepath.fsPath, config, parsed, function (output: any) {
			if (output.errno != undefined) {
				vscode.window.showErrorMessage("Failed to export PDF!")
			}
			else {
				vscode.window.showInformationMessage("Exported PDF!");
			}
		});
	}));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.numberScenes', numberScenes));
	context.subscriptions.push(vscode.commands.registerCommand('fountain.statistics', () => {
		const statsPanel = vscode.window.createWebviewPanel('Screenplay statistics', 'Screenplay statistics', -1)
		statsPanel.webview.html = `Calculating screenplay statistics...`
		const stats = retrieveScreenPlayStatistics(vscode.window.activeTextEditor.document.getText())
		const statsHTML = statsAsHtml(stats)
		statsPanel.webview.html = statsHTML
	}));

	vscode.workspace.onWillSaveTextDocument(() => {
		const config = getFountainConfig(lastFountainEditor);
		if (config.number_scenes_on_save === true) {
			numberScenes();
		}
	})

	vscode.commands.registerCommand('type', (args) => {

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

	//Setup custom folding mechanism
	languages.registerFoldingRangeProvider({ scheme: 'file', language: 'fountain' }, new FountainFoldingRangeProvider());

	//Setup autocomplete
	languages.registerCompletionItemProvider({ scheme: 'file', language: 'fountain' }, new FountainCompletionProvider(), '\n', '-', ' ');

	//Setup symbols (outline)
	languages.registerDocumentSymbolProvider({ scheme: 'file', language: 'fountain' },  new FountainSymbolProvider());


	//parse the document
	if(vscode.window.activeTextEditor != undefined && vscode.window.activeTextEditor.document != undefined)
	parseDocument(vscode.window.activeTextEditor.document);

}

_topmostLineMonitor.onDidChanged(event => {
	scrollTo(event.line);
});

function scrollTo(topLine: number) {

	if (isscrolling) {
		isscrolling = false;
		return;
	}

	if (previewpanel != null) {
		previewpanel.webview.postMessage({ command: 'jumpToLine', content: topLine,  linescount: vscode.window.activeTextEditor.document.lineCount });
	}
}

vscode.workspace.onDidChangeTextDocument(change => {
	parseDocument(change.document);
})

vscode.workspace.onDidChangeConfiguration(change => {
	if (change.affectsConfiguration("fountain.pdf")) {
		if (previewpanel) {
			var config = getFountainConfig(lastFountainEditor);
			var directConfig = vscode.workspace.getConfiguration("fountain.pdf", lastFountainEditor);
			var pageClasses = "innerpage";
			if (config.scenes_numbers == "left")
				pageClasses = "innerpage numberonleft";
			else if (config.scenes_numbers == "right")
				pageClasses = "innerpage numberonright";
			else if (config.scenes_numbers == "both")
				pageClasses = "innerpage numberonleft numberonright";

			var themeClass=directConfig.previewTheme + "_theme";
			if(directConfig.previewTexture){
				themeClass+= " textured";
			}

			previewpanel.webview.postMessage({ command: 'updatePageClasses', content: pageClasses });
			previewpanel.webview.postMessage({ command: 'changeTheme', content: themeClass });
		}

		var rawcontent = vscode.window.activeTextEditor.document.getText();
		var output = afterparser.parse(rawcontent, getFountainConfig(lastFountainEditor), true);
		updateWebView(output.titleHtml, output.scriptHtml);
	}
})

//var lastFountainDocument:TextDocument;
export var parsedDocument: afterparser.parseoutput;

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

function parseDocument(document: TextDocument) {
	console.time("parsing");
	clearDecorations();
	if (vscode.window.activeTextEditor.document.uri == document.uri) {

		var updatehtml = (previewpanel != null && document.languageId == "fountain");
		var output = afterparser.parse(document.getText(), getFountainConfig(lastFountainEditor), updatehtml);

		if (updatehtml) {
			//lastFountainDocument = document;
			previewpanel.webview.postMessage({ command: 'updateTitle', content: output.titleHtml });
			previewpanel.webview.postMessage({ command: 'updateScript', content: output.scriptHtml });
		}
		parsedDocument = output;
		var tokenlength = 0;
		const decorsDialogue: vscode.DecorationOptions[] = [];
		tokenlength = 0;
		parsedDocument.properties.titleKeys = [];
		var fontTokenExists = false;
		while (tokenlength < output.title_page.length) {
			if (output.title_page[tokenlength].type == "font" && output.title_page[tokenlength].text.trim() != "") {
				parsedDocument.properties.fontLine = output.title_page[tokenlength].line;
				var fontname = output.title_page[tokenlength].text;
				previewpanel.webview.postMessage({ command: 'updateFont', content: fontname });
				fontTokenExists = true;
				fontTokenExisted = true;
			}
			tokenlength++;
		}
		if (!fontTokenExists && fontTokenExisted) {
			previewpanel.webview.postMessage({ command: 'removeFont' });
			fontTokenExisted = false;
			diagnosticCollection.set(vscode.window.activeTextEditor.document.uri, []);
		}
		vscode.window.activeTextEditor.setDecorations(decortypesDialogue, decorsDialogue);
	}

	if (document.languageId == "fountain")
		outlineViewProvider.update();
	updateStatus(output.lengthAction, output.lengthDialogue);
	showDecorations();
	console.time("parsing");
}

vscode.window.onDidChangeActiveTextEditor(change => {
	if (change.document.languageId == "fountain") {
		parseDocument(change.document);
		lastFountainEditor = change.document.uri;
	}
})

vscode.window.onDidChangeTextEditorSelection(change => {
	var config = getFountainConfig(lastFountainEditor);
	if (config.synchronized_markup_and_preview) {
	var selection = change.selections[0];
		if (previewpanel != null) {
			previewpanel.webview.postMessage({ command: 'jumpToLine', content: selection.active.line, linescount: change.textEditor.document.lineCount});
		}
	}
})

