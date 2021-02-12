import * as vscode from "vscode";
import { FountainStructureProperties } from "./extension";
import * as parser from "./afterwriting-parser";
import * as path from "path";
import * as telemetry from "./telemetry";
import * as sceneNumbering from './scenenumbering';

//var syllable = require('syllable');

/**
 * Trims character extensions, for example the parantheses part in `JOE (on the radio)`
 */
export const trimCharacterExtension = (character: string): string => character.replace(/[ \t]*(\(.*\))[ \t]*([ \t]*\^)?$/, "");

/**
 * Trims the `@` symbol necesary in character names if they contain lower-case letters, i.e. `@McCONNOR`
 */
export const trimCharacterForceSymbol = (character: string): string => character.replace(/^[ \t]*@/, "");

/**
 * Character names containing lowercase letters need to be prefixed with an `@` symbol
 */
export const addForceSymbolToCharacter = (characterName: string): string => {
	const containsLowerCase = (text: string): boolean =>((/[\p{Ll}]/u).test(text));
	return containsLowerCase(characterName) ? `@${characterName}` : characterName;
}

export const getCharactersWhoSpokeBeforeLast = (parsedDocument:any, position:vscode.Position) => {

	let searchIndex = 0;
	if(parsedDocument.tokenLines[position.line-1]){
		searchIndex = parsedDocument.tokenLines[position.line-1];
	}
	let stopSearch = false;
	let previousCharacters:string[] = []
	let lastCharacter = undefined;
	while(searchIndex>0 && !stopSearch){
		var token = parsedDocument.tokens[searchIndex-1];
		if(token.type=="character"){
			var name =  trimCharacterForceSymbol(trimCharacterExtension(token.text)).trim();
			if(lastCharacter==undefined){
				lastCharacter = name;
			}
			else if(name != lastCharacter && previousCharacters.indexOf(name)==-1){
				previousCharacters.push(name);
			}
		}
		else if(token.type=="scene_heading"){
			stopSearch=true;
		}
		searchIndex--;
	}
	if(lastCharacter!=undefined)
		previousCharacters.push(lastCharacter);
	return previousCharacters;
}

export const findCharacterThatSpokeBeforeTheLast = (
	document: vscode.TextDocument,
	position: vscode.Position,
	fountainDocProps: FountainStructureProperties,
	): string => {

	const isAlreadyMentionedCharacter = (text: string): boolean => fountainDocProps.characters.has(text);

	let characterBeforeLast = "";
	let lineToInspect = 1;
	let foundLastCharacter = false;
	do {
		const beginningOfLineToInspect = new vscode.Position(position.line - lineToInspect, 0);
		const endOfLineToInspect = new vscode.Position(position.line - (lineToInspect - 1), 0);
		let potentialCharacterLine = document.getText(new vscode.Range(beginningOfLineToInspect, endOfLineToInspect)).trimRight();
		potentialCharacterLine = trimCharacterExtension(potentialCharacterLine);
		potentialCharacterLine = trimCharacterForceSymbol(potentialCharacterLine);
		if (isAlreadyMentionedCharacter(potentialCharacterLine)) {
			if (foundLastCharacter) {
				characterBeforeLast = potentialCharacterLine;
			} else {
				foundLastCharacter = true;
			}
		}
		lineToInspect++;
	} while (!characterBeforeLast);

	return characterBeforeLast;
}

/**
 * Calculate an approximation of how long a line of dialogue would take to say
 */
export const calculateDialogueDuration = (dialogue:string): number =>{
	var duration = 0;

	//According to this paper: http://www.office.usp.ac.jp/~klinger.w/2010-An-Analysis-of-Articulation-Rates-in-Movies.pdf
	//The average amount of syllables per second in the 14 movies analysed is 5.13994 (0.1945548s/syllable)
	var sanitized = dialogue.replace(/[^\w]/gi, '');
	duration+=((sanitized.length)/3)*0.1945548;
	//duration += syllable(dialogue)*0.1945548;

	//According to a very crude analysis involving watching random movie scenes on youtube and measuring pauses with a stopwatch
	//A comma in the middle of a sentence adds 0.4sec and a full stop/excalmation/question mark adds 0.8 sec.
	var punctuationMatches=dialogue.match(/(\.|\?|\!|\:) |(\, )/g);
	if(punctuationMatches){
		if(punctuationMatches[0]) duration+=0.75*punctuationMatches[0].length;
		if(punctuationMatches[1]) duration+=0.3*punctuationMatches[1].length;
	}
	return duration
}

export const isMonologue = (seconds:number): boolean => {
	if(seconds>30) return true;
	else return false;
}

function padZero(i: any) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

export function secondsToString(seconds:number):string{
	var time = new Date(null);
	time.setHours(0);
	time.setMinutes(0);
	time.setSeconds(seconds);
	return padZero(time.getHours()) + ":" + padZero(time.getMinutes()) + ":" + padZero(time.getSeconds());
}

export function secondsToMinutesString(seconds:number):string{
	if(seconds<1) return undefined;
	var time = new Date(null);
	time.setHours(0);
	time.setMinutes(0);
	time.setSeconds(seconds);
	if(seconds>=3600)
		return padZero(time.getHours()) + ":" + padZero(time.getMinutes()) + ":" + padZero(time.getSeconds());
	else
		return padZero(time.getHours()*60 + time.getMinutes()) + ":" + padZero(time.getSeconds());
	
}

export const overwriteSceneNumbers = () => {
	telemetry.reportTelemetry("command:fountain.overwriteSceneNumbers");
	const fullText = vscode.window.activeTextEditor.document.getText()
	const clearedText = clearSceneNumbers(fullText);
	writeSceneNumbers(clearedText);
	/* done like this because using vscode.window.activeTextEditor.edit()
	 *  multiple times per callback is unpredictable; only writeSceneNumbers() does it
	 */
}

export const updateSceneNumbers = () => {
	telemetry.reportTelemetry("command:fountain.updateSceneNumbers");
	const fullText = vscode.window.activeTextEditor.document.getText()
	writeSceneNumbers(fullText);
}

const clearSceneNumbers = (fullText: string): string => {
	const regexSceneHeadings = new RegExp(parser.regex.scene_heading.source, "igm");
	const newText = fullText.replace(regexSceneHeadings, (heading: string) => heading.replace(/ #.*#$/, ""))
	return newText
}

// rewrites/updates Scene Numbers using the configured Numbering Schema (currently only 'Standard', not yet configurable)
const writeSceneNumbers = (fullText: string) => {
	// collect existing numbers (they mostly shouldn't change)
	const oldNumbers: string[] = [];
	const regexSceneHeadings = new RegExp(parser.regex.scene_heading.source, "igm");
	const numberingSchema = sceneNumbering.makeSceneNumberingSchema(sceneNumbering.SceneNumberingSchemas.Standard);
	var m;
	while (m = regexSceneHeadings.exec(fullText)) {
		const matchExisting = m[0].match(/#(.+)#$/);

		if (!matchExisting) oldNumbers.push(null) /* no match = no number = new number required in this slot */
		else if (numberingSchema.canParse(matchExisting[1])) oldNumbers.push(matchExisting[1]); /* existing scene number */
		/* ELSE: didn't parse - custom scene numbers are skipped */
	}

	// work out what they should actually be, according to the schema
	const newNumbers = sceneNumbering.generateSceneNumbers(oldNumbers);
	if (newNumbers) {
		// replace scene numbers
		const newText = fullText.replace(regexSceneHeadings, (heading) => {
			const matchExisting = heading.match(/#(.+)#$/);
			if (matchExisting && !numberingSchema.canParse(matchExisting[1]))
				return heading; /* skip re-writing custom scene numbers */

			const noPrevHeadingNumbers = heading.replace(/ #.+#$/, "")
			const newHeading = `${noPrevHeadingNumbers} #${newNumbers.shift()}#`
			return newHeading
		})
		vscode.window.activeTextEditor.edit(editBuilder => editBuilder.replace(
			new vscode.Range(new vscode.Position(0, 0), new vscode.Position(vscode.window.activeTextEditor.document.lineCount, 0)),
			newText
		))
	}
}

/** Shifts scene/s at the selected text up or down */
export const shiftScenes = (editor: vscode.TextEditor, parsed: parser.parseoutput, direction: number) => {

	var numNewlinesAtEndRequired = 0;
	const selectSceneAt = (sel: vscode.Selection): vscode.Selection => {
		// returns range that contains whole scenes that overlap with the selection
		const headingsBefore = parsed.tokens
			.filter(token => (token.is("scene_heading") || token.is("section"))
				&& token.line <= sel.active.line
				&& token.line <= sel.anchor.line)
			.sort((a, b) => b.line - a.line);
		const headingsAfter = parsed.tokens
			.filter(token => (token.is("scene_heading") || token.is("section"))
				&& token.line > sel.active.line
				&& token.line > sel.anchor.line)
			.sort((a, b) => a.line - b.line);

		if (headingsBefore.length == 0) return null;
		const selStart = +headingsBefore[0].line;

		if (headingsAfter.length) {
			const selEnd = +headingsAfter[0].line;
			return new vscode.Selection(selStart, 0, selEnd, 0);
		}
		else {
			// +2 is where the next scene would start if there was one. done to make it look consistent.
			const selEnd = last(parsed.tokens.filter(token => token.line)).line + 2;
			if (selEnd >= editor.document.lineCount) numNewlinesAtEndRequired = selEnd - editor.document.lineCount + 1;
			return new vscode.Selection(selStart, 0, selEnd, 0);
		}
	}

	// get range of scene/s that are shifting
	var moveSelection = selectSceneAt(editor.selection);
	if (moveSelection == null) return; // edge case: using command before the first scene
	var moveText = editor.document.getText(moveSelection) + (new Array(numNewlinesAtEndRequired + 1).join("\n"));
	numNewlinesAtEndRequired = 0;

	// get range of scene being swapped with selected scene/s
	var aboveSelection = (direction == -1) && selectSceneAt(new vscode.Selection(moveSelection.anchor.line - 1, 0, moveSelection.anchor.line - 1, 0));
	var belowSelection = (direction == 1) && selectSceneAt(new vscode.Selection(moveSelection.active.line + 1, 0, moveSelection.active.line + 1, 0));

	// edge cases: no scenes above or below to swap with
	if (!belowSelection && !aboveSelection) return;
	if (belowSelection && belowSelection.anchor.line < moveSelection.active.line) return;

	var reselectDelta = 0;
	const newLinePos = editor.document.lineAt(editor.document.lineCount - 1).range.end;

	editor.edit(editBuilder => {
		// going bottom-up to avoid re-aligning line numbers

		// might need empty lines at the bottom so the cut-paste behaves the same as if there were more scenes
		while (numNewlinesAtEndRequired) {
			// vscode makes this \r\n when appropriate
			editBuilder.insert(newLinePos, "\n");
			numNewlinesAtEndRequired--;
		}

		// paste below?
		if (belowSelection) {
			editBuilder.insert(new vscode.Position(belowSelection.active.line, 0), moveText);
			reselectDelta = belowSelection.active.line - belowSelection.anchor.line;
		}

		// delete original
		editBuilder.delete(moveSelection)

		// paste above?
		if (aboveSelection) {
			editBuilder.insert(new vscode.Position(aboveSelection.anchor.line, 0), moveText);
			reselectDelta = aboveSelection.anchor.line - moveSelection.anchor.line;
		}
	});

	// reselect any text that was originally selected / cursor position
	editor.selection = new vscode.Selection(
		editor.selection.anchor.translate(reselectDelta),
		editor.selection.active.translate(reselectDelta));
	editor.revealRange(editor.selection);
};

export const last = function (array: any[]): any {
	return array[array.length - 1];
}

export function openFile(p:string){
	let cmd = "xdg-open"
	switch (process.platform) { 
		case 'darwin' : cmd = 'open'; break;
		case 'win32' : cmd = ''; break;
		default : cmd = 'xdg-open';
	}
	var exec = require('child_process').exec;
	exec(`${cmd} "${p}"`); 
}
export function revealFile(p:string){
	var cmd = "";
	if(process.platform == "win32"){
		cmd = `explorer.exe /select,${p}`
	}
	else if(process.platform == "darwin"){
		cmd = `open -r ${p}`
	}
	else{
		p = path.parse(p).dir;
		cmd = `open "${p}"`
	}
	var exec = require('child_process').exec;
	exec(cmd); 
}

export function assetsPath(): string{
    return __dirname;
}
interface IPackageInfo {
	name: string;
	version: string;
	aiKey: string;
}
export function getPackageInfo(): IPackageInfo | null {
	const extension = vscode.extensions.getExtension('piersdeseilligny.betterfountain');
	if (extension && extension.packageJSON) {
		return {
			name: extension.packageJSON.name,
			version: extension.packageJSON.version,
			aiKey: extension.packageJSON.aiKey
		};
	}
	return null;
}
//Simple n-bit hash
function nPearsonHash(message: string, n = 8): number {
	// Ideally, this table would be shuffled...
	// 256 will be the highest value provided by this hashing function
	var table = [...new Array(2**n)].map((_, i) => i)


	return message.split('').reduce((hash, c) => {
		return table[(hash + c.charCodeAt(0)) % (table.length - 1)]
	}, message.length % (table.length - 1))

}

function HSVToRGB(h: number, s: number, v: number): Array<number> {
	var [r, g, b] = [0, 0 ,0];
    
	var i = Math.floor(h * 6);
	var f = h * 6 - i;
	var p = v * (1 - s);
	var q = v * (1 - f * s);
	var t = v * (1 - (1 - f) * s);
	switch (i % 6) {
		case 0: r = v, g = t, b = p; break;
		case 1: r = q, g = v, b = p; break;
		case 2: r = p, g = v, b = t; break;
		case 3: r = p, g = q, b = v; break;
		case 4: r = t, g = p, b = v; break;
		case 5: r = v, g = p, b = q; break;
	}
	return [Math.round(r * 255),Math.round(g * 255),Math.round(b * 255)]
}

//We are using colors with same value and saturation as highlighters
export function wordToColor(word: string, s:number = 0.5, v:number = 1): Array<number> {
	const n = 5; //so that colors are spread apart
	const h = nPearsonHash(word, n)/2**(8-n);
	return HSVToRGB(h, s, v)

}

function componentToHex(c:number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
export function rgbToHex(rgb:number[]):string {
  return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

export function median (values:number[]):number {
	if(values.length == 0) return 0;
    values.sort( function(a,b) {return a - b;} );
    var half = Math.floor(values.length/2);
    if(values.length % 2)
        return values[half];
    else
		return (values[half-1] + values[half]) / 2.0;
}