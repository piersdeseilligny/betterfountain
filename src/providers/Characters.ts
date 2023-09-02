import * as vscode from 'vscode';
import { activeParsedDocument } from '../extension';
import { FSFormat } from '../utils/format';

export class FountainCharacterTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  public readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<vscode.TreeItem | null> =
    new vscode.EventEmitter<vscode.TreeItem | null>();
  public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this.onDidChangeTreeDataEmitter.event;

  private treeRoot: CharacterTreeItem;

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: CharacterTreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
    if (element) {
      return element.children;
    }
    if (this.treeRoot && this.treeRoot.children) {
      return this.treeRoot.children;
    } else {
      return []
    }
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
    const child = new CharacterTreeItem(FSFormat.nameToNatural(character), wordCount, root);
    root.children.push(child);
  }
  return root;
}

class CharacterTreeItem extends vscode.TreeItem {
  children: vscode.TreeItem[] = [];

  constructor(label: string, public scenes: number[], public parent: CharacterTreeItem) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    if (scenes.length > 0) {
      this.description = `${scenes.length} scenes`;
      for (const scene of scenes) {
        const properties = activeParsedDocument().properties;
        const sceneName = properties.sceneNames[scene-2];
        const sceneLineNumber = properties.sceneLines[scene-2];
        this.children.push(new SceneTreeItem(sceneName, sceneLineNumber, this));
      }
    }
  }
}

class SceneTreeItem extends vscode.TreeItem {
  constructor(label: string, public lineNumber: number, public parent: CharacterTreeItem) {
    super(label);
    this.command = {
      command: 'fountain.jumpto',
      title: '',
      arguments: [lineNumber] 
    }
  }
}
