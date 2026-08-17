'use strict';
// NexOffice — Electron main process
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Windows taskbar grouping / notifications
app.setAppUserModelId('com.nexoffice.app');

function createWindow() {
  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 980,
    minHeight: 660,
    title: 'NexOffice',
    backgroundColor: '#0d1424',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.once('ready-to-show', () => win.show());

  // Load the existing single-file app
  win.loadFile(path.join(__dirname, '..', 'nexoffice_office_management_system.html'));

  // Open any external links in the system browser instead of a new window
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  return win;
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();

  // macOS: re-create a window when the dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
