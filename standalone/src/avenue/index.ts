import { type } from "process";

const avenueworker = require('worker-loader!./avenue.worker');

export enum AvMessageType{
    PARSE_ALL,
    PARSE_CHANGES
}
export type AvMessage = {
    id:string;
    type:AvMessageType;
    data:any;
}
type AvenueWorker = Omit<Worker, 'postMessage'> & {
    postMessage(message: AvMessage, options?: PostMessageOptions): void;
}

export abstract class Avenue{
    public static worker:AvenueWorker = avenueworker.default();
}