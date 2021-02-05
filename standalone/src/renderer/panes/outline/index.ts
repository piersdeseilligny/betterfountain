import { Title, Widget } from "@lumino/widgets";
import { DockPanelAlt } from "../../lumino/DockPanel";
import { Pane, IPaneOptions } from "../pane";

export class OutlinePane extends Pane{
    id = "view.outline";
    options:IPaneOptions = {
        label:"Outline",
        iconClass:"codicon codicon-list-tree"
    }
    widget:DockPanelAlt;

    constructor(){
        super();
        this.widget = new DockPanelAlt({
            mode:'multiple-document', 
            tabsConstrained:true, 
            edgesEnabled: {
                right:false,
                left:false,
                top:true,
                bottom:true
            }
        });

        let outline = new Widget();
        outline.title.label = "OUTLINE";
        this.widget.addWidget(outline);

        let characters = new Widget();
        characters.title.label = "CHARACTERS";
        this.widget.addWidget(characters);
        this.widget.addClass('lm-mod-borderlesstab');
    }
}