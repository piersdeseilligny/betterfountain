
import * as vscode from 'vscode';
import { token } from '../token';
import { getEditor } from '../extension';

var decortype_DialogueNumbers = vscode.window.createTextEditorDecorationType({

  });
  
export var DialogueNumbers: vscode.DecorationOptions[] = []

export function AddDialogueNumberDecoration(thistoken: token){
    var decrange = new vscode.Range(new vscode.Position(thistoken.line, 0), new vscode.Position(thistoken.line, thistoken.text.length));
    DialogueNumbers.push({ range:decrange, renderOptions:{before:{contentText: thistoken.takeNumber.toString() + " - ", textDecoration:";opacity:0.5;", color:new vscode.ThemeColor("editor.foreground")}}});
}
export function clearDecorations(){
    DialogueNumbers = [];
}
export function showDecorations(vscode: vscode.Uri){ 
	getEditor(vscode).setDecorations(decortype_DialogueNumbers, DialogueNumbers)
}