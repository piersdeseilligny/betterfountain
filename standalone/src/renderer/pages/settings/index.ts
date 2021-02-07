import { Widget } from "@lumino/widgets";

export class SettingsPage extends Widget {
    constructor(){
        super();
        this.title.label = "Settings";
        this.title.closable = true;
        this.id="settings";
        this.node.innerHTML = "<h1>Settings</h1>";
    }
}