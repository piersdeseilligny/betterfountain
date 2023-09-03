import * as vscode from 'vscode';

export class SceneTreeItem extends vscode.TreeItem {
  constructor(label: string, public lineNumber: number, public parent: vscode.TreeItem) {
    super(label);
    this.command = {
      command: 'fountain.jumpto',
      title: '',
      arguments: [lineNumber] 
    }
  }
}