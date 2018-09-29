'use strict';

import * as path from 'path';
import { workspace, ExtensionContext, languages, FoldingRangeProvider, TextDocument, FoldingRange } from 'vscode';
import * as vscode from 'vscode';
import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';
var fountain = require('@tibas.london/fountain');


/*
export class FountainOutlineTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	onDidChangeTreeData?: vscode.Event<any>;	
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		//throw new Error("Method not implemented.");
		if(element)
		return undefined;
		else
		return undefined;
	}
	getChildren(element?: vscode.TreeItem): vscode.ProviderResult<any[]> {
		if(element==undefined)
			return scenePositions;
	}
	getParent?(element: vscode.TreeItem) : any {
		return undefined;
	}

  }*/
let client: LanguageClient;

var previewpanel : vscode.WebviewPanel;
const css = `#workspace,body{font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}#workspace #inspector li a:hover,#workspace #toolbar li a:hover,a{text-decoration:none}body{;color:#333;font-size:14px;margin:0}a{color:#ED303C}a:hover{text-decoration:underline}.container{margin:0 auto;position:relative;width:850px}header{background-color:#454545;color:#F0F0D8;font-size:13px;height:40px;line-height:40px;width:100%}header::-moz-selection,header::selection{background:#454545;color:#fff}#dock{margin:0}#dock header{margin-bottom:25px}#dock header h1{background:url(../images/fountain-24.png) 0 9px no-repeat;color:#fff;font-size:16px;margin:0;padding-left:34px}#dock blockquote{background:#fff;margin:0;padding:10px}#dock p.more-information{font-size:12px;margin:5px 0 25px;padding:0;text-align:right}#dock #file-api{background:#fff;border:3px dashed #454545;display:none;margin-top:75px;text-align:center}#dock #file-api.over{border-color:#ED303C;cursor:pointer}#dock #file-api p{font-weight:700;margin:125px auto}#dock p.error{background:url(../images/warning.png) 10px 10px no-repeat #fff;font-weight:700;margin-top:75px;padding:15px 15px 15px 50px}#workspace{color:#333;display:none;float:left;position:relative;width:100%}#workspace header.dimmed{background-color:transparent}#workspace header.dimmed p{color:#333;font-weight:700}#workspace header li,#workspace header p,#workspace header ul{display:inline;float:left;margin:0;padding:0}#workspace header p{color:#fff;font-size:15px;height:20px;line-height:20px;margin-top:10px;text-align:center;width:44%}#workspace header ul{padding:0;width:27%;-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;-o-user-select:none;user-select:none}#workspace #toolbar{float:right;margin-right:3px}#workspace #inspector li,#workspace #toolbar li{height:16px;line-height:16px;margin:12px 12px 12px 0;position:relative;width:16px}#workspace #toolbar li{float:right;margin:12px 0 12px 12px;text-align:right}#workspace #inspector li a,#workspace #toolbar li a{cursor:pointer;color:#3C3D36;display:block;height:16px;text-indent:16px;overflow:hidden;width:16px}#workspace #inspector li a:hover:after,#workspace #toolbar li a:hover:after{background:#ED303C;border-radius:4px;color:#fff;content:attr(data-tooltip);left:-5px;padding:3px 7px 4px 30px;position:absolute;text-align:left;text-indent:0;top:-3px}#workspace #toolbar li a:hover:after{background-position:5px 3px;background-repeat:no-repeat}#workspace #toolbar li.resize{background:url(../images/toolbar/resize.small.png) top left no-repeat}#workspace #toolbar li.resize:hover{background-image:url(../images/toolbar/resize.small-hover.png)}#workspace #toolbar li.resize.large{background:url(../images/toolbar/resize.large.png) top left no-repeat}#workspace #toolbar li.resize.large:hover{background-image:url(../images/toolbar/resize.large-hover.png)}#workspace #toolbar li.resize a:hover:after{background-image:url(../images/toolbar/resize.small-hover.png);width:78px}#workspace #toolbar li.resize.large a:hover:after{background-image:url(../images/toolbar/resize.large-hover.png)}#workspace #toolbar li.dim{background:url(../images/toolbar/dim.reduce.png) top left no-repeat}#workspace #toolbar li.dim:hover{background-image:url(../images/toolbar/dim.reduce-hover.png)}#workspace #toolbar li.dim.increase{background:url(../images/toolbar/dim.increase.png) top left no-repeat}#workspace #toolbar li.dim.increase:hover{background-image:url(../images/toolbar/dim.increase-hover.png)}#workspace #toolbar li.dim a:hover:after{background-image:url(../images/toolbar/dim.reduce-hover.png);width:83px}#workspace #toolbar li.dim.increase a:hover:after{background-image:url(../images/toolbar/dim.increase-hover.png)}#workspace #toolbar li.dock{background:url(../images/toolbar/dock.png) top left no-repeat}#workspace #toolbar li.dock a:hover:after,#workspace #toolbar li.dock:hover{background-image:url(../images/toolbar/dock-hover.png)}#workspace #toolbar li.dock a:hover:after{width:90px}#workspace #toolbar li.dock.over{background:url(../images/toolbar/dock-drop.png) no-repeat;cursor:pointer}#workspace #inspector li a:hover:after{background-position:5px 3px;background-repeat:no-repeat}#workspace .notification::-moz-selection,#workspace .notification::selection{background:#454545}#workspace .notification{background:url(../images/notification.png) 6px 6px no-repeat #454545;border-radius:4px;color:#fff;display:none;font-size:13px;padding:6px 8px 6px 28px;position:absolute;right:5px;top:-8px}#workspace #script{margin:25px auto 0;width:850px}#workspace .page::-moz-selection,#workspace .page::selection{background:#ED303C;color:#fff}#workspace #script .page{background:#fff;border:1px solid #d2d2d2;border-radius:2px;color:#222;cursor:text;font:Courier,"Courier New",monospace;letter-spacing:0!important;font-family:'Courier Final Draft',Courier,Courier New,monospace;line-height:107.5%;margin-bottom:25px;position:relative;text-align:left;width:100%;z-index:200;-webkit-box-shadow:0 0 5px rgba(0,0,0,.1);-moz-box-shadow:0 0 5px rgba(0,0,0,.1);box-shadow:0 0 5px rgba(0,0,0,.1);-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}#workspace #script.dpi72 .page{font-size:12px;padding:72px 72px 72px 108px}#workspace #script.dpi100 .page{font-size:16px;padding:100px 100px 100px 150px}#workspace #script.dpi150 .page{font-size:33px;padding:150px 150px 150px 225px}#workspace #script.dpi72 .page h1,#workspace #script.dpi72 .page h2,#workspace #script.dpi72 .page h3,#workspace #script.dpi72 .page h4,#workspace #script.dpi72 .page p{font-size:12px;font-weight:400}#workspace #script.dpi100 .page h1,#workspace #script.dpi100 .page h2,#workspace #script.dpi100 .page h3,#workspace #script.dpi100 .page h4,#workspace #script.dpi100 .page p{font-size:17px;font-weight:400}#workspace #script.dpi150 .page h1,#workspace #script.dpi150 .page h2,#workspace #script.dpi150 .page h3,#workspace #script.dpi150 .page h4,#workspace #script.dpi150 .page p{font-size:33px;font-weight:400}#workspace #script.us-letter.dpi72{width:612px}#workspace #script.us-letter.dpi100{width:850px}#workspace #script.us-letter.dpi150{width:1275px}#workspace #script.us-letter.dpi72 .page{min-height:792px}#workspace #script.us-letter.dpi100 .page{min-height:1100px}#workspace #script.us-letter.dpi150 .page{min-height:1650px}#workspace #script.us-letter.dpi72 .page.title-page{height:792px}#workspace #script.us-letter.dpi100 .page.title-page{height:1100px}#workspace #script.us-letter.dpi150 .page.title-page{height:1650px}#workspace #script.a4.dpi72{width:595px}#workspace #script.a4.dpi100{width:827px}#workspace #script.a4.dpi150{width:1250px}#workspace #script.a4.dpi72 .page{height:842px}#workspace #script.a4.dpi100 .page{height:1169px}#workspace #script.a4.dpi150 .page{height:1754px}#workspace #script .title-page h1{margin-top:50%;margin-bottom:34px;text-align:center;width:90.5%}#workspace #script .title-page p.credit{text-align:center;width:90.5%}#workspace #script .title-page p.author,#workspace #script .title-page p.authors{margin-bottom:32px;margin-top:0;text-align:center;width:90.5%}#workspace #script .title-page p.source{margin-bottom:32px;text-align:center;width:90.5%}#workspace #script .title-page p.notes{bottom:350px;position:absolute;right:0;text-align:right}#workspace #script.dpi72 .title-page p.notes{bottom:252px;right:72px}#workspace #script.dpi100 .title-page p.notes{bottom:350px;right:100px}#workspace #script.dpi150 .title-page p.notes{bottom:525px;right:150px}#workspace #script .title-page p.date,#workspace #script .title-page p.draft-date{bottom:250px;position:absolute;right:0;text-align:right}#workspace #script.dpi72 .title-page p.date,#workspace #script.dpi72 .title-page p.draft-date{bottom:180px;right:72px}#workspace #script.dpi100 .title-page p.date,#workspace #script.dpi100 .title-page p.draft-date{bottom:250px;right:100px}#workspace #script.dpi150 .title-page p.date,#workspace #script.dpi150 .title-page p.draft-date{bottom:375px;right:150px}#workspace #script .title-page p.contact{bottom:100px;position:absolute;right:0;text-align:right}#workspace #script.dpi72 .title-page p.contact{bottom:72px;right:72px}#workspace #script.dpi100 .title-page p.contact{bottom:100px;right:100px}#workspace #script.dpi150 .title-page p.contact{bottom:150px;right:150px}#workspace #script .title-page p.copyright{bottom:100px;position:absolute;text-align:left}#workspace #script.dpi72 .title-page p.copyright{bottom:72px}#workspace #script.dpi100 .title-page p.copyright{bottom:100px}#workspace #script.dpi150 .title-page p.copyright{bottom:150px}#workspace #script .page h2{text-align:right}#workspace #script .page h2.left-aligned{text-align:left}#workspace #script .page h3{position:relative;}#workspace #script .page h3:before{color:#bbb;content:attr(id);font-weight:700;left:-45px;position:absolute}#workspace #script .page h3:after{color:#bbb;content:attr(id);font-weight:700;right:-45px;position:absolute}#workspace #script .page div.dialogue{margin-left:auto;margin-right:auto;width:68%}#workspace #script .page div.dialogue h4{margin-bottom:0;margin-left:23%}#workspace #script .page div.dialogue p.parenthetical{margin-bottom:0;margin-top:0;margin-left:11%}#workspace #script .page div.dialogue p{margin-bottom:0;margin-top:0}#workspace #script .page div.dual-dialogue{margin:2em 0 .9em 2%;width:95%}#workspace #script .page div.dual-dialogue div.dialogue{display:inline-block;margin:0;width:45%}#workspace #script .page div.dual-dialogue div.dialogue h4{margin-top:0}#workspace #script .page div.dual-dialogue div.dialogue.right{float:right}#workspace #script .page p.centered{text-align:center;width:92.5%}#workspace #script .page p.section{color:#bbb;margin-left:-30px}#workspace #script .page p.synopsis{color:#bbb;margin-left:-20px}#workspace #script .page span.italic{font-style:italic}#workspace #script .page span.bold{font-weight:700} .page h3{font-weight:bold;}`	
function updateWebView(titlepage:string, script:string){

	previewpanel.webview.html = "<html><head><style>"+css+"</style></head><body id='fountain-js'><section id='workspace' style='display:block;'><div id='script' class='us-letter dpi100'><div id='titlepage' class='page title-page'>" + titlepage + "</div><div id='mainpage' class='page'>" + script + "</div></div></section>"+
	`<script>
	window.addEventListener('message', event => {
	if(event.data.command == 'updateScript'){
		document.getElementById('mainpage').innerHTML = event.data.content;
	}else if(event.data.command == 'updateTitle'){
		document.getElementById('titlepage').innerHTML = event.data.content;
	}
	});
	</script></body></html>`;
}
export function activate(context: ExtensionContext) {

	//Register for live preview
	context.subscriptions.push(vscode.commands.registerCommand('fountain.livepreview', () => {

		// Create and show a new webview
		
        previewpanel = vscode.window.createWebviewPanel(
            'fountainPreview', // Identifies the type of the webview. Used internally
            "Screenplay preview", // Title of the panel displayed to the user
            vscode.ViewColumn.Three, // Editor column to show the new webview panel in.
            { enableScripts: true } // Webview options. More on these later.
		);
		var rawcontent = vscode.window.activeTextEditor.document.getText();
		var output = fountain.parse(rawcontent);
		updateWebView(output.html.title_page, output.html.script);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('fountain.exportpdf', async () => {
		var filepath = await vscode.window.showSaveDialog(
			{
				filters: { "PDF File":[".pdf"] },
				defaultUri: vscode.Uri.file(vscode.window.activeTextEditor.document.fileName.replace('.fountain','.pdf')
			)});
		if(filepath == undefined) return;
		const { exec } = require('child_process');
		exec('afterwriting --source \"' + vscode.window.activeTextEditor.document.fileName + '\" --pdf \"'+filepath.fsPath+'\" --overwrite', (err:any) => {
			if (err)
				vscode.window.showErrorMessage("Failed to export PDF: " + err);
			else
				vscode.window.showInformationMessage("Exported PDF!");
		});
	}));

	vscode.commands.registerCommand('type', (args) => {

		//Automatically skip to the next line at the end of parentheticals
        if(args.text == "\n"){
			const editor = vscode.window.activeTextEditor;
			if (editor.selection.isEmpty) {
				const position = editor.selection.active;
				var linetext = editor.document.getText(new vscode.Range(new vscode.Position(position.line,0), new vscode.Position(position.line, 256)));
				if(position.character == linetext.length-1){
					if(linetext.match(/^\s*\(.*\)$/g)){
						var newpos = new vscode.Position(position.line, linetext.length);
						editor.selection = new vscode.Selection(newpos,newpos);
					}
				}
			}
		}
		vscode.commands.executeCommand('default:type', {
			text: args.text
		});
    });
	
	//Setup custom folding mechanism
	languages.registerFoldingRangeProvider({ scheme: 'file', language: 'fountain' }, new MyFoldingRangeProvider());
	
	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};

	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'fountain' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'languageServerExample',
		'Language Server Example',
		serverOptions,
		clientOptions
	);

	// Start the client. This will also launch the server
	client.start();
}

vscode.workspace.onDidChangeTextDocument(change => {
	if(previewpanel != null && change.document.languageId=="fountain"){
		var output = fountain.parse(change.document.getText());
		previewpanel.webview.postMessage({ command: 'updateTitle', content: output.html.title_page });
		previewpanel.webview.postMessage({ command: 'updateScript', content: output.html.script });
	}
})

var scenePositions:string[] = [];
function GetRanges(re: RegExp, document: TextDocument/*, preranges:  FoldingRange[]*/) : FoldingRange[]{
		var match;
		var matchlines = [];
		var ranges = [];
		while ((match = re.exec(document.getText())) != null) {
			var lineposition = document.positionAt(match.index).line;
			matchlines.push(lineposition);
			scenePositions.push(document.getText(new vscode.Range(document.positionAt(match.index),document.positionAt(match.index+match.length))));
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
}

class MyFoldingRangeProvider implements FoldingRangeProvider {
    provideFoldingRanges(document: TextDocument): FoldingRange[] {
		var ranges: FoldingRange[] = [];

		//TODO: Fix ranges
		/*
		//Add the header 1
		ranges = ranges.concat(GetRanges(/^#[^\n\r#]+$/gm, document, ranges));

		//Add the header 2
		ranges = ranges.concat(GetRanges(/^##[^\n\r#]+$/gm, document, ranges));
		
		//Add the header 3
		ranges = ranges.concat(GetRanges(/^###[^\n\r#]+$/gm, document, ranges));
		*/

		//Add the scenes
		ranges = ranges.concat(GetRanges(/^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)/gim, document/*, ranges*/));
		return ranges;
    }
}


export function deactivate(): Thenable<void> {
	if (!client) {
		return undefined;
	}
	return client.stop();
}
