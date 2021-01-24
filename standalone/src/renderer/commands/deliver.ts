import { CommandRegistry } from "@lumino/commands";
import { Menu } from "@lumino/widgets";
import { ipcRenderer } from "electron";
import { DockPanelAlt } from "../lumino/DockPanel";
import { TitleBar } from "../lumino/TitleBar";

export function init(commands: CommandRegistry, bar: TitleBar) {
    commands.addCommand('deliver.default', {
        label: "Export as PDF",
        iconClass: 'codicon codicon-file-pdf',
        execute: function (args) {
            //TODO
        }
    });
    commands.addCommand('deliver.quick', {
        label: "Re-export over previous file",
        isEnabled:()=>false,
        iconClass: 'codicon codicon-save',
        execute: function (args) {
            //TODO
            ipcRenderer.send('file', 'new');
        }
    });
    commands.addCommand('deliver.batch', {
        label: "Batch export",
        iconClass: 'codicon codicon-files',
        execute: function (args) {
            //TODO
        }
    });
    let menu = new Menu({ commands: commands });
    menu.title.label = 'Deliver';
    menu.title.mnemonic = 0;
    menu.addItem({ type: "command", command: "deliver.default" });
    menu.addItem({ type: "command", command: "deliver.quick" });
    menu.addItem({ type: "separator" });
    menu.addItem({ type: "command", command: "deliver.batch" });
    bar.addMenu(menu);
}