import * as vscode from 'vscode';
import { activeParsedDocument, getEditor } from '../extension';
import { CharacterTreeItem } from './yourCharacterTreeItemFile'; // You'll need to define this

export class FountainCharacterTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	public readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<vscode.TreeItem | null> =
		new vscode.EventEmitter<vscode.TreeItem | null>();
	public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this.onDidChangeTreeDataEmitter.event;

	private treeRoot: CharacterTreeItem;

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element;
	}
	getChildren(element?: CharacterTreeItem): vscode.ProviderResult<any[]> {
		if (element)
			return element.children;
		if (this.treeRoot && this.treeRoot.children)
			return this.treeRoot.children;
		else return [];
	}

	update(): void {
		this.treeRoot = buildCharacterTree();
		this.onDidChangeTreeDataEmitter.fire(void 0);
	}
}

function buildCharacterTree(): CharacterTreeItem {
	const characters = activeParsedDocument().properties.characters;

	const root = new CharacterTreeItem("Characters", null);
	root.children = [];

	for (const [character, wordCount] of characters) {
		const child = new CharacterTreeItem(`${character} (${wordCount} words)`, root);
		root.children.push(child);
	}

	return root;
}

class CharacterTreeItem extends vscode.TreeItem {
	children: CharacterTreeItem[] = [];

	constructor(label: string, public parent: CharacterTreeItem) {
		super(label);
	}
}
