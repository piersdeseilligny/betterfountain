import { CommandRegistry } from "@lumino/commands";
import { Menu } from "@lumino/widgets";
import { ipcRenderer } from "electron";
import { DockPanelAlt } from "../lumino/DockPanel";
import { TitleBar } from "../lumino/TitleBar";

export function init(commands: CommandRegistry, bar: TitleBar) {
    commands.addCommand('file.open', {
        label: "Open file",
        iconClass: 'codicon codicon-file',
        execute: function (args) {
            ipcRenderer.send('file', 'open');
        }
    });
    commands.addKeyBinding({keys:['Accel O'], command:"file.open", selector:"body"});
    let menu = new Menu({ commands: commands });
    menu.title.label = 'File';
    menu.title.mnemonic = 0;
    menu.addItem({ type: "command", command: "file.open" });
    bar.addMenu(menu);
}