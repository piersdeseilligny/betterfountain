import { getFountainConfig } from "../configloader";
import { activeFountainDocument, getEditor } from "../extension";
import * as afterparser from "../afterwriting-parser";
import { openFile, revealFile } from "../utils";
import * as vscode from "vscode";
import * as fs from "fs";

export async function exportHtml(){
	var editor = getEditor(activeFountainDocument());
	var filename = editor.document.fileName.replace(/(\.(((better)?fountain)|spmd|txt))$/, '');
	var saveuri = vscode.Uri.file(filename);
	let filepath = await vscode.window.showSaveDialog(
			{
				filters: { "HTML File": ["html"] },
				defaultUri: saveuri
			});
    var fountainconfig = getFountainConfig(editor.document.uri);
	var output = afterparser.parse(editor.document.getText(), fountainconfig , true);
    let htmlpath = __filename + '/../../../assets/staticexport.html'
	var rawhtml =  fs.readFileSync(htmlpath, 'utf8');

    var themeClass = fountainconfig.preview_theme + "_theme";
    if (fountainconfig.preview_texture) {
        themeClass += " textured";
    }
    var pageClasses = "innerpage";
    if (fountainconfig.scenes_numbers == "left")
        pageClasses = "innerpage numberonleft";
    else if (fountainconfig.scenes_numbers == "right")
        pageClasses = "innerpage numberonright";
    else if (fountainconfig.scenes_numbers == "both")
        pageClasses = "innerpage numberonleft numberonright";

    rawhtml = rawhtml.replace("$SCRIPTCLASS$", pageClasses);
    rawhtml = rawhtml.replace("$PAGETHEME$", themeClass);
    
    if(output.titleHtml){
        rawhtml = rawhtml.replace("$TITLEPAGE$", output.titleHtml);
    }
    else{
        rawhtml = rawhtml.replace("$TITLEDISPLAY$", "hidden")
    }
    rawhtml = rawhtml.replace("$SCREENPLAY$", output.scriptHtml);
	fs.writeFile(filepath.fsPath, rawhtml, (err)=>{
        if(err){
            vscode.window.showErrorMessage("Failed to export HTML: " + err.message);
        }
        else{      
            let open = "Open";
            let reveal = "Reveal in File Explorer";
            if(process.platform == "darwin") reveal = "Reveal in Finder"
            vscode.window.showInformationMessage("Exported HTML Succesfully!", open, reveal).then(val=>{
                switch(val){
                    case open:{
                        openFile(filepath.fsPath);
                        break;
                    }
                    case reveal:{
                        revealFile(filepath.fsPath);
                        break;
                    }
                }
            })
        }
    });
}