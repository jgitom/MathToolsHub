const { contextBridge, ipcRenderer } = require("electron");

// Minimal, safe bridge. The SME POS renderer runs sandboxed and handles its own
// licensing (Ed25519 via WebCrypto) and data storage (IndexedDB) — the desktop
// shell only adds a native Save As dialog for exports and version info.
contextBridge.exposeInMainWorld("desktopAPI", Object.freeze({
  isDesktop: true,
  version: process.env.npm_package_version || "1.0.0",
  saveFile: (defaultName, text, mimeType) =>
    ipcRenderer.invoke("file:save", { defaultName, text, mimeType })
}));
