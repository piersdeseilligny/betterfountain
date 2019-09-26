'use strict';
import { getFountainConfig } from "./configloader";
import * as path from 'path';
import { ExtensionContext, languages, FoldingRangeProvider, TextDocument, FoldingRange } from 'vscode';
import * as vscode from 'vscode';
import * as afterparser from "./afterwriting-parser";
import { GeneratePdf } from "./pdf/pdf";
import * as username from 'username';
import { addForceSymbolToCharacter, getCharactersWhoSpokeBeforeLast, numberScenes, secondsToString } from "./utils";
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

var previewpanel: vscode.WebviewPanel;
import fs = require('fs');
const fontFinder = require('font-finder');

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
			var durationAction = lengthAction / 20;
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
var userfullname: string;
let diagnosticCollection = languages.createDiagnosticCollection("fountain");
let diagnostics: vscode.Diagnostic[] = [];
var fontnames: any[];
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

	//Load fonts for autocomplete
	(async () => {
		var fontlist = await fontFinder.list()
		fontnames = Object.keys(fontlist);
	})();

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
	languages.registerFoldingRangeProvider({ scheme: 'file', language: 'fountain' }, new MyFoldingRangeProvider());

	//Setup autocomplete
	languages.registerCompletionItemProvider({ scheme: 'file', language: 'fountain' }, new MyCompletionProvider(), '\n', '-', ' ');

	//Get user's full name for author autocomplete
	(async () => {
		userfullname = await username();
		if (userfullname.length > 0) {
			userfullname = userfullname.charAt(0).toUpperCase() + userfullname.slice(1)
		}
	})();

	//parse the documentt
	parseDocument(vscode.window.activeTextEditor.document);
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
	}
})

//var lastFountainDocument:TextDocument;
var parsedDocument: any;

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
	var hrstart = process.hrtime()
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
	var hrend = process.hrtime(hrstart)
	console.info('Fountain parsing took %ds %dms', hrend[0], hrend[1] / 1000000)
}

vscode.window.onDidChangeActiveTextEditor(change => {
	if (change.document.languageId == "fountain") {
		parseDocument(change.document);
		lastFountainEditor = change.document.uri;
	}
})

/*
function GetSceneRanges(document: TextDocument) : FoldingRange[]{
		var matchlines = [];
		var ranges = [];
		for (let index = 0; index < parsedDocument.tokens.length; index++) {
			if(parsedDocument.tokens[index].type=="scene_heading"){
				matchlines.push(parsedDocument.tokens[index].position);
			}
		}
		for (let index = 0; index < matchlines.length; index++) {
			if(index == matchlines.length-1)
				ranges.push(new FoldingRange(matchlines[index], document.lineCount-1));
			else if(matchlines[index+1]-matchlines[index] <= 1) continue;
			else{
				ranges.push(new FoldingRange(matchlines[index], matchlines[index+1]-1));
			}
		}
		return ranges;
}*/
function GetFoldingRange(matchlines: number[], lineCount: number/*, higherRange?: FoldingRange[]*/): FoldingRange[] {
	var ranges: FoldingRange[] = [];
	for (let index = 0; index < matchlines.length; index++) {
		if (index == matchlines.length - 1)
			ranges.push(new FoldingRange(matchlines[index], lineCount - 1));
		else if (matchlines[index + 1] - matchlines[index] <= 1) continue;
		else {
			ranges.push(new FoldingRange(matchlines[index], matchlines[index + 1] - 1));
		}
	}
	return ranges;
}
function GetFullRanges(document: TextDocument): FoldingRange[] {
	var h1matches = []; //#
	var h2matches = []; //##
	var h3matches = []; //### (or more)
	var scenematches = []; //scene headings
	var ranges: FoldingRange[] = [];
	for (let index = 0; index < parsedDocument.tokens.length; index++) {
		if (parsedDocument.tokens[index].type == "section") {
			var depth = parsedDocument.tokens[index].depth;
			if (depth >= 3) {
				h3matches.push(parsedDocument.tokens[index].line);
			}
			else if (depth == 2) {
				h2matches.push(parsedDocument.tokens[index].line);
			}
			else if (depth == 1) {
				h1matches.push(parsedDocument.tokens[index].line);
			}
		}
		else if (parsedDocument.tokens[index].type == "scene_heading") {
			scenematches.push(parsedDocument.tokens[index].line);
		}
	}
	//  TODO: Enable folding for headers:
	//	ranges = ranges.concat(GetFoldingRange(h1matches, document.lineCount));
	//	ranges = ranges.concat(GetFoldingRange(h2matches, document.lineCount));
	//	ranges = ranges.concat(GetFoldingRange(h3matches, document.lineCount));
	//	ranges = ranges.concat(GetFoldingRange(hmmatches, document.lineCount));
	ranges = GetFoldingRange(scenematches, document.lineCount);
	return ranges;
}
class MyFoldingRangeProvider implements FoldingRangeProvider {
	provideFoldingRanges(document: TextDocument): FoldingRange[] {
		var ranges: FoldingRange[] = [];

		//Get the sections
		//ranges = ranges.concat(GetSectionRanges("section", document));

		//Add the scenes
		//ranges = ranges.concat(GetFullRanges(document));
		ranges = GetFullRanges(document);
		return ranges;
	}
}

function TimeofDayCompletion(input: string, addspace: boolean, sort: string): vscode.CompletionItem {
	return {
		label: " - " + input,
		kind: vscode.CompletionItemKind.Constant,
		filterText: "- " + input,
		sortText: sort,
		insertText: (addspace ? " " : "") + input + "\n\n"
	};
}
function TitlePageKey(input: string, sort: string, description?: string, triggerIntellisense?: boolean): vscode.CompletionItem {
	if (triggerIntellisense) {
		return {
			label: input + ": ",
			kind: vscode.CompletionItemKind.Constant,
			filterText: "\n" + input,
			sortText: sort.toString(),
			documentation: description,
			command: { command: "editor.action.triggerSuggest", title: "triggersuggest" }
		}
	}
	return {
		label: input + ": ",
		kind: vscode.CompletionItemKind.Constant,
		filterText: "\n" + input,
		sortText: sort.toString(),
		documentation: description
	}
}

class MyCompletionProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(document: TextDocument, position: vscode.Position,/* token: CancellationToken, context: CompletionContext*/): vscode.CompletionItem[] {
		var completes: vscode.CompletionItem[] = [];
		var currentline = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position));
		var prevLine = document.getText(new vscode.Range(new vscode.Position(position.line - 1, 0), position)).trimRight();
		const multipleCharactersExist = parsedDocument.properties.characters.size > 1;
		const currentLineIsEmpty = currentline === "";
		const previousLineIsEmpty = prevLine === "";

		//Title page autocomplete
		if (parsedDocument.properties.firstTokenLine > position.line) {
			if (currentline.indexOf(":") == -1) {
				if (parsedDocument.properties.titleKeys.indexOf("title") == -1)
					completes.push(TitlePageKey("Title", "A", "The title of the screenplay"));
				if (parsedDocument.properties.titleKeys.indexOf("credit") == -1)
					completes.push(TitlePageKey("Credit", "B", "How the author is credited", true));
				if (parsedDocument.properties.titleKeys.indexOf("author") == -1)
					completes.push(TitlePageKey("Author", "C", "The name of the author (you!)", true));
				if (parsedDocument.properties.titleKeys.indexOf("source") == -1)
					completes.push(TitlePageKey("Source", "D", "An additional source, such as the author of the original story", true));
				if (parsedDocument.properties.titleKeys.indexOf("notes") == -1)
					completes.push(TitlePageKey("Notes", "E", "Additional notes"));
				if (parsedDocument.properties.titleKeys.indexOf("draft_date") == -1)
					completes.push(TitlePageKey("Draft date", "F", "The date of the current draft", true));
				if (parsedDocument.properties.titleKeys.indexOf("date") == -1)
					completes.push(TitlePageKey("Date", "G", "The date of the screenplay", true));
				if (parsedDocument.properties.titleKeys.indexOf("contact") == -1)
					completes.push(TitlePageKey("Contact", "H", "Contact details of the author or production company"));
				if (parsedDocument.properties.titleKeys.indexOf("copyright") == -1)
					completes.push(TitlePageKey("Copyright", "I", "Copyright information", true));
				if (parsedDocument.properties.titleKeys.indexOf("watermark") == -1)
					completes.push(TitlePageKey("Watermark", "J", "A watermark to be displayed across every page of the PDF"));
				if (parsedDocument.properties.titleKeys.indexOf("font") == -1)
					completes.push(TitlePageKey("Font", "K", "The font to be used in the preview and in the PDF", true));
			}
			else {
				var currentkey = currentline.trimRight().toLowerCase();
				if (currentkey == "date:" || currentkey == "draft date:") {
					var datestring1 = new Date().toLocaleDateString();
					var datestring2 = new Date().toDateString();
					completes.push({ label: datestring1, insertText: datestring1 + "\n", kind: vscode.CompletionItemKind.Text, sortText: "A", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
					completes.push({ label: datestring2, insertText: datestring2 + "\n", kind: vscode.CompletionItemKind.Text, sortText: "B", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
				}
				else if (currentkey == "author:") {
					completes.push({ label: userfullname, insertText: userfullname, kind: vscode.CompletionItemKind.Text });
				}
				else if (currentkey == "credit:") {
					completes.push({ label: "By", insertText: "By\n", kind: vscode.CompletionItemKind.Text, command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
					completes.push({ label: "Written by", insertText: "Written by\n", kind: vscode.CompletionItemKind.Text, command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
				}
				else if (currentkey == "source:") {
					completes.push({ label: "Story by ", kind: vscode.CompletionItemKind.Text });
					completes.push({ label: "Based on ", kind: vscode.CompletionItemKind.Text });
				}
				else if (currentkey == "copyright:") {
					completes.push({ label: "(c)" + new Date().getFullYear() + " ", kind: vscode.CompletionItemKind.Text });
				}
				else if (currentkey == "font:") {
					fontnames.forEach((fontname: string) => {
						completes.push({ label: fontname, insertText: fontname + "\n", kind: vscode.CompletionItemKind.Text });
					})
				}
			}
		}
		//Scene header autocomplete
		else if (parsedDocument.properties.sceneLines.indexOf(position.line) > -1) {
			//Time of day
			if (currentline.trimRight().endsWith("-")) {
				var addspace = !currentline.endsWith(" ");
				completes.push(TimeofDayCompletion("DAY", addspace, "A"));
				completes.push(TimeofDayCompletion("NIGHT", addspace, "B"));
				completes.push(TimeofDayCompletion("DUSK", addspace, "C"));
				completes.push(TimeofDayCompletion("DAWN", addspace, "D"));
			}
			else {
				var scenematch = currentline.match(/^((?:\*{0,3}_?)?(?:(?:int|ext|est|int\.?\/ext|i\.?\/e\.?).? ))/gi);
				if (scenematch) {
					var previousLabels = []
					for (let index in parsedDocument.properties.sceneNames) {
						var spacepos = parsedDocument.properties.sceneNames[index].indexOf(" ");
						if (spacepos != -1) {
							var thisLocation = parsedDocument.properties.sceneNames[index].slice(parsedDocument.properties.sceneNames[index].indexOf(" ")).trimLeft();
							if (previousLabels.indexOf(thisLocation) == -1) {
								previousLabels.push(thisLocation);
								if (parsedDocument.properties.sceneNames[index].toLowerCase().startsWith(scenematch[0].toLowerCase())) {
									completes.push({ label: thisLocation, documentation: "Scene heading", sortText: "A" + (10 - scenematch[0].length) });
									//The (10-scenematch[0].length) is a hack to avoid a situation where INT. would be before INT./EXT. when it should be after
								}
								else
									completes.push({ label: thisLocation, documentation: "Scene heading", sortText: "B" });
							}
						}
					}
				}
			}
		}
		//Other autocompletes
		else if (position.line > 0 && currentLineIsEmpty && previousLineIsEmpty) {
			//We aren't on the first line, and the previous line is empty

			//Get current scene number
			/*var this_scene_nb = -1;
			for (let index in fountainDocProps.scenes) {
				if (fountainDocProps.scenes[index].line < position.line)
					this_scene_nb = fountainDocProps.scenes[index].scene
				else
					break;
			}*/
			if (multipleCharactersExist) {
				// The character who spoke before the last one
				var charactersWhoSpokeBeforeLast = getCharactersWhoSpokeBeforeLast(parsedDocument, position);
				if (charactersWhoSpokeBeforeLast.length > 0) {
					var index = 0;
					charactersWhoSpokeBeforeLast.forEach(character => {
						var charWithForceSymbolIfNecessary = addForceSymbolToCharacter(character);
						completes.push({ label: charWithForceSymbolIfNecessary, kind: vscode.CompletionItemKind.Keyword, sortText: "0A" + index, documentation: "Character from the current scene", command: { command: "type", arguments: [{ "text": "\n" }], title: "newline" } });
						index++;
					});
				}
				else {
					parsedDocument.properties.characters.forEach((_value: number[], key: string) => {
						completes.push({ label: key, documentation: "Character", sortText: "0C", kind: vscode.CompletionItemKind.Text, command: { command: "type", arguments: [{ "text": "\n" }], title: "newline" } });
					});
				}
			}

			completes.push({ label: "INT. ", documentation: "Interior", sortText: "1B", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
			completes.push({ label: "EXT. ", documentation: "Exterior", sortText: "1C", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
			completes.push({ label: "INT/EXT. ", documentation: "Interior/Exterior", sortText: "1D", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
			completes.push({ label: "EST. ", documentation: "Establishing", sortText: "1E", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });

		}
		return completes;
	}
}

vscode.workspace.onWillSaveTextDocument(() => {
	const config = getFountainConfig(lastFountainEditor);
	if (config.number_scenes_on_save === true) {
		numberScenes();
	}
})
