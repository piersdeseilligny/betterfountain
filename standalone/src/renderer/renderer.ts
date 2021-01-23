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
import { Editor } from './pages/editor';

import * as commandsFile from './commands/file';
import * as commandsView from './commands/view';


const commands = new CommandRegistry();





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
let dockCentral:DockPanelAlt;
let dockLeft:DockPanelAlt;
let dockRight:DockPanelAlt;

function main(): void {

  bar = new TitleBar();
  bar.id = 'menuBar';

  commandsFile.init(commands, bar);
  

  let contextMenu = new ContextMenu({ commands });

  document.addEventListener('contextmenu', (event: MouseEvent) => {
    if (contextMenu.open(event)) {
      event.preventDefault();
    }
  });

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    commands.processKeydownEvent(event);
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
    tabContainer.alignment = "end";

    topbar.addWidget(toolbar);
    topbar.addWidget(tabContainer);
    topbar.addWidget(toolbar2);

    dockCentral = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, toptabsContainer:tabContainer });
    dockCentral.addWidget(new Editor(''));
    dockCentral.addWidget(new ContentWidget('Red'));
    dockCentral.tabsConstrained = true;
    dockCentral.id = "dockcentral";
    (dockCentral.layout as DockLayout).updateTabLayout();

    dockLeft = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, edgesEnabled: sidepanelEnabledEdges});
    let red = new ContentWidget('OUTLINE');
    red.title.closable = false;
    let blue = new ContentWidget('CHARACTERS');
    blue.title.closable = false;
    dockLeft.addWidget(red);
    dockLeft.addWidget(blue);
    dockLeft.id = 'dock2'
    dockLeft.addClass('lm-mod-borderlesstab');
    dockLeft.addClass('lm-mod-sidepanel');

    dockRight = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, edgesEnabled: sidepanelEnabledEdges});
    let red1 = new ContentWidget('PDF');
    red1.title.closable = false;
    let blue1 = new ContentWidget('OPTIONS');
    blue1.title.closable = false;
    dockRight.addWidget(red1);
    dockRight.addWidget(blue1);
    dockRight.id = 'dock3'
    dockRight.addClass('lm-mod-borderlesstab');
    dockRight.addClass('lm-mod-sidepanel');

    commandsView.init(commands, bar, dockLeft, dockRight);

    SplitPanel.setStretch(dockLeft, 1);
    SplitPanel.setStretch(dockCentral, 2);
    SplitPanel.setStretch(dockRight, 1);

    toolbar.addItem("view.hideleft");
    toolbar2.addItem("view.hideright");
    toolbar.addItem("view.reload");
    toolbar.addItem("file.open");

    let split = new SplitPanel({spacing:0});

    split.addWidget(dockLeft);
    split.addWidget(dockCentral);
    split.addWidget(dockRight);
    split.id = "maincontent";

  let statusbar = new Statusbar.Statusbar({});

  window.onresize = () => { split.update(); topbar.update(); statusbar.update(); };

  Widget.attach(bar, document.body);
  Widget.attach(topbar, document.body);
  Widget.attach(split, document.body);
  Widget.attach(statusbar, document.body);
}

ipcRenderer.on('window', (evt: Electron.IpcRendererEvent, event:string, data:any)=>{
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

ipcRenderer.on('file', (evt: Electron.IpcRendererEvent, event:string, data:any)=>{
  if(event == 'open'){
    dockCentral.addWidget(new Editor(data));
  }
});


window.onload = main;
