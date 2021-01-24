import { Widget } from "@lumino/widgets";
import { CommandRegistry } from "@lumino/commands";
import { ArrayExt } from '@lumino/algorithm';
import { JSONExt, ReadonlyPartialJSONObject } from '@lumino/coreutils';

export namespace Toolbar{

    export
    interface IOptions {
        commandRegistry: CommandRegistry;
        alignMode?: Mode
    }
    type Mode = (
        /**
         * Left-to-right: new items will be inserted on the right
         */
        "ltr" |

        /**
         * Right-to-left: new items will be inserted on the left
         */
        "rtl"
    );

    export class Toolbar extends Widget {

        _commandregistry:CommandRegistry;
        
        _content:HTMLUListElement;
        _align:Mode;

        _commands:Set<string> = new Set();
        

        constructor(options:IOptions){
            super({node: Private.createNode()});
            this._align = options.alignMode || "ltr";
            this._content = document.createElement('ul');
            this._content.className = 'lm-Toolbar scroller-minimal';
            this.node.appendChild(this._content);

            if(!options.commandRegistry) throw "No command registry specified!";
            this._commandregistry = options.commandRegistry;
            this._commandregistry.commandChanged.connect(this.commandChanged);
        }

        /**
         * Add the given command to the toolbar
         */
        addItem(command:string){
            let item = document.createElement('li');
            let icon = document.createElement('i');
            icon.className= 'lm-Toolbar-icon'
            item.appendChild(icon);
            item.className = 'lm-Toolbar-item';
            item.dataset.command = command;
            this.updateElement(item);
            item.onclick = (event) => {
                this._commandregistry.execute(command);
            }
            this._content.append(item);
            this._commands.add(command);
        }

        /**
         * Remove the given command from the toolbar
         */
        removeItem(command:string){
            let items = this._content.querySelectorAll(`li.lm-Toolbar-item[data-command="${command}"]`);
            for (let i = 0; i < items.length; i++) {
                this.removeItemWithElement(items[i] as HTMLLIElement, command);
            }
        }

        /**
         * Remove the given command from the toolbar
         */
        removeItemWithElement(e:HTMLLIElement, command:string){
            this._commands.delete(command);
            e.remove();
        }

        commandChanged = (sender:CommandRegistry, args:CommandRegistry.ICommandChangedArgs) => {
            if(args.type == "many-changed"){
                //Update every toolbar item
                let items = this._content.querySelectorAll(`li.lm-Toolbar-item`)
                for (let i = 0; i < items.length; i++) {
                    const e = items[i] as HTMLLIElement;
                    if(this._commandregistry.hasCommand(e.dataset.command)){
                        this.updateElement(e);
                    }
                }
            }
            else if(this._commands.has(args.id)){
                //Only continue if this toolbar contains the specified command
                if(args.type == "changed"){
                    //Select the relevant toolbar item(s)
                    let items = this._content.querySelectorAll(`li.lm-Toolbar-item[data-command="${args.id}"]`);
                    for (let i = 0; i < items.length; i++) {
                        this.updateElement(items[i] as HTMLLIElement);
                    }
                }
                else if(args.type == "removed"){
                    //Remove the relevant toolbar item(s)
                    let items = this._content.querySelectorAll(`li.lm-Toolbar-item[data-command="${args.id}"]`);
                    for (let i = 0; i < items.length; i++) {
                        this.removeItemWithElement(items[i] as HTMLLIElement, args.id);
                    }
                }
            }
        }

        updateElement(e:HTMLLIElement){
            let command = e.dataset.command;

            let classes = "lm-Toolbar-item"
            if(this._commandregistry.isVisible(command))
                classes += " lm-mod-hidden";
            if(this._commandregistry.isEnabled(command))
                classes += " lm-mod-disabled";
            if(this._commandregistry.isToggleable(command)){
                classes += " lm-mod-toggleable";
                if(this._commandregistry.isToggled(command))
                    classes+= " lm-mod-toggled";
            }

            if(this._commandregistry.className(command))
                classes += " " + this._commandregistry.className;

            e.querySelector('i').className="lm-Toolbar-icon " + this._commandregistry.iconClass(command);

            let kb = Private.getKeyBinding(this._commandregistry, command);
            let titleSuffix = "";
            if(kb){
                titleSuffix = ` (${Private.formatShortcut(kb)})`;
            }
            e.title = this._commandregistry.label(command) + titleSuffix;
            e.className = classes;
        }
    }
}

namespace Private{
    export
    function createNode(): HTMLDivElement {
        let node = document.createElement('div');
        return node;
    }
    export
    function getKeyBinding(_commandregistry:CommandRegistry, command:string, args?:ReadonlyPartialJSONObject): CommandRegistry.IKeyBinding | null {
        return ArrayExt.findLastValue(_commandregistry.keyBindings, kb => {
          return kb.command === command && JSONExt.deepEqual(kb.args, args);
        }) || null;
      }
    export
    function formatShortcut(kb:CommandRegistry.IKeyBinding):string {
        return kb ? kb.keys.map(CommandRegistry.formatKeystroke).join(', ') : null;
      }
}