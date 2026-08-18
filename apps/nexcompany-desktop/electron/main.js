'use strict';
// NexCompany AI — Electron main process (desktop installer app).
// Build installers with:  npm install && npm run dist:win
// Outputs to /dist  (NexCompany-Setup-2.0.0.exe on Windows, .dmg on macOS).
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// Windows taskbar grouping / notifications
app.setAppUserModelId('com.mathtoolshub.nexcompany');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    title: 'NexCompany AI',
    backgroundColor: '#0d1424',
    autoHideMenuBar: true,
    show: false,
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.once('ready-to-show', () => win.show());

  // Load the single-file web app (works fully offline — localStorage/SQLite drivers).
  win.loadFile(path.join(__dirname, '..', 'index.html'));

  // Open any external (http/https) links in the system browser instead of a new window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => {
    if (/^https?:/i.test(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
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
