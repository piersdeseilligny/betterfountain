/**
 * This is the main renderer process. It runs in chromium,
 * and actually displays the UI, allowing the user to
 * interact with the app.
 * 
 * Communication with the main process occurs through 'ipcRenderer'
 */

import { CommandRegistry } from '@lumino/commands';

import { ContextMenu, Panel, Widget } from '@lumino/widgets';
import { ipcRenderer } from 'electron';
import { DockPanelAlt } from './lumino/DockPanel';
import { SplitPanel } from './lumino/SplitPanel';
import { TitleBar } from './lumino/TitleBar';

import './style/index.css';
import { Toolbar } from './lumino/Toolbar';
import { Statusbar } from './lumino/StatusBar';
import { Editor } from './pages/editor';

import * as commandsFile from './commands/file';
import * as commandsEdit from './commands/edit';
import * as commandsTools from './commands/tools';
import * as commandsDeliver from './commands/deliver';
import * as commandsView from './commands/view';

import { SplitLayout } from './lumino/SplitLayout';


const commands = new CommandRegistry();

/**
 * A basic content widget, useful for testing
 */
class ContentWidget extends Widget {
  constructor(name: string) {
    super({ node: ContentWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('content');
    this.addClass(name.toLowerCase());
    this.title.label = name;
  }
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');
    node.appendChild(content);
    return node;
  }
}


let bar:TitleBar;
let dockCentral:DockPanelAlt;
let dockLeft:DockPanelAlt;
let dockRight:DockPanelAlt;

function main(): void {

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    //Ensure that any keybindings get triggered
    commands.processKeydownEvent(event);
  });


    dockCentral = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, toptabsLeft:48, toptabsRight:24 });
    dockCentral.addWidget(new Editor(''));
    dockCentral.tabsConstrained = true;
    dockCentral.id = "dockcentral";

    let sidepanelEnabledEdges = {
      right:false,
      left:false,
      top:true,
      bottom:true
    };
    dockLeft = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, edgesEnabled: sidepanelEnabledEdges});
    dockLeft.addWidget(new ContentWidget('OUTLINE'));
    dockLeft.addWidget(new ContentWidget('CHARACTERS'));
    dockLeft.id = 'dock2'
    dockLeft.addClass('lm-mod-borderlesstab');
    dockLeft.addClass('lm-mod-sidepanel');

    dockRight = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, edgesEnabled: sidepanelEnabledEdges});
    dockRight.addWidget(new ContentWidget('PDF'));
    dockRight.addWidget(new ContentWidget('PRESETS'));
    dockRight.id = 'dock3'
    dockRight.addClass('lm-mod-borderlesstab');
    dockRight.addClass('lm-mod-sidepanel');


    //Initiate the title bar and menu
    bar = new TitleBar();
    bar.id = 'menuBar';
    commandsFile.init(commands, bar);
    commandsEdit.init(commands, bar);
    commandsTools.init(commands,bar);
    commandsDeliver.init(commands, bar);
    commandsView.init(commands, bar, dockLeft, dockRight);


    SplitPanel.setStretch(dockCentral, 2);
    SplitPanel.setWidthBasis(dockLeft, 300);
    SplitPanel.setWidthBasis(dockRight, 300);



    let topbar = new Panel();
    topbar.id = "topbar";

    let toolbarLeft = new Toolbar.Toolbar({commandRegistry:commands});
    let toolbarRight = new Toolbar.Toolbar({commandRegistry:commands});
    toolbarLeft.addClass("toolbar-left");
    toolbarRight.addClass("toolbar-right");
    topbar.addWidget(toolbarLeft);
    topbar.addWidget(toolbarRight);

    toolbarLeft.addItem("view.hideleft");
    toolbarLeft.addItem("view.reload");
    toolbarLeft.addItem("file.open");

    toolbarRight.addItem("view.zoomin");
    toolbarRight.addItem("view.devtools");
    toolbarRight.addItem("view.hideright");



    let split = new SplitPanel({spacing:0});
    split.addWidget(dockLeft);
    split.addWidget(dockCentral);
    split.addWidget(dockRight);
    split.id = "maincontent";


    (split.layout as SplitLayout).onMove = function(index, position){
      if(index == 0){
        let leftoffset = 0;
        let dockleftWidth = position;
        if(108>dockleftWidth){
          leftoffset = 108 - dockleftWidth;
        }
        dockCentral.toptabsLeft = leftoffset;
      }
    }

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
