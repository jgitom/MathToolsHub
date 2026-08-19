// GovProject PMIS — Electron main process
// Loads the single-file web app (govproject_pmis.html) inside a desktop window.
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

app.setName('GovProject PMIS');

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 640,
    title: 'GovProject PMIS',
    icon: path.join(__dirname, 'build', 'icon.png'),
    backgroundColor: '#eef2f7',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Keep the app self-contained: no navigation away from the local file.
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) e.preventDefault();
  });

  // window.open('') used by the print report → allow a blank child window.
  // External http(s) links open in the system browser instead.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.loadFile('govproject_pmis.html');
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
