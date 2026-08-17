'use strict';
// NexOffice — Electron preload (contextIsolation safe)
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('nexoffice', {
  platform: process.platform,
  isDesktop: true
});
