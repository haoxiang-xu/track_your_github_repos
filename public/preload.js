const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("miniUIRuntime", {
  isElectron: true,
  platform: process.platform,
});
