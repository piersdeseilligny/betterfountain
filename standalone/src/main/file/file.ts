import * as uuid from "uuid";
import * as path from "path";

export type ScreenplayContent = {
    fountain: string;
    id: string;
    uri: string;
    filename:string;
}

export type SaveResult = {
    error: string;
}

export class ScreenplayFile{
    type="N/A"
    
    fountain="";
    id:string;
    filepath:string;
    filename:string;

    constructor(p?:path.ParsedPath){
        this.id=uuid.v4();
        if(p != undefined){
            this.filepath = p.dir+path.sep+p.base;
            this.filename = p.base;
        }

    }

    /**
     * Create a ScreenplayContent object from the given fountain text
     * @param fountain the fountain-formatted content
     */
    createContent(fountain:string):ScreenplayContent {
        let uri;
        if(this.filepath){
            uri="file://"+this.filepath;
        }
        return{
            id:this.id,
            fountain:fountain,
            filename:this.filename,
            uri: uri
        }
    }

    /**
     * Open the file and return it's content
     */
    openFile = ():Promise<ScreenplayContent> => {
        return new Promise((resolve, reject)=>{
            resolve(this.createContent(""));
        });
    }

    /**
     * Save the file
     */
    public saveFile:(content: ScreenplayContent) => Promise<boolean>;
}

