import * as vscode from "vscode";
import { FountainStructureProperties } from "./extension";

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
 * Helper function to retrieve the position of a line in a text
 * @param screenplayText
 * @param scene
 */
const getLinePosition = (screenplayText: string, scene: string): number => {
    const index = screenplayText.indexOf(scene)
    const tempString = screenplayText.substring(0, index)
    return tempString.split("\n").length - 1
}

export const getSceneFoldingRanges = (screenplayText: string): vscode.FoldingRange[] => {
    const sceneHeadingRegexLookAhead = /^(?=^(?:INT|EXT|INT\/EXT|EST|I\/E|I\.\/E)(?: |\.).*$)/mi
    const sceneHeadingRegex = /^(?:INT|EXT|INT\/EXT|EST|I\/E|I\.\/E)(?: |\.).*$/i
	const headingsLinePositions: number[] = []

	// Step 1: Create an array of scenes
    const scenes = screenplayText.split(sceneHeadingRegexLookAhead)
	// Check if first string isn't actually a scene - remove in that case
	// Is most likely the case if there are `Title: La La Land` attributes etc.
    if (!sceneHeadingRegex.test(scenes[0])) {
        delete scenes[0]
    }

	// Step 2: Update the array of line numbers of each scene (their beginning)
    scenes.forEach((scene) => {
        headingsLinePositions.push(getLinePosition(screenplayText, scene))
    })

	// Step 3: Calculate the ranges of all scenes
    const sceneRanges: vscode.FoldingRange[] = []
    headingsLinePositions.reduce((prev, curr) => {
		sceneRanges.push(new vscode.FoldingRange(prev, curr - 2, 3))
        return curr
    })
    // Add last scene to sceneRanges array
    sceneRanges.push(
		new vscode.FoldingRange(
			headingsLinePositions[headingsLinePositions.length - 1],
			screenplayText.split("\n").length - 1,
			3
		)
	)

    return sceneRanges
}
