import { CommandRegistry } from "@lumino/commands";
import { Panel, Widget } from "@lumino/widgets";
import { commands } from "../renderer";

export class PaneCollection {
    _parent:Panel;
    _selectedPane:string = undefined;
    get selectedPane(){
        return this._selectedPane;
    }
    set selectedPane(val:string){
        if(this._parent){
            this._parent.setHidden((val == undefined))
        }
        this._selectedPane = val;
    }
    
    lastSelectedPane:string = undefined;
    _registry:CommandRegistry;
    panes:Pane[] = [];
    



    constructor(parent:Panel, registry:CommandRegistry){
        this._parent=parent;
        this._registry=registry;
    }

    addPane(pane:Pane){
        this.panes.push(pane);
        const defaultCommand:CommandRegistry.ICommandOptions = {
            isToggleable: true,
            isToggled: () => {
                return (this.selectedPane == pane.id);
            },
            execute: () => {
              this.togglePane(pane.id);
            }
        }
        //merge the default command, which includes the general toggle/execute methods, with the pane-specific one
        this._registry.addCommand(pane.id, { ...defaultCommand, ...pane.options });
        pane.widget.setHidden((this.selectedPane != pane.id));
        this._parent.addWidget(pane.widget);
    }
    
    private togglePane(id:string){
        if(commands.isToggled(id))
            this.selectedPane = undefined;
        else{
            this.selectedPane = id;
            this.lastSelectedPane = id;
        }
            

        console.log("Selected pane is now " + this.selectedPane);
        for (let i = 0; i < this.panes.length; i++) {
            this.panes[i].widget.setHidden((this.selectedPane != this.panes[i].id));
            commands.notifyCommandChanged(this.panes[i].id);
        }
    }
}

export interface IPaneOptions extends Omit<CommandRegistry.ICommandOptions, 'execute'> {}
export abstract class Pane{
    abstract id:string;
    abstract options:IPaneOptions;
    abstract widget:Widget;

    constructor(){
    }
}