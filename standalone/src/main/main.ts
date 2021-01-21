import { app, BrowserWindow, dialog, ipcMain, Menu, MenuItem, shell } from 'electron';
import { electron } from 'process';
import * as fs from 'fs';
declare const MAIN_WINDOW_WEBPACK_ENTRY: any;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow:BrowserWindow;

const createWindow = (): void => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    frame:false,
    webPreferences:{
      nodeIntegration: true
    }
  });
  mainWindow.webContents.setZoomFactor(1.0); 
  
  // Upper Limit is working of 500 % 
  mainWindow.webContents 
      .setVisualZoomLevelLimits(1, 5) 

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.on('maximize', ()=>{
    mainWindow.webContents.send('window','maximize');
  })
  mainWindow.on('unmaximize', ()=>{
    mainWindow.webContents.send('window', 'unmaximize');
  })
  mainWindow.on('blur', ()=>{
    mainWindow.webContents.send('window','blur');
  })
  mainWindow.on('focus', ()=>{
    mainWindow.webContents.send('window','focus');
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

ipcMain.on('window', (event, op) => {
  if(op == 'close'){
    BrowserWindow.fromWebContents(event.sender).close();
  }
  else if(op == 'minimize'){
    BrowserWindow.fromWebContents(event.sender).minimize();
  }
  else if(op == 'maximize'){
    const win = BrowserWindow.fromWebContents(event.sender);
    if(win.isMaximized()) win.unmaximize();
    else win.maximize();
  }
  else if(op == 'reload'){
    const win = BrowserWindow.fromWebContents(event.sender);
    win.reload();
  }
});

ipcMain.on('file', async (event, op)=>{
  if(op == "open"){
    let window = BrowserWindow.fromWebContents(event.sender);
    let d = await dialog.showOpenDialog(window, {properties:['openFile'], buttonLabel:"Open screenplay", filters:[{name:'Fountain', extensions:['fountain','spmd']}]});
    if(!d.canceled){
      let contents = fs.readFileSync(d.filePaths[0]).toString();
      window.webContents.send('file', 'open', contents);
    }
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

const template:Electron.MenuItemConstructorOptions[] = [
  {
      label: 'Help',   // Help menu item
      submenu: [{ // adds submenu items
              label: 'About US',
          },{
              label: 'Zoom In',
              role: 'zoomIn', // gives this menu the role to close app when clicked  
              accelerator: 'CommandOrControl+='  // creates a shortcut to this action
          },{
            label: 'Reload',
            role:'reload',
            accelerator: 'CommandOrControl+R'
          }]
  }
]
// sets the menu
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu (menu)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
