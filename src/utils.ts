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

const getHeadingLinePosition = (screenplayText: string, scene: string): number => {
    const index = screenplayText.indexOf(scene)
    const tempString = screenplayText.substring(0, index)
    return tempString.split("\n").length
}

export const getSceneFoldingRanges = (screenplayText: string): vscode.FoldingRange[] => {
    const sceneHeadingRegexLookAhead = /^(?=(?:INT\.|EXT\.|INT\/EXT\.) .+$)/m
    const sceneHeadingRegex = /^(?:INT\. |EXT\. |INT\/EXT\. ).+$/
    const headingsLinePositions: number[] = []
    const scenes = screenplayText.split(sceneHeadingRegexLookAhead)
    // Check if first string isn't actually a scene - remove in that case
    if (!sceneHeadingRegex.test(scenes[0])) {
        delete scenes[0]
    }

    scenes.forEach((scene) => {
        headingsLinePositions.push(getHeadingLinePosition(screenplayText, scene))
    })

    console.log(headingsLinePositions)

    const sceneRanges: vscode.FoldingRange[] = []

    headingsLinePositions.reduce((prev, curr) => {
		console.log({prev, curr})
		sceneRanges.push(new vscode.FoldingRange(prev - 1, curr - 3, 3))
        return curr
    })

    // Add last scene to sceneRanges array
    sceneRanges.push(
		new vscode.FoldingRange(
			headingsLinePositions[headingsLinePositions.length - 1] - 1,
			screenplayText.split("\n").length - 2,
			3
		)
	)

    return sceneRanges
}
