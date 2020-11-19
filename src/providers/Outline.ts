import * as vscode from 'vscode';
import * as afterparser from '../afterwriting-parser';
import { activeParsedDocument } from '../extension';
import * as config from '../configloader';

export class FountainOutlineTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	public readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<vscode.TreeItem | null> =
		new vscode.EventEmitter<vscode.TreeItem | null>();
	public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this.onDidChangeTreeDataEmitter.event;

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		//throw new Error("Method not implemented.");
		return element;
	}
	getChildren(element?: vscode.TreeItem): vscode.ProviderResult<any[]> {
		var elements: vscode.TreeItem[] = [];
		const pushSection = (token:afterparser.StructToken, lineNo:string) => {
			var item = new vscode.TreeItem(token.text);
			item.id = token.id;
			if (token.children != null && token.children.length > 0) {
				item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;
			}
			if (token.synopses && token.synopses.length>0) {				
				item.tooltip = token.synopses.map(s => s.synopsis).join('\n');				
			}

			if (token.section) {
				var sectionDepth = Math.min((token.id.match(/\//g) || []).length, 5); //maximum depth is 5 - anything deeper is the same color as 5
				item.iconPath = __filename + '/../../../assets/section' + sectionDepth + '.svg';
			}
			else {
				item.iconPath = __filename + '/../../../assets/scene.svg';					
			}
			item.command = {
				command: 'fountain.jumpto',
				title: '',
				arguments: [lineNo]
			};
			
            
            if (token.synopses && token.synopses.length>0 && config.uiPersistence.outline_visibleSynopses) {
				let loopCounterStart = 0;
				// the loop counter starts allows us to not show the first synopse of a collapsible item (seeing as it's added to the description)
				if(item.collapsibleState!=vscode.TreeItemCollapsibleState.None){
					//If the item is collapsable, also render the synopse as a description (otherwise it's after all the children of the item)
					item.description=token.synopses[0].synopsis;
					loopCounterStart = 1;
				}
				elements.push(item);
                for (let i = loopCounterStart; i < token.synopses.length; i++) {
                    let synopse = new vscode.TreeItem("");
					synopse.iconPath = __filename + '/../../../assets/synopse_offset.svg';
					synopse.description = token.synopses[i].synopsis;
					synopse.tooltip = synopse.description;
                    synopse.command = {
                        command: 'fountain.jumpto',
                        title: '',
                        arguments: [token.synopses[i].line]
                    };
                    elements.push(synopse);
                }
			}
			else{
				elements.push(item);
			}

			if (token.notes && token.notes.length > 0 && config.uiPersistence.outline_visibleNotes) {
                for (let i = 0; i < token.notes.length; i++) {
					let item = new vscode.TreeItem("");
					item.iconPath = {
						light: __filename + '/../../../assets/note_light_offset.svg',
						dark: __filename + '/../../../assets/note_dark_offset.svg'
					};
					item.description = token.notes[i].note;
					item.tooltip = item.description;
					item.command = {
                        command: 'fountain.jumpto',
                        title: '',
                        arguments: [token.notes[i].line]
                    };
                    elements.push(item);
                }
			}
		}

		const structure = activeParsedDocument().properties.structure;

		if (element == null) {
			// push in the top level sections (Acts) or Scenes outside of Acts
			for (let index = 0; index < structure.length; index++) {
				const token = structure[index];
				pushSection(token, token.id.substring(1))
			}
		}
		else if (element.collapsibleState != vscode.TreeItemCollapsibleState.None) {
			// find sections and scenes within the given element 
			var elementPath: string[] = element.id.split("/");

			// to recursively find sections and scenes
			const findSections = (token:afterparser.StructToken, depth:number) => {
				var tokenPath: string[] = token.id.split("/");
				if (elementPath.length >= depth+1) {
					if (tokenPath[depth] == elementPath[depth]) {
						token.children.forEach((subToken:afterparser.StructToken) => findSections(subToken, depth+1))
					}
				}
				else {
                    pushSection(token, tokenPath[depth]);
                }
			}

			structure.forEach(token => findSections(token, 1));
		}

		elements = elements.sort((a,b)=>a.command.arguments[0]-b.command.arguments[0])
		return elements;
	}
	update(): void {
		this.onDidChangeTreeDataEmitter.fire(void 0);
	}
}