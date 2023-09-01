import * as vscode from 'vscode';
import { activeParsedDocument } from '../extension';

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
  const root = new CharacterTreeItem("Characters", [], null);
  root.children = [];

  for (const [character, wordCount] of characters.entries()) {
    const child = new CharacterTreeItem(`${character}`, wordCount, root);
    root.children.push(child);
  }
  return root;
}

class CharacterTreeItem extends vscode.TreeItem {
  children: CharacterTreeItem[] = [];
  lineNumber: number = 0;

  constructor(label: string, public scenes: number[], public parent: CharacterTreeItem) {
    super(label);
    if (scenes.length > 0) {
      scenes = scenes.map(x => x - 1); // decrease needed to get correct scene number?
      this.description = scenes.join(", ");
      scenes = scenes.map(x => x - 1); // decrease to get correct index
      this.lineNumber = activeParsedDocument().properties.sceneLines[scenes[0]];
      this.command = {
        command: 'fountain.jumpto',
        title: '',
        arguments: [this.lineNumber] 
      }
    }
  }
}
