import * as vscode from "vscode";
import { FountainStructureProperties } from "./extension";

export const findCharacterThatSpokeBeforeTheLast = (
	document: vscode.TextDocument,
	position: vscode.Position,
	fountainDocProps: FountainStructureProperties,
): string => {
	let characterBeforeLast = "";
	let lineToInspect = 1;
	let foundLastCharacter = false;
	do {
		const potentialCharacterLine = document.getText(new vscode.Range(new vscode.Position(position.line - lineToInspect, 0), position)).split('\n')[0].trim();
		if (fountainDocProps.characters.has(potentialCharacterLine)) {
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

