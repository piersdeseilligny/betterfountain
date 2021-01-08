export class Page {
    constructor() {
        
    }
    title: () => string;
    icon: () => string;
    closeable: () => boolean;
    dirty: () => boolean;
    html: () => string;
}