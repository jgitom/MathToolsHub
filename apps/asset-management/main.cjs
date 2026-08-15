const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");

const dataFile = () => path.join(app.getPath("userData"), "assets.json");
const emptyStore = () => ({ version: 1, assets: [], updatedAt: new Date().toISOString() });

async function loadStore() {
  try {
    const parsed = JSON.parse(await fs.readFile(dataFile(), "utf8"));
    return { ...emptyStore(), ...parsed, assets: Array.isArray(parsed.assets) ? parsed.assets : [] };
  } catch (error) {
    if (error.code !== "ENOENT") console.error("Unable to load asset database", error);
    return emptyStore();
  }
}

async function saveStore(store) {
  const next = { ...store, version: 1, updatedAt: new Date().toISOString() };
  await fs.mkdir(path.dirname(dataFile()), { recursive: true });
  await fs.writeFile(dataFile(), JSON.stringify(next, null, 2), "utf8");
  return next;
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#f3f6fa",
    title: "MathToolsHub Asset Management",
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  window.setMenuBarVisibility(false);
  window.loadFile("index.html");
}

ipcMain.handle("assets:load", loadStore);
ipcMain.handle("assets:save", (_event, store) => saveStore(store));
ipcMain.handle("assets:export", async (_event, store) => {
  const result = await dialog.showSaveDialog({ title: "Export asset database", defaultPath: "mathtoolshub-assets.json", filters: [{ name: "JSON", extensions: ["json"] }] });
  if (result.canceled || !result.filePath) return { canceled: true };
  await fs.writeFile(result.filePath, JSON.stringify(store, null, 2), "utf8");
  return { canceled: false, filePath: result.filePath };
});
ipcMain.handle("assets:import", async () => {
  const result = await dialog.showOpenDialog({ title: "Import asset database", properties: ["openFile"], filters: [{ name: "JSON", extensions: ["json"] }] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  const parsed = JSON.parse(await fs.readFile(result.filePaths[0], "utf8"));
  if (!Array.isArray(parsed.assets)) throw new Error("The selected file is not a valid asset database.");
  return { canceled: false, store: await saveStore({ ...emptyStore(), ...parsed }) };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
