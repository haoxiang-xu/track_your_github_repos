const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const DEV_SERVER_URL =
  process.env.ELECTRON_START_URL || "http://localhost:2907/#/mini";
const PROD_ENTRY_HASH = "/mini";
const DEV_SERVER_RETRY_MS = 1200;

let mainWindow = null;

const loadDevUrlWhenReady = async () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  try {
    const response = await fetch(DEV_SERVER_URL, { method: "HEAD" });
    if (response.ok || response.status < 500) {
      await mainWindow.loadURL(DEV_SERVER_URL);
      return;
    }
  } catch (error) {
    // Dev server not ready yet. Retry until CRA is available.
  }

  setTimeout(loadDevUrlWhenReady, DEV_SERVER_RETRY_MS);
};

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    title: "Mini UI",
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 620,
    icon: path.join(__dirname, "favicon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "..", "build", "index.html"), {
      hash: PROD_ENTRY_HASH,
    });
  } else {
    loadDevUrlWhenReady();
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    const isLocalAppUrl =
      url.startsWith("file://") || url.startsWith("http://localhost:2907");
    if (!isLocalAppUrl) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
