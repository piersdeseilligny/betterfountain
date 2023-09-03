import * as vscode from 'vscode';

export class FountainCommandTreeDataProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	getTreeItem(element: vscode.TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		//throw new Error("Method not implemented.");
		return element;
	}

	getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
		const elements: vscode.TreeItem[] = [];
		const treeExportPdf = new vscode.TreeItem("Export PDF");
		treeExportPdf.iconPath = new vscode.ThemeIcon("export");
		//const treeExportPdfDebug = new vscode.TreeItem("Export PDF with default name");
		const treeExportPdfCustom= new vscode.TreeItem("Export PDF with highlighted characters");
		treeExportPdfCustom.iconPath = new vscode.ThemeIcon("export");
		const treeExportHtml = new vscode.TreeItem("Export HTML");
		treeExportHtml.iconPath = new vscode.ThemeIcon("export");
		treeExportHtml.tooltip = "Export live preview as .html document"
		treeExportHtml.iconPath = new vscode.ThemeIcon("export");
		const treeLivePreview = new vscode.TreeItem("Show live preview");
		treeLivePreview.iconPath = new vscode.ThemeIcon("open-preview");
		treeLivePreview.tooltip = "A real-time but approximate preview of the rendered PDF"
		const treePdfPreview = new vscode.TreeItem("Show PDF preview");
		treePdfPreview.iconPath = new vscode.ThemeIcon("file-pdf");
		treePdfPreview.tooltip = "An exact preview of the rendered PDF (not real-time)";
		const numberScenesOverwrite = new vscode.TreeItem("Number scenes - overwrite");
		numberScenesOverwrite.tooltip = 'Replaces existing scene numbers.';
		numberScenesOverwrite.iconPath = new vscode.ThemeIcon("list-ordered");
		const numberScenesUpdate = new vscode.TreeItem("Number scenes - update");
		numberScenesUpdate.iconPath = new vscode.ThemeIcon("list-ordered");
		numberScenesUpdate.tooltip = 'Retains existing numbers as much as possible. Fills gaps and re-numbers moved scenes.';
		const statistics = new vscode.TreeItem("Calculate screenplay statistics");
		statistics.iconPath = new vscode.ThemeIcon("pulse");
		treeExportPdf.command = {
			command: 'fountain.exportpdf',
			title: ''
		};
		/*treeExportPdfDebug.command = {
			command: 'fountain.exportpdfdebug',
			title: ''
		};*/
		treeExportPdfCustom.command = {
			command: 'fountain.exportpdfcustom',
			title: ''
		};
		treeExportHtml.command = {
			command: 'fountain.exporthtml',
			title: ''
		};
		treeLivePreview.command = {
			command: 'fountain.livepreview',
			title: ''
		};
		treeLivePreview.command = {
			command: 'fountain.livepreviewstatic',
			title: ''
		};
		treePdfPreview.command = {
			command:'fountain.pdfpreview',
			title:''
		};
		numberScenesOverwrite.command = {
			command: 'fountain.overwriteSceneNumbers',
			title: ''
		};
		numberScenesUpdate.command = {
			command: 'fountain.updateSceneNumbers',
			title: ''
		};
		statistics.command = {
			command: 'fountain.statistics',
			title: ''
		};
		elements.push(treeExportPdf);
	//	elements.push(treeExportPdfDebug);
		elements.push(treeExportPdfCustom);
		elements.push(treeExportHtml);
		elements.push(treeLivePreview);
		elements.push(treePdfPreview);
		elements.push(statistics);
		elements.push(numberScenesOverwrite);
		elements.push(numberScenesUpdate);

		return elements;
	}
}