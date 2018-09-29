'use strict';

import {
	createConnection,
	TextDocuments,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams
} from 'vscode-languageserver';

// Create a connection for the server. The connection uses Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
//let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we will fall back using global settings
	hasConfigurationCapability =
		capabilities.workspace && !!capabilities.workspace.configuration;
	hasWorkspaceFolderCapability =
		capabilities.workspace && !!capabilities.workspace.workspaceFolders;
/*	hasDiagnosticRelatedInformationCapability =
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation;*/

	return {
		capabilities: {
			textDocumentSync: documents.syncKind,
			// Tell the client that the server supports code completion
			completionProvider: {
				resolveProvider: true
			},
			//Tell the client that the server supports formatting as you type
			documentOnTypeFormattingProvider:{
				"firstTriggerCharacter":")"
			}
		}
	};
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(
			DidChangeConfigurationNotification.type,
			undefined
		);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}
});

// The example settings
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
//const defaultSettings: ExampleSettings = { maxNumberOfProblems: 1000 };
//let globalSettings: ExampleSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<ExampleSettings>> = new Map();

connection.onDidChangeConfiguration(/*change*/() => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
	/*	globalSettings = <ExampleSettings>(
			(change.settings.languageServerExample || defaultSettings)
		);*/
	}

	// Revalidate all open text documents
	//documents.all().forEach(validateTextDocument);
});

/*
function getDocumentSettings(resource: string): Thenable<ExampleSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'languageServerExample'
		});
		documentSettings.set(resource, result);
	}
	return result;
}*/

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
/*documents.onDidChangeContent(change => {
	//validateTextDocument(change.document);
});*/


connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

/*
function TimeofDayCompletion(input:string) : CompletionItem{
	return {
		label: "- "+input,
		kind: CompletionItemKind.Constant,
		data: "TIMEOFDAY",
		filterText: " - "+input
	}
}*/

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		var completes: CompletionItem[] = [];
		//let scenepattern = /(^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+)) [- ]*/gim;
		let scenepattern = /(^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+)|^(?:\.(?!\.+))(.+))/gim;
		let characterpattern = /^(([A-Z0-9 ]+(\([A-z0-9 '\-.()]+\))*|(@.*))(\s*\^)?)$/gm;
		var doc = documents.get(_textDocumentPosition.textDocument.uri);
		if(_textDocumentPosition.position.character == 1){
			var doctext = doc.getText();
			//autocomplete for title keys
			var firstscenePosition = doctext.search(scenepattern);
			var firstSceneNotReached = (_textDocumentPosition.position.line < doc.positionAt(firstscenePosition).line);
			if(firstscenePosition!= -1){
				if(firstSceneNotReached){
					completes.push({
						label: "Title: ",
						kind: CompletionItemKind.Constant,
						data: "TITLEPAGE.Title",
					});
					completes.push({
						label: "Credit: ",
						kind: CompletionItemKind.Constant,
						data: "TITLEPAGE.Credit",
					});
					completes.push({
						label: "Author: ",
						kind: CompletionItemKind.Constant,
						data: "TITLEPAGE.Author",
					});
					completes.push({
						label: "Source: ",
						kind: CompletionItemKind.Constant,
						data: "TITLEPAGE.Source",
					});
					completes.push({
						label: "Draft date: ",
						kind: CompletionItemKind.Constant,
						data: "TITLEPAGE.DraftDate",
					});
					completes.push({
						label: "Contact: ",
						kind: CompletionItemKind.Constant,
						data: "TITLEPAGE.Contact",
					});
					completes.push({
						label: "Copyright: ",
						kind: CompletionItemKind.Constant,
						data: "TITLEPAGE.Copyright",
					});
					completes.push({
						label: "Date: ",
						kind: CompletionItemKind.Constant,
						data: "TITLEPAGE.Date",
					});
				}
			}

			//scene initializers
			completes.push({
				label: 'INT.',
				kind: CompletionItemKind.Text,
				data: "SCENE",
				insertText: 'INT. ',
			});
			completes.push({
				label: 'EXT.',
				kind: CompletionItemKind.Text,
				data: "SCENE",
				insertText: 'EXT. '
			});

			
			if(!firstSceneNotReached){
			//autcomplete for scenes
			var scenematches = (doctext.match(scenepattern));
			var sceneresults:RegExpMatchArray = [];
			if(scenematches!=null){
				sceneresults = scenematches.filter(function(item, pos, self) {
					return self.indexOf(item) == pos;
				})
				for (let i = 0; i < sceneresults.length; i++) {
					sceneresults[i] = sceneresults[i].trim();
				}
				sceneresults.forEach((item) =>{
					{
						if(item.length>1){
						completes.push({
							label: item,
							insertText: item+"\n"+"\n",
							kind: CompletionItemKind.Constant,
							data: "SCENE",
						})
					}
					}
				})
			} 

			//autocomplete for characters
			var charactermatches = (doctext.match(characterpattern));
			var characterresults:RegExpMatchArray = [];
			if(charactermatches != null){
				characterresults = charactermatches.filter(function(item, pos, self) {
					return self.indexOf(item) == pos;
				})
				for (let i = 0; i < characterresults.length; i++) {
					characterresults[i] = characterresults[i].trim();
				}
				characterresults.forEach((item) =>{
					{
						if(item.length>1){
						completes.push({
							label: item,
							kind: CompletionItemKind.Reference,
							data: "CHARACTER",
							insertText: item +"\n"
						});
					}
					}
				})
			}
			}
		}
		/*
		else{
			var currentLine = doc.getText(Range.create({line:_textDocumentPosition.position.line, character:0}, _textDocumentPosition.position));
			if(currentLine.match(/(^((?:\*{0,3}_?)?(?:(?:int|ext|est|i\/e)[. ]).+) ([-A-z]+)|^(?:\.(?!\.+))(.+))/gi)){
				completes.push(TimeofDayCompletion("NIGHT"));
				completes.push(TimeofDayCompletion("DAY"));
				completes.push(TimeofDayCompletion("MORNING"));
				completes.push(TimeofDayCompletion("AFTERNOON"));
				completes.push(TimeofDayCompletion("EVENING"));
				completes.push(TimeofDayCompletion("DAWN"));
				completes.push(TimeofDayCompletion("NOON"));
				completes.push(TimeofDayCompletion("MIDNIGHT"));
			}
		}*/
		return completes;
	}
);

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
	(item: CompletionItem): CompletionItem => {
		if (item.data == "INT") {
			item.detail = 'Interior scene'
			item.documentation = "Should be followed by the location of the scene, and finally the time of day. e.g. \"INT. COFFEE SHOP – MORNING\"";
		} else if (item.data == "EXT") {
			item.detail = 'Exterior scene'
			item.documentation = "Should be followed by the location of the scene, and finally the time of day. e.g. \"EXT. ALLEY (RAINING) – NIGHT\"";
		} else if (item.data == "CHARACTER") {
			item.detail = 'Character name'
		}
		else if (item.data == "SCENE") {
			item.data = 'Scene'
			item.documentation = "Formatted as INT./EXT. (Interior or Exterior), followed by the location of the scene, and finally the time of day. e.g. \"INT. COFFEE SHOP – MORNING\"";
		}
		else if(item.data.startsWith("TITLEPAGE")){
			item.detail = "Title page key";
			switch(item.data){
				case "TITLEPAGE.Title": item.documentation = "The screenplay's title"; break;
				case "TITLEPAGE.Credit": item.documentation = "How the author should be credited (for example \"Written by\")"; break;
				case "TITLEPAGE.Author": item.documentation = "The author of the screenplay"; break;
				case "TITLEPAGE.Source": item.documentation = "An additional field below the author (such as \"Story by Shakespeare\" or \"Batman created by Bob Kane\")"; break;
				case "TITLEPAGE.Contact": item.documentation = "Contact details of the author"; break;
				case "TITLEPAGE.DraftDate": item.documentation = "The date of the current draft"; break;
				case "TITLEPAGE.Copyright": item.documentation = "Copyright notice"; break;
				case "TITLEPAGE.Date": item.documentation = "The date of the screenplay"; break;
			}
		}
		return item;
	}
);

/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.textDocument.uri} opened.`);
});
connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.textDocument.uri} changed: ${JSON.stringify(params.contentChanges)}`);
});
connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.textDocument.uri} closed.`);
});
*/

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
