import { CommandRegistry } from "@lumino/commands";
import { Menu } from "@lumino/widgets";
import { ipcRenderer } from "electron";
import { DockPanelAlt } from "../lumino/DockPanel";
import { TitleBar } from "../lumino/TitleBar";
import { AboutPage } from "../pages/about";
import * as renderer from "../renderer";

export function init(commands: CommandRegistry, bar: TitleBar) {
    commands.addCommand('help.cheatsheet', {
        label: "Fountain cheat sheet",
        iconClass: 'codicon codicon-checklist',
        execute: function (args) {
            //TODO
        }
    });
    commands.addCommand('help.tutorials', {
        label: "Tutorials",
        iconClass: 'codicon codicon-play',
        execute: function (args) {
            //TODO
        }
    });
    commands.addCommand('help.about', {
        label: "About",
        iconClass: 'codicon codicon-info',
        execute: function (args) {
           if(renderer.hasTab("about")){
               renderer.selectTab("about");
           }
           else{
               renderer.newTab(new AboutPage());
           }
        }
    });

    let menu = new Menu({ commands: commands });
    menu.title.label = 'Help';
    menu.title.mnemonic = 0;
    menu.addItem({ type: "command", command: "help.cheatsheet" });
    menu.addItem({ type: "command", command: "help.tutorials" });
    menu.addItem({ type: "separator" });
    menu.addItem({ type: "command", command: "help.about" });
    bar.addMenu(menu);
}