// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2017, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/

import {
  CommandRegistry
} from '@lumino/commands';

import {
  Message
} from '@lumino/messaging';

import {
  BoxPanel, CommandPalette, ContextMenu, DockPanel, Menu, MenuBar, Panel, StackedPanel, TabBar, Title, Widget
} from '@lumino/widgets';
import { ipcRenderer } from 'electron';
import { DockPanelAlt } from './lumino/DockPanel';
import { SplitPanel } from './lumino/SplitPanel';
import { TitleBar } from './lumino/TitleBar';
import { each } from '@lumino/algorithm';

import './style/index.css';
import { Toolbar } from './lumino/Toolbar';
import { DockLayout } from './lumino/DockLayout';
import { Statusbar } from './lumino/StatusBar';


const commands = new CommandRegistry();


function createMenu(): Menu {
  let root = new Menu({ commands });
  root.addItem({ command: 'example:copy' });
  root.addItem({ command: 'example:cut' });
  root.addItem({ command: 'example:paste' });

  return root;
}


class ContentWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');
    let input = document.createElement('input');
    input.placeholder = 'Placeholder...';
    content.appendChild(input);
    node.appendChild(content);
    return node;
  }

  constructor(name: string) {
    super({ node: ContentWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('content');
    this.addClass(name.toLowerCase());
    this.title.label = name;
    this.title.closable = true;
    this.title.caption = `Long description for: ${name}`;
  }

  get inputNode(): HTMLInputElement {
    return this.node.getElementsByTagName('input')[0] as HTMLInputElement;
  }

  protected onActivateRequest(msg: Message): void {
    if (this.isAttached) {
      this.inputNode.focus();
    }
  }
}


let bar:TitleBar;
function main(): void {

  let menu1 = createMenu();
  menu1.title.label = 'File';
  menu1.title.mnemonic = 0;

  let menu2 = createMenu();
  menu2.title.label = 'Edit';
  menu2.title.mnemonic = 0;

  let menu3 = createMenu();
  menu3.title.label = 'View';
  menu3.title.mnemonic = 0;
  let menu4 = createMenu();
  menu3.addItem({type:"command", command:"view:hideleft"});
  menu3.addItem({type:"command", command:"view:hideright"});
  menu3.addItem({type:"command", command:"view:reload"});

  bar = new TitleBar();
  bar.addMenu(menu1);
  bar.addMenu(menu2);
  bar.addMenu(menu3);
  bar.id = 'menuBar';

  let contextMenu = new ContextMenu({ commands });

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    if (contextMenu.open(event)) {
      event.preventDefault();
    }
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    commands.processKeydownEvent(event);
  });


  let dockCentral:DockPanelAlt;
  let dockLeft:DockPanelAlt;
  let dockRight:DockPanelAlt;
  let main:StackedPanel;

  commands.addCommand('view.hideleft', {
    label: 'Show left-side panel',
    caption: 'Show left-side panel',
    iconClass: 'codicon codicon-arrow-left',
    isToggleable:true,
    isToggled: () =>{
      return !dockLeft.isVisible;
    },
    execute: () => {
      commands.notifyCommandChanged("view.hideleft");
      if(dockLeft.isVisible) dockLeft.hide();
      else dockLeft.show();
    }
  });
  commands.addCommand('view.reload',{
    label: 'Reload',
    caption: 'Reload content',
    iconClass: 'codicon codicon-refresh',
    execute:()=>{
      ipcRenderer.send('window', 'reload');
    }
  });
  commands.addCommand('view.hideright', {
    label: 'Show right-side panel',
    caption: 'Show right-side panel',
    iconClass: 'codicon codicon-arrow-right',
    isToggleable:true,
    isToggled: () =>{
      return !dockRight.isVisible;
    },
    execute: () => {
      commands.notifyCommandChanged("view.hideright");
      if(dockRight.isVisible) dockRight.hide();
      else dockRight.show();
    }
  });

    let sidepanelEnabledEdges = {
      right:false,
      left:false,
      top:true,
      bottom:true
    };
    let topbar = new Panel();
    topbar.id = "topbar";

    let toolbar = new Toolbar.Toolbar({commandRegistry:commands});
    let toolbar2 = new Toolbar.Toolbar({commandRegistry:commands});
    toolbar.addClass("topbar-toolbar");


    let tabContainer = new SplitPanel();
    tabContainer.id = "topbar-tabs";

    topbar.addWidget(toolbar);
    topbar.addWidget(tabContainer);
    topbar.addWidget(toolbar2);

    dockCentral = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, toptabsContainer:tabContainer });
    dockCentral.addWidget(new ContentWidget('Red'));
    dockCentral.addWidget(new ContentWidget('Blue'));
    dockCentral.addWidget(new ContentWidget('Purple'));
    dockCentral.tabsConstrained = true;
    dockCentral.id = "dockcentral";
    (dockCentral.layout as DockLayout).updateTabLayout();

    dockLeft = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, edgesEnabled: sidepanelEnabledEdges});
    let red = new ContentWidget('Red');
    red.title.closable = false;
    let blue = new ContentWidget('Blue');
    blue.title.closable = false;
    dockLeft.addWidget(red);
    dockLeft.addWidget(blue);
    dockLeft.id = 'dock2'
    dockLeft.addClass('lm-mod-borderlesstab');

    dockRight = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, edgesEnabled: sidepanelEnabledEdges});
    let red1 = new ContentWidget('Red');
    red1.title.closable = false;
    let blue1 = new ContentWidget('Blue');
    blue1.title.closable = false;
    dockRight.addWidget(red1);
    dockRight.addWidget(blue1);
    dockRight.id = 'dock3'
    dockRight.addClass('lm-mod-borderlesstab')

    SplitPanel.setStretch(dockLeft, 1);
    SplitPanel.setStretch(dockCentral, 2);
    SplitPanel.setStretch(dockRight, 1);

    toolbar.addItem("view.hideleft");
    toolbar2.addItem("view.hideright");
    toolbar.addItem("view.reload");

    let split = new SplitPanel({spacing:0});

    split.addWidget(dockLeft);
    split.addWidget(dockCentral);
    split.addWidget(dockRight);
    split.id = "maincontent";

  let savedLayouts: DockPanel.ILayoutConfig[] = [];

  commands.addCommand('save-dock-layout', {
    label: 'Save Layout',
    caption: 'Save the current dock layout',
    execute: () => {
      savedLayouts.push(dockCentral.saveLayout());
    }
  });

  commands.addCommand('restore-dock-layout', {
    label: args => {
      return `Restore Layout ${args.index as number}`;
    },
    execute: args => {
      dockCentral.restoreLayout(savedLayouts[args.index as number]);
    }
  });

  commands.addKeyBinding({keys:['Accel D'], command:"view:hideright", selector:"body"});
  commands.addKeyBinding({keys:['Accel A'], command:"view:hideleft", selector:"body"});
  commands.addKeyBinding({keys:['Accel R'], command:"view:reload", selector:"body"});

  //main.addWidget(palette);
  let statusbar = new Statusbar.Statusbar({});

  window.onresize = () => { split.update(); topbar.update(); statusbar.update(); };

  Widget.attach(bar, document.body);
  Widget.attach(topbar, document.body);
  Widget.attach(split, document.body);
  Widget.attach(statusbar, document.body);
}

ipcRenderer.on('window', (evt: Electron.IpcRendererEvent, event:string, data:any)=>{
  console.log(event);
  if(event == 'maximize'){
    document.body.classList.add('windowstatus-maximized');
    document.body.classList.remove('windowstatus-normal');
  }
  else if(event == 'unmaximize'){
    document.body.classList.add('windowstatus-normal');
    document.body.classList.remove('windowstatus-maximized');
  }
  else if(event == 'focus'){
    document.body.classList.remove('windowstatus-blurred');
  }
  else if(event == 'blur'){
    document.body.classList.add('windowstatus-blurred');
  }
});


window.onload = main;
