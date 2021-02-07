/**
 * This is the main renderer process. It runs in chromium,
 * and actually displays the UI, allowing the user to
 * interact with the app.
 * 
 * Communication with the main process occurs through 'ipcRenderer'
 */

import { CommandRegistry } from '@lumino/commands';


import { toArray } from "@lumino/algorithm";
import { Panel, Widget } from '@lumino/widgets';
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
import * as commandsHelp from './commands/help';

import { SplitLayout } from './lumino/SplitLayout';
import { IMessageHandler, IMessageHook, Message, MessageLoop } from '@lumino/messaging';
import { ScreenplayContent } from '../main/file/file';
import { Pane, PaneCollection } from './panes/pane';
import { InspectPane } from './panes/inspect';
import { OutlinePane } from './panes/outline';
import { PdfPane } from './panes/pdf';
import { AppSignals } from './signals';




export const commands = new CommandRegistry();

export const appSignals = new AppSignals();

/**
 * A basic content widget, useful for testing
 */
export class ContentWidget extends Widget {
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

function main(): void {

  document.addEventListener('keydown', (event: KeyboardEvent) => {
    //Ensure that any keybindings get triggered
    commands.processKeydownEvent(event);
  });


    dockCentral = new DockPanelAlt({mode:'multiple-document', tabsConstrained:true, toptabsLeft:0, toptabsRight:0 });
    dockCentral.tabsConstrained = true;
    dockCentral.id = "dockcentral";

    let sidepanelEnabledEdges = {
      right:false,
      left:false,
      top:true,
      bottom:true
    };


    const leftSide = new Panel();
    leftSide.addClass('lm-mod-sidepanel');
    const leftSideCollection = new PaneCollection(leftSide, commands);
    leftSideCollection.selectedPane = "view.inspect";
    leftSideCollection.addPane(new InspectPane());
    leftSideCollection.addPane(new OutlinePane());

    const rightSide = new Panel();
    rightSide.addClass('lm-mod-sidepanel');
    rightSide.hide();
    const rightSideCollection = new PaneCollection(rightSide, commands);
    rightSideCollection.addPane(new PdfPane());

    //Initiate the title bar and menu
    bar = new TitleBar();
    bar.id = 'menuBar';
    commandsFile.init(commands, bar);
    commandsEdit.init(commands, bar);
    commandsTools.init(commands,bar);
    commandsDeliver.init(commands, bar);
    commandsView.init(commands, bar);
    commandsHelp.init(commands,bar);



    let topbar = new Panel();
    topbar.id = "topbar";

    let toolbarLeft = new Toolbar.Toolbar({commandRegistry:commands});
    let toolbarRight = new Toolbar.Toolbar({commandRegistry:commands});
    toolbarLeft.addClass("toolbar-left");
    toolbarRight.addClass("toolbar-right");
    topbar.addWidget(toolbarLeft);
    topbar.addWidget(toolbarRight);

    toolbarLeft.addItem("view.inspect")
    toolbarLeft.addItem("view.outline")
    toolbarLeft.addSeparator();
    toolbarLeft.addItem("view.reload");

    
    toolbarRight.addItem("view.zoomin");
    toolbarRight.addItem("view.devtools");
    toolbarRight.addSeparator();
    toolbarRight.addItem("view.pdf");


    let split = new SplitPanel({spacing:0});
    SplitPanel.setStretch(dockCentral, 2);
    SplitPanel.setWidthBasis(leftSide, 300);
    SplitPanel.setWidthBasis(rightSide, 300);
    split.addWidget(leftSide);
    split.addWidget(dockCentral);
    split.addWidget(rightSide);
    split.id = "maincontent";


    //We can't use a messagehook for this, we need to hook straight in to keep it from looking 
    (split.layout as SplitLayout).onMove = function(index, position){
      if(index == 0){
        let leftoffset = 0;
        let dockleftWidth = position;
        if(toolbarLeft.node.clientWidth > dockleftWidth){
          leftoffset = toolbarLeft.node.clientWidth - dockleftWidth;
        }
        dockCentral.toptabsLeft = leftoffset;
      }
    }

    class VisiblityHook implements IMessageHook{
      messageHook(target: IMessageHandler, msg: Message): boolean {
        if(msg.type == "after-hide"){
          if(target == leftSide){
            dockCentral.toptabsLeft = toolbarLeft.node.clientWidth;
          }
          else if(target == rightSide){
            dockCentral.toptabsRight = toolbarRight.node.clientWidth;
          }
        }
        else if(msg.type == "after-show"){
          if(target == leftSide){
            let leftoffset = 0;
            const dockleftWidth = leftSide.node.clientWidth;
            if(toolbarLeft.node.clientWidth > dockleftWidth){
              leftoffset = toolbarLeft.node.clientWidth - dockleftWidth;
            }
            dockCentral.toptabsLeft = leftoffset;
          }
        }
        return true;
      }
    }
    let dockLeftHook = new VisiblityHook();
    let dockRightHook = new VisiblityHook();
    MessageLoop.installMessageHook(leftSide, dockLeftHook);
    MessageLoop.installMessageHook(rightSide, dockRightHook);

  let statusbar = new Statusbar.Statusbar({});

  window.onresize = () => { split.update(); topbar.update(); statusbar.update(); };

  Widget.attach(bar, document.body);
  Widget.attach(topbar, document.body);
  Widget.attach(split, document.body);
  Widget.attach(statusbar, document.body);

  dockLeftHook.messageHook(leftSide, new Message('after-show'));
  dockRightHook.messageHook(rightSide, new Message('after-show'));
}

export function newTab(widget:Widget){
  dockCentral.addWidget(widget);
  dockCentral.selectWidget(widget);
}
export function hasTab(id:string):boolean{
  let widgets = toArray(dockCentral.widgets());
  for (let i = 0; i < widgets.length; i++) {
    if(widgets[i].id == id){
      return true;
    }
  }
  return false;
}
export function selectTab(id:string){
  let widgets = toArray(dockCentral.widgets());
  for (let i = 0; i < widgets.length; i++) {
    if(widgets[i].id == id){
       dockCentral.selectWidget(widgets[i]);
       break;
    }
  }
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
    let editor = new Editor(data as ScreenplayContent);
    newTab(editor);
  }
});

window.onload = main;
