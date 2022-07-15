import * as vscode from 'vscode';

export class FountainCheatSheetWebviewViewProvider implements vscode.WebviewViewProvider {
    
    constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

    resolveWebviewView(webviewView: vscode.WebviewView, _context: vscode.WebviewViewResolveContext<unknown>, _token: vscode.CancellationToken): void | Thenable<void> {
       
        webviewView.webview.options = {
			localResourceRoots: [
				this._extensionUri
			]
		};
       
        const cssDiskPath = vscode.Uri.joinPath(this._extensionUri, 'out', 'webviews', 'cheatsheet.css');
        const styleUri = webviewView.webview.asWebviewUri(cssDiskPath).toString();
        const codiconDiskPath = vscode.Uri.joinPath(this._extensionUri, 'node_modules', 'vscode-codicons', 'dist', 'codicon.css');
        const codiconUri = webviewView.webview.asWebviewUri(codiconDiskPath).toString();

        const fontUri = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'courierprime', 'courier-prime.ttf')).toString();
        const fontUriBold = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'courierprime', 'courier-prime-bold.ttf')).toString();
        const fontUriItalic = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'courierprime', 'courier-prime-italic.ttf')).toString();
        const fontUriBoldItalic = webviewView.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'courierprime', 'courier-prime-bold-italic.ttf')).toString();

        webviewView.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webviewView.webview.cspSource} 'unsafe-inline'; font-src https://* file://*">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            
           
            <title>Cheat Sheet</title>
            <link rel="stylesheet" href="${styleUri}">
            <link rel="stylesheet" type="text/css" href="${codiconUri}">
            <style>
            @font-face{
                font-family: betterfountain-screenplayfont;
                src:url(${fontUri});
                font-weight: normal;
            }
            @font-face{
                font-family: betterfountain-screenplayfont;
                src:url(${fontUriBold});
                font-weight: bold;
            }
            @font-face{
                font-family: betterfountain-screenplayfont;
                src:url(${fontUriItalic});
                font-weight: normal;
                font-style: italic;
            }
            @font-face{
                font-family: betterfountain-screenplayfont;
                src:url(${fontUriBoldItalic});
                font-weight: bold;
                font-style: italic;
            }
            </style>
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
            result+= `<details class="cheat-item"><summary><span class="keyword">${item.keyword}</span> <span>${item.description}</span></summary> 
            <p class="example">${item.example}</p>
            </details>`
        })
        result += "</div></details>"
        
    })
    return result;
}

function getCheatSheet(): Map<string,CheatsheetItem[]>{
    let cheatSheet: Map<string,CheatsheetItem[]> = new Map<string,CheatsheetItem[]>();
    cheatSheet.set('Scenes', [
        new CheatsheetItem("INT.","Indoor scene","<span class='scene'>INT. BRICK'S ROOM - DAY</span>"),
        new CheatsheetItem("EXT.","Outdoor scene","<span class='scene'>EXT. BRICK'S POOL - DAY</span>"),
        new CheatsheetItem("EST.","Establishing scene","<span class='scene'>EST. CITY - NIGHT</span>"),
        new CheatsheetItem("INT./EXT.","Indoor and Outdoor scene","<span class='scene'>INT./EXT. RONNA'S CAR - NIGHT [DRIVING]</span>"),
        new CheatsheetItem("I/E.","Indoor and Outdoor scene","<span class='scene'>I/E. RONNA'S CAR - NIGHT [DRIVING]</span>"),
        new CheatsheetItem("TO:","Transitions should be upper case, ending in ' TO:'"
                                ,"Jack begins to argue vociferously in Vietnamese (?), But mercifully we...\n\n<span class='transition'>CUT TO:</span>\n\n<span class='scene'>EXT. BRICK'S POOL - DAY</span>"),
        new CheatsheetItem("","Action, or scene description, is any paragraph that doesn't meet criteria for another element"
                                ,`They drink long and well from the beers.\n\nAnd then there's a long beat.\nLonger than is funny.\nLong enough to be depressing.\n\nThe men look at each other.`),   ])

    cheatSheet.set('Dialogues', [
        new CheatsheetItem("","Character names should be in upper case","<span class='character'>STEEL</span>\n<span class='dialogue'>The man's a myth!</span>"),
        new CheatsheetItem("","Dialogue is any text following a Character or Parenthetical element"
                                ,"<span class='character'>SANBORN</span>\n<span class='dialogue'>A good 'ole boy.</span>"),
        new CheatsheetItem("(parantheticals)","Parentheticals follow a Character or Dialogue element, and are wrapped in parentheses ()"
                                ,"<span class='character'>STEEL</span>\n<span class='parenthetical'>(starting the engine)</span><span class='dialogue'>\nSo much for retirement!</span>"),
        new CheatsheetItem("^","Dual, or simultaneous, dialogue is expressed by adding a caret ^ after the second Character element"
                                ,"<span class='character'>BRICK</span>\n<span class='dialogue'>Screw retirement.</span>\n\n<span class='character'>STEEL</span><span class='caret'>^</span>\n<span class='dialogue'>Screw retirement.</span>"),
        new CheatsheetItem("~","Lyric lines start with a tilde ~"
                                ,"<span class='lyrics'>~Willy Wonka! Willy Wonka! The amazing chocolatier!</span>"),
    ])
    
    cheatSheet.set('Emphasis', [
        new CheatsheetItem("","The optional Title Page is always the first thing in a Fountain document"
        ,`<span class='tkey'>Title</span>:
    <span class='tvalue'>_**BRICK & STEEL**_
    _**FULL RETIRED**_</span>
<span class='tkey'>Credit</span>: <span class='tvalue'>Written by</span>
<span class='tkey'>Author</span>: <span class='tvalue'>Stu Maschwitz</span>
<span class='tkey'>Source</span>: <span class='tvalue'>Story by KTM</span>
<span class='tkey'>Draft date</span>: <span class='tvalue'>1/20/2012</span>
<span class='tkey'>Contact</span>:
<span class='tvalue'>Next Level Productions
    1588 Mission Dr.
    Solvang, CA 93463</span>`),
        new CheatsheetItem(">CENTERED TEXT<","Centered text is bracketed with greater/less-than","<span class='centered'>&gt;THE END&lt;</span>"),
        new CheatsheetItem("*italics*","italics","<span class='italics'>*italics*</span>"),
        new CheatsheetItem("**bold**","Bold text","<span class='bold'>**bold**"),
        new CheatsheetItem("***bold italics***","Bold and italics text","<span class='bold italics'>***bold italics***</span>"),
        new CheatsheetItem("_underline_","Underline text","<span class='underline'>_underline_</span>"),
        new CheatsheetItem("===","Page Breaks are indicated by a line containing three or more consecutive = signs"
                                ,"<span class='centered '>&gt;<span class='bold'>**End of Act One**</span>&lt;\n\n<span class='linebreak'>===</span>\n\n#Act Two"),
    ])

    cheatSheet.set('Misc.', [
        new CheatsheetItem("[[ notes ]]","A Note is created by enclosing some text with double brackets"
        ,`<span class='scene'>INT. TRAILER HOME - DAY</span>

This is the home of THE BOY BAND, AKA DAN and JACK<span class='note'>[[Or did we think of actual names for these guys?]]</span>.  They too are drinking beer, and counting the take from their last smash-and-grab.  Money, drugs, and ridiculous props are strewn about the table.

<span class='note'>[[It was supposed to be Vietnamese, right?]]</span>

<span class='character'>JACK</span>
<span class='parenthetical'>(in Vietnamese, subtitled)</span>
<span class='dialogue'>Did you know Brick and Steel are retired?</span>`),
        new CheatsheetItem("/* ignore text */","If you want Fountain to ignore some text, wrap it with /* some text */"
                                ,"<span class='boneyard'>/*\nINT. GARAGE - DAY\n\nBRICK and STEEL get into Mom's PORSCHE, Steel at the wheel.*/</span>"),
        new CheatsheetItem("#","Create a Section by preceding a line with one or more pound-sign # characters"
                                ,"<span class='sequence'># Act\n\n## Sequence\n\n</span><span class='scene'>INT. SCENE IN HOUSE - DAY</span>"),
        new CheatsheetItem("=","Synopses are single lines prefixed by an equals sign =","<span class='sequence'># ACT I</span>\n\n<span class='synopse'>= Set up the characters and the story.</span>"),
    ])

    return cheatSheet;
}
