'use strict';
// NexCompany AI — preload. Exposes a tiny, read-only desktop API to the renderer.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('nexcompanyAPI', {
  isDesktop: true,
  appName: 'NexCompany AI',
  version: '2.0.0',
});
