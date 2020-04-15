import { parsedDocument } from "../extension";
import { secondsToMinutesString } from "../utils";
import * as vscode from "vscode";
import * as afterparser from "../afterwriting-parser";

export class FountainSymbolProvider implements vscode.DocumentSymbolProvider{
	provideDocumentSymbols(document: vscode.TextDocument): vscode.DocumentSymbol[] {
		console.time("symbols");

		var symbols:vscode.DocumentSymbol[] = []
		var scenecounter = 0;

		function symbolFromStruct(token:afterparser.StructToken, nexttoken:afterparser.StructToken, hierarchyend:number):{symbol:vscode.DocumentSymbol, length:number}{
			var returnvalue:{symbol:vscode.DocumentSymbol, length:number} = {symbol:undefined, length:0};
			var start = token.range.start;
			var end = document.lineAt(hierarchyend-1).range.end;
			var details = undefined;
			if(hierarchyend==start.line) end = document.lineAt(hierarchyend).range.end;
			if(nexttoken!=undefined){
				end = nexttoken.range.start;
			}
			if(!token.section){
				var sceneLength = parsedDocument.properties.scenes[scenecounter].actionLength + parsedDocument.properties.scenes[scenecounter].dialogueLength;
				details = secondsToMinutesString(sceneLength);
				returnvalue.length = sceneLength;
				scenecounter++;
			}
			var symbolname = " ";
			if(token.text != "")
				symbolname = token.text;
			var symbol = new vscode.DocumentSymbol(symbolname, details, vscode.SymbolKind.String, new vscode.Range(start, end), token.range);
			symbol.children = [];

			var childrenLength = 0;
			if(token.children != undefined){
				for (let index = 0; index < token.children.length; index++) {
					var childsymbol = symbolFromStruct(token.children[index], token.children[index+1], end.line);
					symbol.children.push(childsymbol.symbol);
					childrenLength+= childsymbol.length;
				}
			}
			if(token.section){
				returnvalue.length = childrenLength;
				symbol.detail = secondsToMinutesString(childrenLength);
			}
			returnvalue.symbol = symbol;
			return returnvalue;
		}

		for (let index = 0; index < parsedDocument.properties.structure.length; index++) {
			symbols.push(symbolFromStruct(parsedDocument.properties.structure[index], parsedDocument.properties.structure[index+1], document.lineCount).symbol);
		}
		console.timeEnd("symbols");
		return symbols;
		
	}
}