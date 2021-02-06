import { Widget } from "@lumino/widgets";

import html from "./welcome.html";

export class WelcomePage extends Widget {
    constructor(){
        super();
        this.title.label = "Welcome";
        this.title.closable = true;
        this.id="welcome";
        this.node.innerHTML = html;
    }
}