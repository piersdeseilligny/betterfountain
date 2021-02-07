import { Title, Widget } from "@lumino/widgets";
import { TreeView } from "../../lumino/TreeView";
import { DockPanelAlt } from "../../lumino/DockPanel";
import { Pane, IPaneOptions } from "../pane";
import { appSignals, ContentWidget } from "../../renderer";
import { ScreenplayContent } from "../../../main/file/file";


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

        this.widget.addClass('lm-mod-borderlesstab');
        appSignals.documentChanged.connect(this.documentChange);
    }

    dispose(){
        super.dispose();
        appSignals.documentChanged.disconnect(this.documentChange);
    }

    documentChange(sender:any, content:ScreenplayContent){
        console.log("Document changed: ");
        console.log(content);
    }
}