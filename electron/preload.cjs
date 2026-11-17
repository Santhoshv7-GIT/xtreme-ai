const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('xtremeDesktop', {
  isDesktop: true,
  platform: process.platform,
  version: '1.0.0'
});
