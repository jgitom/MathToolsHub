const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const APP_VERSION = app.getVersion();

function createWindow() {
  const window = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: "#f5f7fb",
    title: "MathToolsHub SME POS",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  window.setMenuBarVisibility(false);
  window.loadFile("index.html");
}

// Native "Save As" for CSV / backup exports coming from the renderer.
ipcMain.handle("file:save", async (_event, payload) => {
  const { defaultName, text } = payload || {};
  const extension = String(defaultName || "file").split(".").pop() || "txt";
  const result = await dialog.showSaveDialog({
    title: "Save file",
    defaultPath: defaultName || "file.txt",
    filters: [{ name: extension.toUpperCase() + " files", extensions: [extension] }]
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  await fs.writeFile(result.filePath, String(text ?? ""), "utf8");
  return { canceled: false, filePath: result.filePath };
});

app.whenReady().then(() => {
  app.setAppUserModelId("com.mathtoolshub.smepos");
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

module.exports = { APP_VERSION };
