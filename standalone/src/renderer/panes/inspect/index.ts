import { Title, Widget } from "@lumino/widgets";
import { TreeView } from "../../lumino/TreeView";
import { DockPanelAlt } from "../../lumino/DockPanel";
import { Pane, IPaneOptions } from "../pane";
import { ContentWidget } from "../../renderer";

export class InspectPane extends Pane{
    id = "view.inspect";
    options:IPaneOptions = {
        label:"About",
        iconClass:"codicon codicon-book"
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

        let fileExplorer = new TreeView.TreeView();
        fileExplorer.title.label = "FILES";
        this.widget.addWidget(fileExplorer);
        this.widget.addWidget(new ContentWidget('Red'));

        let inspector = new Widget();
        inspector.title.label = "INSPECT";
        this.widget.addWidget(inspector);
        


        this.widget.addClass('lm-mod-borderlesstab');
        this
    }
}