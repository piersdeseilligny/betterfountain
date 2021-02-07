import { CommandRegistry } from "@lumino/commands";
import { Menu } from "@lumino/widgets";
import { ipcRenderer } from "electron";
import { DockPanelAlt } from "../lumino/DockPanel";
import { TitleBar } from "../lumino/TitleBar";

export function init(commands: CommandRegistry, bar: TitleBar) {
    commands.addCommand('file.new', {
        label: "New screenplay",
        iconClass: 'codicon codicon-add',
        execute: function (args) {
            ipcRenderer.send('file', 'new');
        }
    });
    commands.addCommand('file.open', {
        label: "Open screenplay",
        iconClass: 'codicon codicon-file',
        execute: function (args) {
            ipcRenderer.send('file', 'open');
        }
    });
    commands.addCommand('file.save', {
        label: "Save",
        iconClass: 'codicon codicon-save',
        execute: function (args) {
            //TODO
            ipcRenderer.send('file', 'save');
        }
    });
    commands.addCommand('file.saveas', {
        label: "Save as...",
        iconClass: 'codicon codicon-save-as',
        execute: function (args) {
            ipcRenderer.send('file', 'saveas');
        }
    });
    commands.addKeyBinding({keys:['Accel N'], command:"file.new", selector:"body"});
    commands.addKeyBinding({keys:['Accel O'], command:"file.open", selector:"body"});
    commands.addKeyBinding({keys:['Accel S'], command:"file.save", selector:"body"});
    commands.addKeyBinding({keys:['Accel Shift S'], command:"file.saveas", selector:"body"});
    let menu = new Menu({ commands: commands });
    menu.title.label = 'File';
    menu.title.mnemonic = 0;
    menu.addItem({ type: "command", command: "file.new" });
    menu.addItem({ type: "command", command: "file.open" });
    menu.addItem({ type: "separator" });
    menu.addItem({ type: "command", command: "file.save" });
    menu.addItem({ type: "command", command: "file.saveas" });
    bar.addMenu(menu);
}