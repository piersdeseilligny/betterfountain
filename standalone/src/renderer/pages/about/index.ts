import { Widget } from "@lumino/widgets";

import html from "./about.html";

export class AboutPage extends Widget {
    constructor(){
        super();
        this.title.label = "About";
        this.title.closable = true;
        this.id="about";
        this.node.innerHTML = html;
    }
}