const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("assetAPI", Object.freeze({
  load: () => ipcRenderer.invoke("assets:load"),
  save: store => ipcRenderer.invoke("assets:save", store),
  exportData: store => ipcRenderer.invoke("assets:export", store),
  importData: () => ipcRenderer.invoke("assets:import"),
  licenseStatus: () => ipcRenderer.invoke("license:status"),
  importLicense: () => ipcRenderer.invoke("license:import")
}));
