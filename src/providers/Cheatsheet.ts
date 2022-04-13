import * as vscode from 'vscode';
import * as path from 'path';

export class FountainCheatSheetWebviewViewProvider implements vscode.WebviewViewProvider {
    _extensionUri= vscode.extensions.getExtension("piersdeseilligny.betterfountain").extensionPath;
    
    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext<unknown>, _token: vscode.CancellationToken): void | Thenable<void> {
       
        webviewView.webview.options = {
			localResourceRoots: [
				vscode.Uri.parse(this._extensionUri)
			]
		};
       
        const cssDiskPath = vscode.Uri.file(path.join(this._extensionUri, 'out', 'webviews', 'cheatsheet.css'));
        const styleUri = webviewView.webview.asWebviewUri(cssDiskPath).toString()

        webviewView.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewView.webview.cspSource}; ">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
           
            <title>Cheat Sheet</title>
            <link rel='stylesheet' type='text/css' href='${styleUri}'>

        </head>
        <body>
            ${getCheatSheetAsHtml()}
        </body>
        </html>`;
    }
}

class CheatsheetItem  {
    label: string;
    highlights?: [number, number][];
    constructor( public keyword: string, public description: string, public example: string) {
        this.label = `${keyword} ${description}`.trim()
        this.highlights = [[0, keyword.length]]
    }
}

function getCheatSheetAsHtml(){
    let result:string = "";
    getCheatSheet().forEach((cheatsheetItems,categoryName)=>{
        result += `<details class="category"><summary><span class="">${categoryName}</span></summary><div>`
        cheatsheetItems.forEach(item=>{
            result+= `<details class="cheat-item"><summary><span class="keyword">${item.keyword}</span> ${item.description}</summary> 
            <p>E.g.:</p>
            <p>${item.example}</p>
            </details>`
        })
        result += "</div></details>"
        
    })
    return result;
}

function getCheatSheet(): Map<string,CheatsheetItem[]>{
    let cheatSheet: Map<string,CheatsheetItem[]> = new Map<string,CheatsheetItem[]>();
    cheatSheet.set('Scenes', [
        new CheatsheetItem("INT.","Indoor scene","INT. BRICK'S ROOM - DAY"),
        new CheatsheetItem("EXT.","Outdoor scene","EXT. BRICK'S POOL - DAY"),
        new CheatsheetItem("EST.","Establishing scene","EST. CITY - NIGHT"),
        new CheatsheetItem("INT./EXT.","Indoor and Outdoor scene","INT./EXT. RONNA'S CAR - NIGHT [DRIVING]"),
        new CheatsheetItem("I/E.","Indoor and Outdoor scene","I/E. RONNA'S CAR - NIGHT [DRIVING]"),
        new CheatsheetItem("TO:","Transitions should be upper case, ending in ' TO:'"
                                ,"Jack begins to argue vociferously in Vietnamese (?), But mercifully we...\n\nCUT TO:\n\nEXT. BRICK'S POOL - DAY"),
        new CheatsheetItem("","Action, or scene description, is any paragraph that doesn't meet criteria for another element"
                                ,`They drink long and well from the beers.\n\nAnd then there's a long beat.\nLonger than is funny.\nLong enough to be depressing.\n\nThe men look at each other.`),   ])

    cheatSheet.set('Dialogues', [
        new CheatsheetItem("","Character names should be in upper case","STEEL\nThe man's a myth!"),
        new CheatsheetItem("","Dialogue is any text following a Character or Parenthetical element"
                                ,"SANBORN\nA good 'ole boy."),
        new CheatsheetItem("(parantheticals)","Parentheticals follow a Character or Dialogue element, and are wrapped in parentheses ()"
                                ,"STEEL\n(starting the engine)\nSo much for retirement!"),
        new CheatsheetItem("^","Dual, or simultaneous, dialogue is expressed by adding a caret ^ after the second Character element"
                                ,"BRICK\nScrew retirement.\n\nSTEEL ^\nScrew retirement."),
        new CheatsheetItem("~","Lyric lines start with a tilde ~"
                                ,"~Willy Wonka! Willy Wonka! The amazing chocolatier!"),
    ])
    
    cheatSheet.set('Emphasis', [
        new CheatsheetItem("","The optional Title Page is always the first thing in a Fountain document"
        ,`Title:
    _**BRICK & STEEL**_
    _**FULL RETIRED**_
Credit: Written by
Author: Stu Maschwitz
Source: Story by KTM
Draft date: 1/20/2012
Contact:
    Next Level Productions
    1588 Mission Dr.
    Solvang, CA 93463`),
        new CheatsheetItem(">CENTERED TEXT<","Centered text is bracketed with greater/less-than",">THE END<"),
        new CheatsheetItem("*italics*","italics","*italics*"),
        new CheatsheetItem("**bold**","Bold text","**bold**"),
        new CheatsheetItem("***bold italics***","Bold and italics text","***bold italics***"),
        new CheatsheetItem("_underline_","Underline text","_underline_"),
        new CheatsheetItem("===","Page Breaks are indicated by a line containing three or more consecutive = signs"
                                ,">**End of Act One**<\n\n===\n\n>**Act Two**<"),
    ])

    cheatSheet.set('Misc.', [
        new CheatsheetItem("[[ notes ]]","A Note is created by enclosing some text with double brackets"
        ,`INT. TRAILER HOME - DAY

This is the home of THE BOY BAND, AKA DAN and JACK[[Or did we think of actual names for these guys?]].  They too are drinking beer, and counting the take from their last smash-and-grab.  Money, drugs, and ridiculous props are strewn about the table.

[[It was supposed to be Vietnamese, right?]]

JACK
(in Vietnamese, subtitled)
*Did you know Brick and Steel are retired?*`),
        new CheatsheetItem("/* ignore text */","If you want Fountain to ignore some text, wrap it with /* some text */"
                                ,"/*\nINT. GARAGE - DAY\n\nBRICK and STEEL get into Mom's PORSCHE, Steel at the wheel.*/"),
        new CheatsheetItem("#","Create a Section by preceding a line with one or more pound-sign # characters"
                                ,"# Act\n\n## Sequence\n\n### Scene\n\n## Another Sequence\n\n# Another Act"),
        new CheatsheetItem("=","Synopses are single lines prefixed by an equals sign =","# ACT I\n\n= Set up the characters and the story."),
    ])

    return cheatSheet;
}
