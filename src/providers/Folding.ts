import { FoldingRangeProvider, FoldingRange, TextDocument } from "vscode";
import { parsedDocument } from "../extension";

/*
function GetSceneRanges(document: TextDocument) : FoldingRange[]{
		var matchlines = [];
		var ranges = [];
		for (let index = 0; index < parsedDocument.tokens.length; index++) {
			if(parsedDocument.tokens[index].type=="scene_heading"){
				matchlines.push(parsedDocument.tokens[index].position);
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
	for (let index = 0; index < parsedDocument.tokens.length; index++) {
		if (parsedDocument.tokens[index].type == "section") {
			var depth = parsedDocument.tokens[index].level;
			if (depth >= 3) {
				h3matches.push(parsedDocument.tokens[index].line);
			}
			else if (depth == 2) {
				h2matches.push(parsedDocument.tokens[index].line);
			}
			else if (depth == 1) {
				h1matches.push(parsedDocument.tokens[index].line);
			}
		}
		else if (parsedDocument.tokens[index].type == "scene_heading") {
			scenematches.push(parsedDocument.tokens[index].line);
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
export class FountainFoldingRangeProvider implements FoldingRangeProvider {
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