import * as vscode from "vscode";
import { parsedDocuments } from "../extension";
import { getCharactersWhoSpokeBeforeLast, addForceSymbolToCharacter } from "../utils";
import username = require("username");
import { titlePageDisplay } from "../afterwriting-parser";
var fontnames: any[];
const fontFinder = require('font-finder');
var userfullname: string;

//Load fonts for autocomplete
(async () => {
    	var fontlist = await fontFinder.list()
	fontnames = Object.keys(fontlist);
})();

//Get user's full name for author autocomplete
(async () => {
	userfullname = await username();
	if (userfullname.length > 0) {
		userfullname = userfullname.charAt(0).toUpperCase() + userfullname.slice(1)
	}
})();

function TimeofDayCompletion(input: string, addspace: boolean, sort: string): vscode.CompletionItem {
	return {
		label: " - " + input,
		kind: vscode.CompletionItemKind.Constant,
		filterText: "- " + input,
		sortText: sort,
		insertText: (addspace ? " " : "") + input + "\n\n"
	};
}
interface TitlePageKeyComplete{
	name:string,
	sort:string,
	detail:string,
	documentation?:string,
	triggerIntellisense?:boolean,
	deprecated?:boolean,
	position:'tl'|'tc'|'tr'|'cc'|'bl'|'br'|'hidden'|'watermark'|'header'|'footer'
}
const pagedrawings = {
	tl:`Top Left:
╔══════╗
║▀▀    ║
║      ║
║      ║
╚══════╝`,
	tc: `Top Center:
╔══════╗
║  ▀▀  ║
║      ║
║      ║
╚══════╝`,
	tr: `Top Right:
╔══════╗
║    ▀▀║
║      ║
║      ║
╚══════╝`,
	cc: `Center:
╔══════╗
║      ║
║ ████ ║
║      ║
╚══════╝`,
	bl: `Bottom Left:
╔══════╗
║      ║
║      ║
║███   ║
╚══════╝`,
	br: `Bottom Right:
╔══════╗
║      ║
║      ║
║   ███║
╚══════╝`,
watermark: `
╔══════╗
║    ⋰ ║
║  ⋰   ║
║⋰     ║
╚══════╝`,
header: `
╚══════╝
╔══════╗
║▀▀▀▀▀▀║
║      ║`,
footer: `
║      ║
║▄▄▄▄▄▄║
╚══════╝
╔══════╗`,
	hidden: `
	(Not printed on title page)`};
function TitlePageKey(info:TitlePageKeyComplete): vscode.CompletionItem {
	var documentation = new vscode.MarkdownString(info.documentation);
	if(info.position){
		documentation.appendCodeblock(pagedrawings[info.position]);
	}
	var complete:vscode.CompletionItem = {
		label: info.name + ": ",
		kind: vscode.CompletionItemKind.Constant,
		filterText: "\n" + info.name,
		sortText: info.sort.toString(),
		detail: info.detail,
		documentation: documentation,
	}
	if(info.triggerIntellisense) complete.command = { command: "editor.action.triggerSuggest", title: "triggersuggest" };
	if(info.deprecated) complete.tags = [1];
	return complete;
}

export class FountainCompletionProvider implements vscode.CompletionItemProvider {
	provideCompletionItems(document: vscode.TextDocument, position: vscode.Position,/* token: CancellationToken, context: CompletionContext*/): vscode.CompletionItem[] {
		var parsedDocument = parsedDocuments.get(document.uri.toString());
		var completes: vscode.CompletionItem[] = [];
		var currentline = document.getText(new vscode.Range(new vscode.Position(position.line, 0), position));
		var prevLine = document.getText(new vscode.Range(new vscode.Position(position.line - 1, 0), position)).trimRight();
		const hasCharacters = parsedDocument.properties.characters.size > 0;
		const currentLineIsEmpty = currentline === "";
		const previousLineIsEmpty = prevLine === "";

		//Title page autocomplete
		if (parsedDocument.properties.firstTokenLine >= position.line) {
			if (currentline.indexOf(":") == -1) {
				if (parsedDocument.properties.titleKeys.indexOf("title") == -1)
					completes.push(TitlePageKey({name:"Title", detail:"The title of the screenplay", sort:"A", position:titlePageDisplay['title'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("credit") == -1)
					completes.push(TitlePageKey({name:"Credit", detail:"How the author is credited", triggerIntellisense:true, documentation:'Inserted between the title and the author. Good practice is to simply use "Written by" (avoid "Created by" etc...).', sort:"B", position:titlePageDisplay['credit'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("author") == -1)
					completes.push(TitlePageKey({name:"Author", detail:"The name of the author", sort:"C", triggerIntellisense:true, documentation:"This is you! If there are several authors, you can optionally use the 'authors' tag instead.", position:titlePageDisplay['author'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("source") == -1)
				completes.push(TitlePageKey({name:"Source", detail:"An additional source for the screenplay", triggerIntellisense:true, documentation:"This will be inserted below the author, and is useful if the story has an additional source (such as 'Original story by x', 'Based on the novel by x', etc...)", sort:"D", position:titlePageDisplay['source'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("notes") == -1)
				completes.push(TitlePageKey({name:"Notes", detail:"Additional notes", sort:"E", documentation:'Any additional notes you wish to include in the title page', position:titlePageDisplay['notes'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("draft_date") == -1)
				completes.push(TitlePageKey({name:"Draft Date", detail:"The date of the current draft", triggerIntellisense:true, documentation:'Useful if you have several drafts and need to keep track of when they were written' , sort:"F", position:titlePageDisplay['draft_date'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("date") == -1)
				completes.push(TitlePageKey({name:"Date", detail:"The date of the screenplay", triggerIntellisense:true, documentation:'Only include the date it if necessary for production purposes. Someone reading your screenplay does not generally need to know when it was written.', sort:"G", position:titlePageDisplay['date'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("contact") == -1 || parsedDocument.properties.titleKeys.indexOf("contact_info") == -1)
				completes.push(TitlePageKey({name:"Contact", detail:"Contact details", sort:"H", documentation:'Your contact details (Address, email, etc...)', position:titlePageDisplay['contact'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("copyright") == -1)
				completes.push(TitlePageKey({name:"Copyright", detail:"Copyright information", triggerIntellisense:true, documentation:"**Warning:** Including copyright information tends to be unecessary, and may even seem unprofessional in some cases.", sort:"I", deprecated:true, position:titlePageDisplay['copyright'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("watermark") == -1)
				completes.push(TitlePageKey({name:"Watermark", detail:"A watermark displayed on every page", documentation:'A watermark displayed diagonally on every single page', sort:"J", position:'watermark'}));
				if (parsedDocument.properties.titleKeys.indexOf("font") == -1)
				completes.push(TitlePageKey({name:"Font", detail:"The font used in the screenplay", triggerIntellisense:true, documentation:`Generally a monospace courier-type font. BetterFountain's default is [Courier Prime](https://quoteunquoteapps.com/courierprime/), with added support for cyrillic.`, sort:"K", position:titlePageDisplay['font'].position}));
				if (parsedDocument.properties.titleKeys.indexOf("revision") == -1)
				completes.push(TitlePageKey({name:"Revision", detail:"The name of the current and past revisions", documentation:`New revisions are generally printed on different-colored paper, and named accordingly. The WGA order for revisions is:
* White Draft (original)
* Blue Revision
* Pink Revision
* Yellow Revision
* Green Revision
* Goldenrod Revision
* Buff Revision
* Salmon Revision
* Cherry Revision
* Second Blue Revision
* Second Pink Revision
* Second Yellow Revision
* Second Green Revision
* Second Goldenrod Revision
* Second Buff Revision
* Second Salmon Revision
* Second Cherry Revision`, sort:"L", position:titlePageDisplay['revision'].position}));
				completes.push(TitlePageKey({name:"TL", detail:"Top Left", documentation:"Additional content in the top left of the title page", sort:"M", position:titlePageDisplay['tl'].position}));
				completes.push(TitlePageKey({name:"TC", detail:"Top Center", documentation:"Additional content in the top center of the title page", sort:"N", position:titlePageDisplay['tc'].position}));
				completes.push(TitlePageKey({name:"TR", detail:"Top Right", documentation:"Additional content in the top right of the title page", sort:"O", position:titlePageDisplay['tr'].position}));
				completes.push(TitlePageKey({name:"CC", detail:"Center Center", documentation:"Additional content in the center of the title page", sort:"P", position:titlePageDisplay['cc'].position}));
				completes.push(TitlePageKey({name:"BL", detail:"Bottom Left", documentation:"Additional content in the bottom left of the title page", sort:"Q", position:titlePageDisplay['bl'].position}));
				completes.push(TitlePageKey({name:"BR", detail:"Bottom Right", documentation:"Additional content in the bottom right of the title page", sort:"R", position:titlePageDisplay['br'].position}));
				completes.push(TitlePageKey({name:'Header', detail:"Header used throughout the document", documentation:"This will be printed in the top left of every single page, excluding the title page. Can also be set globally by the 'Page Header' setting", sort:"S", position:'header'}))
				completes.push(TitlePageKey({name:'Footer', detail:"Header used throughout the document", documentation:"This will be printed in the bottom left of every single page, excluding the title page. Can also be set globally by the 'Page Footer' setting", sort:"T", position:'footer'}))
			}
			else {
				var currentkey = currentline.trimRight().toLowerCase();
				if (currentkey == "date:" || currentkey == "draft date:") {
					var datestring1 = new Date().toLocaleDateString();
					var datestring2 = new Date().toDateString();
					completes.push({ label: datestring1, insertText: datestring1 + "\n", kind: vscode.CompletionItemKind.Text, sortText: "A", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
					completes.push({ label: datestring2, insertText: datestring2 + "\n", kind: vscode.CompletionItemKind.Text, sortText: "B", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
				}
				else if (currentkey == "author:" || currentkey == "author") {
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
					for (let index = 0; index < parsedDocument.properties.sceneNames.length; index++) {
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
			let charactersWhoSpokeBeforeLast = undefined;
			let charactersFromCurrentSceneHash = new Set();
			if (hasCharacters) {
				// The characters who spoke before the last one, within the current scene
				charactersWhoSpokeBeforeLast = getCharactersWhoSpokeBeforeLast(parsedDocument, position);
				if (charactersWhoSpokeBeforeLast.length > 0) {
					var index = 0;
					charactersWhoSpokeBeforeLast.forEach(character => {
						var charWithForceSymbolIfNecessary = addForceSymbolToCharacter(character);
						charactersFromCurrentSceneHash.add(character);
						completes.push({ label: charWithForceSymbolIfNecessary, kind: vscode.CompletionItemKind.Keyword, sortText: "0A" + index, documentation: "Character from the current scene", command: { command: "type", arguments: [{ "text": "\n" }], title: "newline" } });
						index++;
					});
				}
				else{
					charactersWhoSpokeBeforeLast = undefined;
				}
			}

			completes.push({ label: "INT. ", documentation: "Interior", sortText: "1B", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
			completes.push({ label: "EXT. ", documentation: "Exterior", sortText: "1C", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
			completes.push({ label: "INT/EXT. ", documentation: "Interior/Exterior", sortText: "1D", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });
			completes.push({ label: "EST. ", documentation: "Establishing", sortText: "1E", command: { command: "editor.action.triggerSuggest", title: "triggersuggest" } });

			if(hasCharacters){
				let sortText = "2" // Add all characters, but after the "INT/EXT" suggestions
				if(charactersWhoSpokeBeforeLast == undefined){
					sortText = "0A"; //There's no characters in the current scene, suggest characters before INT/EXT
				}
				parsedDocument.properties.characters.forEach((_value: number[], key: string) => {
					if(!charactersFromCurrentSceneHash.has(key))
						completes.push({ label: key, documentation: "Character", sortText: sortText, kind: vscode.CompletionItemKind.Text, command: { command: "type", arguments: [{ "text": "\n" }], title: "newline" } });
				});
			}
		}
		return completes;
	}
}