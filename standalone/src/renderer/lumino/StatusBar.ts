import { Widget } from "@lumino/widgets";
import { CommandRegistry } from "@lumino/commands";

export namespace Statusbar{

    export
    interface IOptions {
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

    export class Statusbar extends Widget {

        _commandregistry:CommandRegistry;
        _content:HTMLUListElement;
        _align:Mode;

        _commands:Set<string> = new Set();
        

        constructor(options:IOptions){
            super({node: Private.createNode()});
            this._align = options.alignMode || "ltr";
            this._content = document.createElement('ul');
            this._content.className = 'lm-Statusbar';
            this.node.appendChild(this._content);
        }

        /**
         * Add the given command to the toolbar
         */
        addItem(command:string){
        }

        /**
         * Remove the given command from the toolbar
         */
        removeItem(command:string){
        }

        /**
         * Remove the given command from the toolbar
         */
        removeItemWithElement(e:HTMLLIElement, command:string){
        }

        updateElement(e:HTMLLIElement){

        }
    }
}

namespace Private{
    export
    function createNode(): HTMLDivElement {
        let node = document.createElement('div');
        return node;
    }
}