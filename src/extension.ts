'use strict';
import { getFountainConfig } from "./configloader";
import * as path from 'path';
import { ExtensionContext, languages, FoldingRangeProvider, TextDocument, FoldingRange } from 'vscode';
import * as vscode from 'vscode';
import * as afterparser from "./afterwriting-parser";
import { GeneratePdf } from "./pdf/pdf";
import * as username from 'username';
import { findCharacterThatSpokeBeforeTheLast, trimCharacterExtension, addForceSymbolToCharacter } from "./utils";

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
			for (let index = 0; index < docStructure.length; index++) {
				const token = docStructure[index];
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
				for (let index = 0; index < docStructure.length; index++) {
					const token = docStructure[index];
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
		var elements: vscode.TreeItem[] = [];
		var treeExportPdf = new vscode.TreeItem("Export PDF");
		var treeLivePreview = new vscode.TreeItem("Show live preview");
		treeExportPdf.command = {
			command: 'fountain.exportpdf',
			title: ''
		};
		treeLivePreview.command = {
			command: 'fountain.livepreview',
			title: ''
		};
		elements.push(treeExportPdf);
		elements.push(treeLivePreview);
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
	var cleandir = __dirname.split(String.fromCharCode(92)).join("/");
	previewpanel.webview.html = webviewHtml.replace("$TITLEPAGE$", titlepage)
										   .replace("$SCRIPT$", script)
										   .replace("$SCRIPTCLASS$", pageClasses)
										   .replace(/\$ROOTDIR\$/g, cleandir)
										   .replace("$PAGETHEME$",directConfig.previewTheme+"_theme");

	parseDocument(vscode.window.activeTextEditor.document);
	console.log(previewpanel.webview.html)
}
function padZero(i: any) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}


/**
 * Approximates length of the screenplay based on the overall length of dialogue and action tokens
 * 
 * According to this paper: http://www.office.usp.ac.jp/~klinger.w/2010-An-Analysis-of-Articulation-Rates-in-Movies.pdf
 * The average amount of syllables per second in the 14 movies analysed is 5.1
 * The average amount of letters per syllable is 3 (https://strainindex.wordpress.com/2010/03/13/syllable-word-and-sentence-length/)
 */

function updateStatus(lengthAction:number, lengthDialogue:number): void {
	if (durationStatus != undefined) {
		if (vscode.window.activeTextEditor != undefined && vscode.window.activeTextEditor.document.languageId == "fountain") {
			durationStatus.show();
			//This value is based on the average calculated from various different scripts (see script_to_time.txt)
			var durationDialogue = lengthDialogue/15;
			var durationAction = lengthAction/16;
			var time = new Date(null);
			time.setHours(0);
			time.setMinutes(0);
			time.setSeconds(durationDialogue+durationAction);
			durationStatus.text = padZero(time.getHours()) + ":" + padZero(time.getMinutes()) + ":" + padZero(time.getSeconds());
		}
		else {
			durationStatus.hide();
		}
	}
}


var durationStatus: vscode.StatusBarItem;
const outlineViewProvider: FountainOutlineTreeDataProvider = new FountainOutlineTreeDataProvider();
const commandViewProvider: FountainCommandTreeDataProvider = new FountainCommandTreeDataProvider();
var lastFountainEditor:vscode.Uri;
var userfullname: string;
let diagnosticCollection = languages.createDiagnosticCollection("fountain");
let diagnostics : vscode.Diagnostic[] = [];
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
		previewpanel.webview.onDidReceiveMessage(message=>{
			if(message.command == "updateFontResult"){
				if(message.content == false && fountainDocProps.fontLine != -1){
					//The font could not be rendered
					diagnostics = []
					diagnostics.push(new vscode.Diagnostic(new vscode.Range(new vscode.Position(fountainDocProps.fontLine,0), new vscode.Position(fountainDocProps.fontLine,5)), "This font could not be rendered in the live preview. Is it installed?", vscode.DiagnosticSeverity.Error));
					diagnosticCollection.set(vscode.window.activeTextEditor.document.uri, diagnostics);
				}
				else{
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
		console.log(saveuri);
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
		console.log("username is " + userfullname);
	})();
}

vscode.workspace.onDidChangeTextDocument(change => {
	parseDocument(change.document);
})

vscode.workspace.onDidChangeConfiguration(change => {
	console.log("change configuration")
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
			previewpanel.webview.postMessage({ command: 'updatePageClasses', content: pageClasses });
			previewpanel.webview.postMessage({ command: 'changeTheme', content: directConfig.previewTheme+"_theme" });
		}
	}
})

//var lastFountainDocument:TextDocument;
var documentTokens: any;
var docStructure: StructToken[] = [];
class StructToken {
	text: string;
	id: any;
	children: any;
}
function last(array: any[]): any {
	return array[array.length - 1];
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
var fountainDocProps: FountainStructureProperties = {
	sceneLines: [],
	scenes: [],
	sceneNames:[],
	titleKeys: [],
	firstTokenLine: Infinity,
	fontLine: -1,
	lengthAction: 0,
	lengthDialogue: 0,
	characters: new Map<string, number[]>()
};

var fontTokenExisted:boolean = false;

function parseDocument(document: TextDocument) {
	if (vscode.window.activeTextEditor.document.uri == document.uri) {

		var updatehtml = (previewpanel != null && document.languageId == "fountain");
		var output = afterparser.parse(document.getText(), getFountainConfig(lastFountainEditor), updatehtml);

		if (updatehtml) {
			//lastFountainDocument = document;
			previewpanel.webview.postMessage({ command: 'updateTitle', content: output.titleHtml });
			previewpanel.webview.postMessage({ command: 'updateScript', content: output.scriptHtml });
		}
		documentTokens = output.tokens;
		var tokenlength = 0;
		var currentdepth = 0;
		var currentSceneNumber = 0;
		docStructure = [];
		fountainDocProps.sceneLines = [];
		fountainDocProps.scenes = [];
		fountainDocProps.sceneNames = [];
		fountainDocProps.firstTokenLine = Infinity;
		fountainDocProps.characters = new Map<string, number[]>();

		while (tokenlength < documentTokens.length) {
			var token = documentTokens[tokenlength];
			if (token.type != "separator" && fountainDocProps.firstTokenLine == Infinity)
				fountainDocProps.firstTokenLine = token.line
			var cobj: StructToken = new StructToken();
			if (token.type == "section") {
				cobj.text = token.text;
				currentdepth = token.level;
				cobj.children = [];
				if (token.level == 1) {
					cobj.id = '/' + token.line;
					docStructure.push(cobj)
				}
				else if (token.level == 2) {
					var level1 = last(docStructure);
					cobj.id = level1.id + '/' + token.line;
					level1.children.push(cobj);
				}
				else if (token.level == 3) {
					var level1 = last(docStructure);
					var level2 = last(level1.children);
					cobj.id = level2.id + '/' + token.line;
					level2.children.push(cobj);
				}
			}
			else if (token.type == "scene_heading") {
				currentSceneNumber = token.number;
				fountainDocProps.scenes.push({ scene: token.number, line: token.line });
				fountainDocProps.sceneLines.push(token.line);
				fountainDocProps.sceneNames.push(token.text);
				cobj.text = token.text;
				cobj.children = null;
				if (currentdepth == 0) {
					cobj.id = '/' + token.line;
					docStructure.push(cobj);
				}
				else if (currentdepth == 1) {
					var level1 = last(docStructure);
					cobj.id = level1.id + '/' + token.line;
					level1.children.push(cobj);
				}
				else if (currentdepth == 2) {
					var level1 = last(docStructure);
					var level2 = last(level1.children);
					cobj.id = level2.id + '/' + token.line;
					level2.children.push(cobj);
				}
				else if (currentdepth >= 3) {
					var level1 = last(docStructure);
					var level2 = last(level1.children);
					var level3 = last(level2.children);
					cobj.id = level3.id + '/' + token.line;
					level3.children.push(cobj);
				}
			}
			else if (token.type == "character") {
				let character = trimCharacterExtension(token.text)
				if (fountainDocProps.characters.has(character)) {
					var values = fountainDocProps.characters.get(character);
					if (values.indexOf(currentSceneNumber) == -1) {
						values.push(currentSceneNumber);
					}
					fountainDocProps.characters.set(character, values);
				}
				else {
					fountainDocProps.characters.set(character, [currentSceneNumber]);
				}
			}
			tokenlength++;
		}
		tokenlength = 0;
		fountainDocProps.titleKeys = [];
		var fontTokenExists = false;
		while (tokenlength < output.title_page.length) {
			fountainDocProps.titleKeys.push(output.title_page[tokenlength].type.toLowerCase());
			if(output.title_page[tokenlength].type == "font" && output.title_page[tokenlength].text.trim() != ""){
				fountainDocProps.fontLine = output.title_page[tokenlength].line;
				var fontname = output.title_page[tokenlength].text;
				previewpanel.webview.postMessage({ command: 'updateFont', content: fontname });
				fontTokenExists=true;
				fontTokenExisted=true;
			}
			tokenlength++;
		}
		if(!fontTokenExists && fontTokenExisted){
			previewpanel.webview.postMessage({ command: 'removeFont' });
			fontTokenExisted=false;
			diagnosticCollection.set(vscode.window.activeTextEditor.document.uri, []);
		}
	}
	if (document.languageId == "fountain")
		outlineViewProvider.update();
	updateStatus(output.lengthAction, output.lengthDialogue);
}

vscode.window.onDidChangeActiveTextEditor(change => {
	if(change.document.languageId=="fountain"){
		parseDocument(change.document);
		lastFountainEditor = change.document.uri;
	}
})

/*
function GetSceneRanges(document: TextDocument) : FoldingRange[]{
		var matchlines = [];
		var ranges = [];
		for (let index = 0; index < documentTokens.length; index++) {
			if(documentTokens[index].type=="scene_heading"){
				matchlines.push(documentTokens[index].position);
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
	for (let index = 0; index < documentTokens.length; index++) {
		if (documentTokens[index].type == "section") {
			var depth = documentTokens[index].depth;
			if (depth >= 3) {
				h3matches.push(documentTokens[index].position);
			}
			else if (depth == 2) {
				h2matches.push(documentTokens[index].position);
			}
			else if (depth == 1) {
				h1matches.push(documentTokens[index].position);
			}
		}
		else if (documentTokens[index].type == "scene_heading") {
			scenematches.push(documentTokens[index].position);
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
		const multipleCharactersExist = fountainDocProps.characters.size > 1;
		const currentLineIsEmpty = currentline === "";
		const previousLineIsEmpty = prevLine === "";

		//Title page autocomplete
		if (fountainDocProps.firstTokenLine > position.line) {
			if (currentline.indexOf(":") == -1) {
				if (fountainDocProps.titleKeys.indexOf("title") == -1)
					completes.push(TitlePageKey("Title", "A", "The title of the screenplay"));
				if (fountainDocProps.titleKeys.indexOf("credit") == -1)
					completes.push(TitlePageKey("Credit", "B", "How the author is credited", true));
				if (fountainDocProps.titleKeys.indexOf("author") == -1)
					completes.push(TitlePageKey("Author", "C", "The name of the author (you!)", true));
				if (fountainDocProps.titleKeys.indexOf("source") == -1)
					completes.push(TitlePageKey("Source", "D", "An additional source, such as the author of the original story", true));
				if (fountainDocProps.titleKeys.indexOf("notes") == -1)
					completes.push(TitlePageKey("Notes", "E", "Additional notes"));
				if (fountainDocProps.titleKeys.indexOf("draft_date") == -1)
					completes.push(TitlePageKey("Draft date", "F", "The date of the current draft", true));
				if (fountainDocProps.titleKeys.indexOf("date") == -1)
					completes.push(TitlePageKey("Date", "G", "The date of the screenplay", true));
				if (fountainDocProps.titleKeys.indexOf("contact") == -1)
					completes.push(TitlePageKey("Contact", "H", "Contact details of the author or production company"));
				if (fountainDocProps.titleKeys.indexOf("copyright") == -1)
					completes.push(TitlePageKey("Copyright", "I", "Copyright information", true));
				if (fountainDocProps.titleKeys.indexOf("watermark") == -1)
					completes.push(TitlePageKey("Watermark", "J", "A watermark to be displayed across every page of the PDF"));
				if (fountainDocProps.titleKeys.indexOf("font") == -1)
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
				else if (currentkey == "font:"){
					fontnames.forEach((fontname:string)=>{
						completes.push({ label: fontname, insertText:fontname+"\n", kind: vscode.CompletionItemKind.Text });
					})
				}
			}
		}
		// Dialogue autocomplete
		else if (multipleCharactersExist && currentLineIsEmpty && previousLineIsEmpty) {
			// Autocomplete with character name who spoke before the last one
			const charWhoSpokeBeforeLast = findCharacterThatSpokeBeforeTheLast(document, position, fountainDocProps);
			const charWithForceSymbolIfNecessary = addForceSymbolToCharacter(charWhoSpokeBeforeLast);
			completes.push({label: charWithForceSymbolIfNecessary, kind: vscode.CompletionItemKind.Text});
		}
		//Scene header autocomplete
		else if (fountainDocProps.sceneLines.indexOf(position.line) > -1) {
			//Time of day
			if (currentline.trimRight().endsWith("-")) {
				var addspace = !currentline.endsWith(" ");
				completes.push(TimeofDayCompletion("DAY", addspace, "A"));
				completes.push(TimeofDayCompletion("NIGHT", addspace, "B"));
				completes.push(TimeofDayCompletion("DUSK", addspace, "C"));
				completes.push(TimeofDayCompletion("DAWN", addspace, "D"));
			}
			else{
				var scenematch = currentline.match(/^((?:\*{0,3}_?)?(?:(?:int|ext|est|int\.?\/ext|i\.?\/e\.?).? ))/gi);
				if(scenematch){
					for(let index in fountainDocProps.sceneNames){
						var spacepos = fountainDocProps.sceneNames[index].indexOf(" ");
						if(spacepos != -1){
							var thisLocation = fountainDocProps.sceneNames[index].slice(fountainDocProps.sceneNames[index].indexOf(" ")).trimLeft();
							if(fountainDocProps.sceneNames[index].toLowerCase().startsWith(scenematch[0].toLowerCase()))
								completes.push({ label: thisLocation, documentation: "Scene heading", sortText: "A" + (10-scenematch[0].length)});
								//The (10-scenematch[0].length) is a hack to avoid a situation where INT. would be before INT./EXT. when it should be after
							else
								completes.push({ label: thisLocation, documentation: "Scene heading", sortText: "B" });
						}
					}
				}
			}
		}
		//Other autocompletes
		else if (position.line > 0 && document.getText(new vscode.Range(new vscode.Position(position.line - 1, 0), new vscode.Position(position.line - 1, 1))) == "") {
			//We aren't on the first line, and the previous line is empty
			if (position.character == 1) {
				completes.push({ label: "INT. ", documentation: "Interior", sortText: "B", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" }});
				completes.push({ label: "EXT. ", documentation: "Exterior", sortText: "C", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
				completes.push({ label: "INT/EXT. ", documentation: "Interior/Exterior", sortText: "D", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
				completes.push({ label: "EST. ", documentation: "Establishing", sortText: "E", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
				//Get current scene number
				var this_scene_nb = -1;
				for (let index in fountainDocProps.scenes) {
					if (fountainDocProps.scenes[index].line < position.line)
						this_scene_nb = fountainDocProps.scenes[index].scene
					else
						break;
				}
				fountainDocProps.characters.forEach((value: number[], key: string) => {
					if (value.indexOf(this_scene_nb) > -1) {
						//This character is in the current scene, give it priority over the others
						completes.push({ label: key, documentation: "Character", sortText: "B" });
					}
					else {
						completes.push({ label: key, documentation: "Character", sortText: "C" });
					}
				});
			}
		}
		return completes;
	}
}
