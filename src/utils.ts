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
		const beginningOfLineToInspect = new vscode.Position(position.line - lineToInspect, 0);
		const endOfLineToInspect = new vscode.Position(position.line - (lineToInspect - 1), 0);
		const potentialCharacterLine = document.getText(new vscode.Range(beginningOfLineToInspect, endOfLineToInspect)).trimRight();
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

