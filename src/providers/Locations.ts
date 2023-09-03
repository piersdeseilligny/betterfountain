import * as vscode from 'vscode';
import { activeParsedDocument } from '../extension';
import { FSFormat } from '../utils/format';
import { SceneTreeItem } from './Scene';
import { Location } from '../afterwriting-parser';

export class FountainLocationTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  public readonly onDidChangeTreeDataEmitter: vscode.EventEmitter<vscode.TreeItem | null> =
    new vscode.EventEmitter<vscode.TreeItem | null>();
  public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | null> = this.onDidChangeTreeDataEmitter.event;

  private treeRoot: LocationTreeItem;

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getChildren(element?: LocationTreeItem): vscode.ProviderResult<vscode.TreeItem[]> {
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
    this.treeRoot = buildLocationTree();
    this.onDidChangeTreeDataEmitter.fire(void 0);
  }
}

function buildLocationTree(): LocationTreeItem {
  const locations = activeParsedDocument().properties.locations;
  const root = new LocationTreeItem("", [], null);
  root.children = [];

  for (const [name, scenes] of locations) {
    const child = new LocationTreeItem(FSFormat.locationToNatural(name), scenes, root);
    root.children.push(child);
  }
  return root;
}

class LocationTreeItem extends vscode.TreeItem {
  children: vscode.TreeItem[] = [];

  constructor(label: string, public locations: Location[], public parent: LocationTreeItem) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.description = `${locations.length} scenes`;
    for (const location of locations) {
      this.children.push(new SceneTreeItem(`Scene ${location.scene_number} - ${location.time_of_day}`, location.line, this));
    }
  }
}
