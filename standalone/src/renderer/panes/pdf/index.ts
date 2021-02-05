import { Title, Widget } from "@lumino/widgets";
import { DockPanelAlt } from "../../lumino/DockPanel";
import { Pane, IPaneOptions } from "../pane";

export class PdfPane extends Pane{
    id = "view.pdf";
    options:IPaneOptions = {
        label:"Export PDF",
        iconClass:"codicon codicon-file-pdf"
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

        let general = new Widget();
        general.title.label = "GENERAL";
        this.widget.addWidget(general);

        let advanced = new Widget();
        advanced.title.label = "ADVANCED";
        this.widget.addWidget(advanced);
        this.widget.addClass('lm-mod-borderlesstab');
    }
}