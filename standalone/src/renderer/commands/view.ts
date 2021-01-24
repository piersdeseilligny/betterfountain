import { CommandRegistry } from "@lumino/commands";
import { Menu } from "@lumino/widgets";
import { ipcRenderer, webFrame } from "electron";
import { DockPanelAlt } from "../lumino/DockPanel";
import { TitleBar } from "../lumino/TitleBar";

export function init(commands: CommandRegistry, bar: TitleBar, dockLeft: DockPanelAlt, dockRight: DockPanelAlt) {
  commands.addCommand('view.devtools', {
    label: 'Open developer tools',
    iconClass: 'codicon codicon-tools',
    execute: () => {
      ipcRenderer.send('window', 'devtools');
    }
  });
  commands.addCommand('view.reload', {
    label: 'Reload',
    caption: 'Reload content',
    iconClass: 'codicon codicon-refresh',
    execute: () => {
      ipcRenderer.send('window', 'reload');
    }
  });
  commands.addCommand('view.hideright', {
    label: 'Show right-side panel',
    caption: 'Show right-side panel',
    iconClass: 'codicon codicon-arrow-right',
    isToggleable: true,
    isToggled: () => {
      return dockRight.isVisible;
    },
    execute: () => {
      commands.notifyCommandChanged("view.hideright");
      if (dockRight.isVisible) dockRight.hide();
      else dockRight.show();
    }
  });
  commands.addCommand('view.hideleft', {
    label: 'Show left-side panel',
    caption: 'Show left-side panel',
    iconClass: 'codicon codicon-arrow-left',
    isToggleable: true,
    isToggled: () => {
      return dockLeft.isVisible;
    },
    execute: () => {
      commands.notifyCommandChanged("view.hideleft");
      if (dockLeft.isVisible) dockLeft.hide();
      else dockLeft.show();
    }
  });
  commands.addCommand('view.welcome', {
    label: 'Welcome Screen',
    iconClass: 'codicon codicon-home',
    execute: () => {
      //TODO
    }
  });

  commands.addCommand('view.zoomout', {
    label: 'Zoom out',
    iconClass: 'codicon codicon-zoom-out',
    execute: () => {
      let zoom = webFrame.getZoomFactor();
      console.log("zoom factor is " + zoom);
      webFrame.setZoomFactor(zoom - 0.1);
    }
  });
  commands.addCommand('view.zoomin', {
    label: 'Zoom in',
    iconClass: 'codicon codicon-zoom-in',
    execute: () => {
      let zoom = webFrame.getZoomFactor();
      console.log("zoom factor is " + zoom);
      webFrame.setZoomFactor(zoom + 0.1);
    }
  });
  commands.addCommand('view.zoomreset', {
    label: 'Reset zoom factor',
    iconClass: 'codicon codicon-zoom-in',
    execute: () => {
      let zoom = webFrame.getZoomFactor();
      webFrame.setZoomFactor(1);
      webFrame.setZoomLevel(0);
    }
  });

  commands.addKeyBinding({ keys: ['Accel D'], command: "view.hideright", selector: "body" });
  commands.addKeyBinding({ keys: ['Accel A'], command: "view.hideleft", selector: "body" });
  commands.addKeyBinding({ keys: ['Accel R'], command: "view.reload", selector: "body" });
  commands.addKeyBinding({ keys: ['Accel +'], command: "view.zoomin", selector: "body" });
  commands.addKeyBinding({ keys: ['Accel -'], command: "view.zoomout", selector: "body" });
  commands.addKeyBinding({ keys: ['Accel Shift +'], command: "view.zoomreset", selector: "body" });

  let menu = new Menu({ commands: commands });
  menu.title.label = 'View';
  menu.title.mnemonic = 0;
  menu.addItem({ type: "command", command: "view.hideleft" });
  menu.addItem({ type: "command", command: "view.hideright" });
  menu.addItem({ type: 'separator' });
  menu.addItem({ type: "command", command: "view.reload" });
  menu.addItem({ type: 'command', command: 'view.devtools' });
  menu.addItem({ type: 'command', command: 'view.zoomin' });
  menu.addItem({ type: 'command', command: 'view.zoomout' });
  menu.addItem({ type: 'command', command: 'view.zoomreset' });
  bar.addMenu(menu);
}