import { getFountainConfig } from "../configloader";
import { activeFountainDocument, getEditor } from "../extension";
import * as afterparser from "../afterwriting-parser";
import { fileToBase64, openFile, revealFile } from "../utils";
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

    var pageClasses = "innerpage";
    if (fountainconfig.scenes_numbers == "left")
        pageClasses = "innerpage numberonleft";
    else if (fountainconfig.scenes_numbers == "right")
        pageClasses = "innerpage numberonright";
    else if (fountainconfig.scenes_numbers == "both")
        pageClasses = "innerpage numberonleft numberonright";

    rawhtml = rawhtml.replace("$SCRIPTCLASS$", pageClasses);

    let courierprimeB64 = fileToBase64(__dirname + '/../courierprime/courier-prime.ttf');
    let courierprimeB64_bold = fileToBase64(__dirname + '/../courierprime/courier-prime-bold.ttf');
    let courierprimeB64_italic = fileToBase64(__dirname + '/../courierprime/courier-prime-italic.ttf');;
    let courierprimeB64_bolditalic = fileToBase64(__dirname + '/../courierprime/courier-prime-bold-italic.ttf');;

    rawhtml = rawhtml.replace("$COURIERPRIME$", courierprimeB64)
                     .replace("$COURIERPRIME-BOLD$", courierprimeB64_bold)
                     .replace("$COURIERPRIME-ITALIC$", courierprimeB64_italic)
                     .replace("$COURIERPRIME-BOLDITALIC$", courierprimeB64_bolditalic);
    
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