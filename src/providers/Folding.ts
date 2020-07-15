import { FoldingRangeProvider, FoldingRange, TextDocument, FoldingRangeKind } from "vscode";
import { parsedDocuments } from "../extension";
import { StructToken } from "../afterwriting-parser";

export class FountainFoldingRangeProvider implements FoldingRangeProvider {
	provideFoldingRanges(document: TextDocument): FoldingRange[] {
		var ranges: FoldingRange[] = [];
		if (parsedDocuments.has(document.uri.toString())) {

			function addRange(structItem: StructToken, nextStructItem: StructToken, lastline:number) {

				if(nextStructItem != undefined) //this is the last child, so the end of the folding range is the end of the parent
					lastline = nextStructItem.range.start.line;
				ranges.push(new FoldingRange(structItem.range.start.line, lastline-1));

				if(structItem.children && structItem.children.length){
					//for each child of the structtoken, repeat this process recursively
					for (let i = 0; i < structItem.children.length; i++) {
						addRange(structItem.children[i], structItem.children[i + 1], lastline);
					}
				}
				
			}

			let parsed = parsedDocuments.get(document.uri.toString());
			for (let i = 0; i < parsed.properties.structure.length; i++) {
				//for each structToken, add a new range starting on the current structToken and ending on either the next one, or the last line of the document
				addRange(parsed.properties.structure[i], parsed.properties.structure[i+1], document.lineCount);
			}
		}
		return ranges;
	}
}