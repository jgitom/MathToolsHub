const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { verifyLicense, enforceAssetLimit } = require("./license.cjs");

const dataFile = () => path.join(app.getPath("userData"), "assets.json");
const licenseFile = () => path.join(app.getPath("userData"), "license.mthlic");
const emptyStore = () => ({ version: 1, assets: [], updatedAt: new Date().toISOString() });

async function loadLicense() {
  try {
    const document = JSON.parse(await fs.readFile(licenseFile(), "utf8"));
    return { ...verifyLicense(document), document };
  } catch (error) {
    return { valid: false, error: error.code === "ENOENT" ? "No licence activated." : error.message };
  }
}

const publicLicenseStatus = licence => licence.valid ? { valid: true, assetLimit: licence.assetLimit, purchaseId: licence.purchaseId, issuedAt: licence.issuedAt } : { valid: false, error: licence.error };

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
  enforceAssetLimit(next, await loadLicense());
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
ipcMain.handle("license:status", async () => publicLicenseStatus(await loadLicense()));
ipcMain.handle("license:import", async () => {
  const result = await dialog.showOpenDialog({ title: "Activate Asset Management licence", properties: ["openFile"], filters: [{ name: "MathToolsHub licence", extensions: ["mthlic", "json"] }] });
  if (result.canceled || !result.filePaths[0]) return { canceled: true };
  const document = JSON.parse(await fs.readFile(result.filePaths[0], "utf8"));
  const licence = verifyLicense(document);
  enforceAssetLimit(await loadStore(), licence);
  await fs.mkdir(path.dirname(licenseFile()), { recursive: true });
  await fs.writeFile(licenseFile(), JSON.stringify(document, null, 2), { encoding: "utf8", mode: 0o600 });
  return { canceled: false, status: publicLicenseStatus(licence) };
});
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
  enforceAssetLimit(parsed, await loadLicense());
  return { canceled: false, store: await saveStore({ ...emptyStore(), ...parsed }) };
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
