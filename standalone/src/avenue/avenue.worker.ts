import * as worker from 'monaco-editor/esm/vs/editor/editor.worker'
import { AvenueWorker } from './avenueWorker';
import * as monaco from 'monaco-editor';


self.onmessage = () => {
	
	// ignore the first message
	worker.initialize((ctx:monaco.worker.IWorkerContext, createData:any) => {
		return new AvenueWorker(ctx, createData);
	});


};