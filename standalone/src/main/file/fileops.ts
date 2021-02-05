import { BrowserWindow, dialog } from "electron";
import { ScreenplayFile } from "./file";
import { FountainFile } from "./fountain";
import { HighlandFile } from "./highland";
import * as path from "path";

export namespace FileOperations{
    let filters = [
        { name: 'Screenplay', extensions: ['fountain', 'spmd', 'highland'] }, 
        { name: 'Fountain', extensions: ['fountain', 'spmd'] }, 
        { name: 'Highland', extensions: ['highland'] }
      ];

    export async function filePicker(window:BrowserWindow){
          let filepicker = await dialog.showOpenDialog(window, { properties: ['openFile'], buttonLabel: "Open screenplay", filters:filters  });
          if (!filepicker.canceled) {
            for (let i = 0; i < filepicker.filePaths.length; i++) {
              let filepath = path.parse(filepicker.filePaths[i]);
              let screenplayFile: ScreenplayFile;
              let extension = filepath.ext.substring(1);
              let breakSearch = false;
              for(let filter of filters){
                if(filter.name != "Screenplay"){ //Ignore "Screenplay", seeing as it includes all possible extensions
                  for(let filterExtension of filter.extensions){
                    if(extension == filterExtension){
                      if(filter.name == "Fountain") screenplayFile = new FountainFile(filepath);
                      if(filter.name == "Highland") screenplayFile = new HighlandFile(filepath);
                      breakSearch = true;
                      break;
                    }
                  }
                }
                if(breakSearch) break;
              }

              if(screenplayFile){
                screenplayFile.openFile().then((content) => {
                  window.webContents.send('file', 'open', content);
                });
              }
              else{
                window.webContents.send('file', 'cancel', 'Unable to decode screenplay file');
              }
            }
          }
          else{
            window.webContents.send('file', 'cancel', 'No file selected');
          }
    }
    export async function fileSaver(window:BrowserWindow){
        let filesaver = await dialog.showSaveDialog(window, { filters:filters, buttonLabel:"Save Screenplay" });
    }
}