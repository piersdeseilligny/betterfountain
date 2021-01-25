import { ScreenplayContent, ScreenplayFile } from "./file";
import * as fs from "fs";
import { ParsedPath } from "path";
import StreamZip = require('node-stream-zip');

function streamToString (stream:NodeJS.ReadableStream) {
    const chunks:any[] = []
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    })
  }

export class HighlandFile extends ScreenplayFile{
    type="Fountain";
    constructor(p:ParsedPath){
        super(p);
    }

    openFile = ():Promise<ScreenplayContent> => {
        return new Promise((resolve, reject)=>{
            const zip = new StreamZip({
                file:this.filepath
            });
            let text = "";
            zip.on('error',(err)=>{
                reject(err);
                zip.close();
            });
            zip.on('ready', () =>{
                for(const entry of Object.values(zip.entries())){
                    if(entry.name.endsWith(".textbundle/text.fountain")){
                        zip.stream(entry, (err, stream)=>{
                            if(err){
                                reject(err);
                            }
                            else{
                                streamToString(stream).then((value:string)=>{
                                    resolve(this.createContent(value));
                                    zip.close();
                                });
                            }
                        }); 
                    }
                };
            });
        });
    }

    saveFile = (content:ScreenplayContent):Promise<boolean> => {
        return new Promise((resolve, reject)=>{
            fs.writeFile(this.filepath, content.fountain, (err)=>{
                if(err){
                    reject(err);
                }
                else{
                    resolve(true);
                }
            });
        });
    }
}