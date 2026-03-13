const { contextBridge, ipcRenderer } = require("electron");

const runtimeInfo = {
  isElectron: true,
  platform: process.platform,
};

contextBridge.exposeInMainWorld("runtime", runtimeInfo);

contextBridge.exposeInMainWorld("osInfo", {
  platform: process.platform,
});

contextBridge.exposeInMainWorld("themeAPI", {
  setBackgroundColor: (color) => {
    ipcRenderer.send("theme-set-background-color", color);
  },
});

contextBridge.exposeInMainWorld("windowStateAPI", {
  windowStateEventHandler: (action) => {
    ipcRenderer.send("window-state-event-handler", action);
  },
  windowStateEventListener: (callback) => {
    if (typeof callback !== "function") {
      return () => {};
    }

    const listener = (_event, payload) => {
      callback(payload || { isMaximized: false });
    };
    ipcRenderer.on("window-state-event-listener", listener);

    return () => {
      ipcRenderer.removeListener("window-state-event-listener", listener);
    };
  },
});

contextBridge.exposeInMainWorld("githubTokenAPI", {
  get: () => ipcRenderer.invoke("github-token:get"),
  set: (token) => ipcRenderer.invoke("github-token:set", token),
  clear: () => ipcRenderer.invoke("github-token:clear"),
});
