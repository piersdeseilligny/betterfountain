import { CommandRegistry } from "@lumino/commands";
import { Menu } from "@lumino/widgets";
import { ipcRenderer } from "electron";
import { DockPanelAlt } from "../lumino/DockPanel";
import { TitleBar } from "../lumino/TitleBar";

export function init(commands: CommandRegistry, bar: TitleBar) {
    commands.addCommand('edit.undo', {
        label: "Undo",
        iconClass: 'codicon codicon-discard',
        execute: function (args) {
            //TODO
        }
    });
    commands.addCommand('edit.redo', {
        label: "Redo",
        iconClass: 'codicon codicon-redo',
        execute: function (args) {
            //TODO
        }
    });

    commands.addCommand('edit.cut', {
        label: "Cut",
        execute: function (args) {
            //TODO
        }
    });
    commands.addCommand('edit.copy', {
        label: "Copy",
        execute: function (args) {
            //TODO
        }
    });
    commands.addCommand('edit.paste', {
        label: "Paste",
        execute: function (args) {
            //TODO
        }
    });

    commands.addCommand('edit.settings', {
        label: "Settings",
        iconClass: "codicon codicon-settings-gear",
        execute: function (args) {
            //TODO
        }
    });

    commands.addKeyBinding({keys:['Accel Z'], command:"edit.undo", selector:"body"});
    commands.addKeyBinding({keys:['Accel Y'], command:"edit.redo", selector:"body"});

    commands.addKeyBinding({keys:['Accel X'], command:"edit.cut", selector:"body"});
    commands.addKeyBinding({keys:['Accel C'], command:"edit.copy", selector:"body"});
    commands.addKeyBinding({keys:['Accel V'], command:"edit.paste", selector:"body"});

    commands.addKeyBinding({keys:['Accel ,'], command:"edit.settings", selector:"body"});

    let menu = new Menu({ commands: commands });
    menu.title.label = 'Edit';
    menu.title.mnemonic = 0;
    menu.addItem({ type: "command", command: "edit.undo" });
    menu.addItem({ type: "command", command: "edit.redo" });
    menu.addItem({ type: "separator" });
    menu.addItem({ type: "command", command: "edit.cut" });
    menu.addItem({ type: "command", command: "edit.copy" });
    menu.addItem({ type: "command", command: "edit.paste" });
    menu.addItem({ type: "separator" });
    menu.addItem({ type: "command", command: "edit.find" });
    menu.addItem({ type: "command", command: "edit.replace" });
    menu.addItem({ type: "separator" });
    menu.addItem({ type: "command", command: "edit.settings" });
    bar.addMenu(menu);
}