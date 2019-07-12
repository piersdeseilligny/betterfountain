import * as vscode from "vscode";
import { FountainStructureProperties } from "./extension";

var syllable = require('syllable');

/**
 * Trims character extensions, for example the parantheses part in `JOE (on the radio)`
 */
export const trimCharacterExtension = (character: string): string => character.replace(/( \([A-z0-9 '\-.()]+\))*(\s*\^*)?$/, "");

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
	duration += syllable(dialogue)*0.1945548;

	//According to a very crude analysis involving watching random movie scenes on youtube and measuring pauses with a stopwatch
	//A comma in the middle of a sentence adds 0.4sec and a full stop/excalmation/question mark adds 0.8 sec.
	var punctuationMatches=dialogue.match(/(\.|\?|\!|\:) |(\, )/g);
	if(punctuationMatches){
		if(punctuationMatches[0]) duration+=0.75*punctuationMatches[0].length;
		if(punctuationMatches[1]) duration+=0.3*punctuationMatches[1].length;
	}
	return duration
}