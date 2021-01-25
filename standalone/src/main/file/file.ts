import * as uuid from "uuid";
import * as path from "path";

export type ScreenplayContent = {
    fountain: string;
    id: string;
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

    constructor(p:path.ParsedPath){
        this.id=uuid.v4();
        this.filepath = p.dir+path.sep+p.base;
        this.filename = p.base;
    }

    createContent(fountain:string):ScreenplayContent {
        return{
            id:this.id,
            fountain:fountain,
            filename:this.filename
        }
    }

    /**
     * Open the file and return it's content
     */
    public openFile:() => Promise<ScreenplayContent>;

    /**
     * Save the file
     */
    public saveFile:(content: ScreenplayContent) => Promise<boolean>;
}
