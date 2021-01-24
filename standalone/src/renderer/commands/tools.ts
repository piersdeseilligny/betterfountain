import { CommandRegistry } from "@lumino/commands";
import { Menu } from "@lumino/widgets";
import { ipcRenderer } from "electron";
import { DockPanelAlt } from "../lumino/DockPanel";
import { TitleBar } from "../lumino/TitleBar";

export function init(commands: CommandRegistry, bar: TitleBar) {
    commands.addCommand('tools.numberupdate', {
        label: "Update missing scene numbers",
        isEnabled:()=>false,
        iconClass: 'codicon codicon-list-ordered',
        execute: function (args) {
            //TODO
        }
    });
    commands.addCommand('tools.numberoverwrite', {
        label: "Overwrite scene numbers",
        iconClass: 'codicon codicon-clear-all',
        execute: function (args) {
            //TODO
        }
    });

    let menuNumber = new Menu({commands:commands});
    menuNumber.title.label = "Number scenes";
    menuNumber.title.iconClass = 'codicon codicon-list-ordered';
    menuNumber.addItem({ type: "command", command: "tools.numberupdate" });
    menuNumber.addItem({ type: "command", command: "tools.numberoverwrite" });

    let menu = new Menu({ commands: commands });
    menu.title.label = 'Tools';
    menu.title.mnemonic = 0;
    menu.addItem({type:'submenu', submenu: menuNumber });



    
    bar.addMenu(menu);
}