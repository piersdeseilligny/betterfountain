import * as vscode from "vscode";
import { FountainStructureProperties } from "./extension";
import * as parser from "./afterwriting-parser";
import * as path from "path";
import * as telemetry from "./telemetry";

//var syllable = require('syllable');

/**
 * Trims character extensions, for example the parantheses part in `JOE (on the radio)`
 */
export const trimCharacterExtension = (character: string): string => character.replace(/( \([A-z0-9 '’\-.()]+\))*(\s*\^*)?$/, "");

/**
 * Trims the `@` symbol necesary in character names if they contain lower-case letters, i.e. `@McCONNOR`
 */
const trimCharacterForceSymbol = (character: string): string => character.replace(/^@/, "");

/**
 * Character names containing lowercase letters need to be prefixed with an `@` symbol
 */
export const addForceSymbolToCharacter = (characterName: string): string => {
	const containsLowerCase = (text: string): boolean =>(/[a-z]/.test(text));
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
			var name =  trimCharacterExtension(token.text);
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

export const numberScenes = () => {
	telemetry.reportTelemetry("command:fountain.statistics");
	const regexSceneHeadings = new RegExp(parser.regex.scene_heading.source, "igm");
	const fullText = vscode.window.activeTextEditor.document.getText()
	let sceneNumber: number = 1
	const newText = fullText.replace(regexSceneHeadings, (heading) => {
		const noPrevHeadingNumbers = heading.replace(/ #\d+#$/, "")
		const newHeading = `${noPrevHeadingNumbers} #${sceneNumber}#`
		sceneNumber++
		return newHeading
	})
	vscode.window.activeTextEditor.edit((editBuilder) => {
		editBuilder.replace(
			new vscode.Range(new vscode.Position(0, 0), new vscode.Position(vscode.window.activeTextEditor.document.lineCount, 0)),
			newText
		)
	})
}

export const last = function(array: any[]): any {
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
export function wordToColor(word: string): Array<number> {
	const s = 0.5;
	const v = 1;
	
	const n = 5; //so that colors are spread apart
	const h = nPearsonHash(word, n)/2**(8-n);
	return HSVToRGB(h, s, v)

}