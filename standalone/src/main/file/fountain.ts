import { ScreenplayContent, ScreenplayFile } from "./file";
import * as fs from "fs";
import { ParsedPath } from "path";

export class FountainFile extends ScreenplayFile{
    type="Fountain";
    constructor(p:ParsedPath){
        super(p);
    }

    openFile = ():Promise<ScreenplayContent> => {
        return new Promise((resolve, reject)=>{
            fs.readFile(this.filepath, (err,data) => {
                if(err){
                    reject(err);
                }
                else{
                    resolve(this.createContent(data.toString()));
                }
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