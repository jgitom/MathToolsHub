// CJ PDF to Word Converter — preload (isolated context)
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cjpdfAPI', {
  isDesktop: true,
  version: '1.0.0',
  // Opens a native Save As dialog and writes the DOCX to disk.
  saveFile: (suggestedName, arrayBuffer) =>
    ipcRenderer.invoke('save-file', suggestedName, arrayBuffer)
});
