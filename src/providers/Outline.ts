import * as vscode from 'vscode';
import * as afterparser from '../afterwriting-parser';
import { activeFountainDocument, activeParsedDocument, getEditor } from '../extension';
import * as config from '../configloader';

export class FountainOutlineTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	public readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<vscode.TreeItem | null> =
		new vscode.EventEmitter<vscode.TreeItem | null>();
	public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this.onDidChangeTreeDataEmitter.event;

	treeView: vscode.TreeView<any>;
	private treeRoot: OutlineTreeItem;

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		//throw new Error("Method not implemented.");
		return element;
	}

	getChildren(element?: OutlineTreeItem): vscode.ProviderResult<any[]> {
		if (element)
			return element.children;
		if(this.treeRoot && this.treeRoot.children)
			return this.treeRoot.children;
		else return [];
	}

	getParent(element: OutlineTreeItem): any {
		// necessary for reveal() to work
		return element.parent;
	}

	update(): void {
		this.treeRoot = buildTree();
		this.onDidChangeTreeDataEmitter.fire(void 0);
	}
  
	reveal(): void {
		const currentCursorLine = getEditor(activeFountainDocument()).selection.active.line;

		// find the closest node without going past the current cursor
		const closestNode = this.treeRoot
			.filter(node => node.lineNumber <= currentCursorLine)
			.sort((a, b) => b.lineNumber - a.lineNumber)[0];

		if (closestNode) {
			this.treeView.reveal(closestNode, { select: true, focus: false, expand: 3 });
		}
	}
}

function buildTree(): OutlineTreeItem {
	const structure = activeParsedDocument().properties.structure;
	const root = new OutlineTreeItem("", "", null);
	// done this way to take care of root-level synopses and notes
	root.children.push(...structure.map(token => makeTreeItem(token, root)));
	root.children = root.children.sort((a, b) => a.lineNumber - b.lineNumber);
	return root;
}

function makeTreeItem(token: afterparser.StructToken, parent: OutlineTreeItem): OutlineTreeItem {
	var item: OutlineTreeItem;
	if (token.section)
		item = new SectionTreeItem(token, parent);
	else if(token.isnote)
		if(config.uiPersistence.outline_visibleNotes)
			item = new NoteTreeItem({note:token.text, line: token.id.substring(1) },parent);
		else
			return undefined;
	else
		item = new SceneTreeItem(token, parent);

	let passthrough = (token.section && !config.uiPersistence.outline_visibleSections) || (!token.section && !config.uiPersistence.outline_visibleScenes);

	item.children = [];

	if (token.children){
		if(passthrough)
			parent.children.push(...token.children.map((tok: afterparser.StructToken) => makeTreeItem(tok, parent)));
		else
			item.children.push(...token.children.map((tok: afterparser.StructToken) => makeTreeItem(tok, item)));
	}
	

	/* notes and synopses get pushed to this item, or to it's parent if it's a scene */
	{
		if (token.notes && config.uiPersistence.outline_visibleNotes){
			if(token.section && config.uiPersistence.outline_visibleSections){
				item.children.push(...token.notes.map(note => new NoteTreeItem(note, item)));
			}
			else{
				parent.children.push(...token.notes.map(note => new NoteTreeItem(note, parent)));
			}
		}
		if (token.synopses && config.uiPersistence.outline_visibleSynopses){
			if(token.section && config.uiPersistence.outline_visibleSections){
				item.children.push(...token.synopses.map(syn => new SynopsisTreeItem(syn, item)));
			}
			else{
				parent.children.push(...token.synopses.map(syn => new SynopsisTreeItem(syn, parent)));
			}
		}
			
	}

	if (item.children.length > 0)
		item.collapsibleState = vscode.TreeItemCollapsibleState.Expanded;


	if(passthrough){
		parent.children = parent.children.sort((a,b) => a.lineNumber - b.lineNumber);
		return undefined;
	}
	else{
		item.children = item.children.sort((a, b) => a.lineNumber - b.lineNumber);
		return item;
	}
}

class OutlineTreeItem extends vscode.TreeItem {
	children: OutlineTreeItem[] = [];
	lineNumber: number;

	constructor(label: string, public path: string, public parent: OutlineTreeItem) {
		super(label);

		if (path) {
			var endDigits = path.match(/(\d+)$/);
			if (endDigits && endDigits.length > 1) {
				this.lineNumber = +endDigits[1];
				this.command = {
					command: 'fountain.jumpto',
					title: '',
					arguments: [this.lineNumber]
				};
			}
		}
	}

	/** returns all nodes in the tree that pass this predicate, including this node */
	filter(predicate: (node: OutlineTreeItem) => boolean): OutlineTreeItem[] {
		const result: OutlineTreeItem[] = [];

		if (predicate(this))
			result.push(this);

		if (this.children)
			this.children.forEach(child => result.push(...child.filter(predicate)));

		return result;
	}
}

class SectionTreeItem extends OutlineTreeItem {
	constructor(token: afterparser.StructToken, parent: OutlineTreeItem) {
		super(token.text, token.id, parent)

		var sectionDepth = Math.min((token.id.match(/\//g) || []).length, 5); //maximum depth is 5 - anything deeper is the same color as 5
		this.iconPath = __filename + '/../../../assets/section' + sectionDepth + '.svg';
		if (token.synopses && token.synopses.length > 0) {
			this.tooltip = token.synopses.map(s => s.synopsis).join('\n');
		}
	}
}

class SceneTreeItem extends OutlineTreeItem {
	constructor(token: afterparser.StructToken, parent: OutlineTreeItem) {
		super(token.text, token.id, parent)

		this.iconPath = __filename + '/../../../assets/scene.svg';
		if (token.synopses && token.synopses.length > 0) {
			this.tooltip = token.synopses.map(s => s.synopsis).join('\n');
		}
	}
}

class NoteTreeItem extends OutlineTreeItem {
	constructor(token: { note: string, line: number }, parent: OutlineTreeItem) {
		super("", token.line.toString(), parent)

		this.iconPath = {
			light: __filename + '/../../../assets/note_light_offset.svg',
			dark: __filename + '/../../../assets/note_dark_offset.svg'
		};
		this.description = token.note;
		this.tooltip = this.description;
	}
}

class SynopsisTreeItem extends OutlineTreeItem {
	constructor(token: { synopsis: string, line: number }, parent: OutlineTreeItem) {
		super("", token.line.toString(), parent)

		this.iconPath = __filename + '/../../../assets/synopse_offset.svg';
		this.description = token.synopsis;
		this.tooltip = this.description;
	}
}
