import * as ls from 'vscode-languageserver-types';
import { worker, Thenable, languages } from 'monaco-editor/esm/vs/editor/editor.api'
import IWorkerContext = worker.IWorkerContext;

/** Worker for the XML code editor. */
export class AvenueWorker
{
    private _languageId: string;
    private _ctx: IWorkerContext;

    constructor(ctx: IWorkerContext, createData: ICreateData)
    {
        this._ctx = ctx;
        this._languageId = createData.languageId;
    }

    public doComplete(uri: string, position: ls.Position): Thenable<ls.CompletionList> 
    {
        let document = this._getTextDocument(uri);
        return Promise.resolve({ isIncomplete: false, items: [{label:"test"}] });
    }


    private _getTextDocument(uri: string): ls.TextDocument
    {
        let models = this._ctx.getMirrorModels();
        for (let model of models) {
            if (model.uri.toString() === uri) {
                return ls.TextDocument.create(uri, this._languageId, model.version, model.getValue());
            }
        }
        return null;
    }
}

export interface ICreateData {
    languageId: string;
    languageSettings: languages.html.Options; // use HTML options for now
}