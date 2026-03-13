const { app, BrowserWindow, shell, ipcMain, safeStorage } = require("electron");
const fs = require("fs");
const path = require("path");

const DEV_SERVER_URL =
  process.env.ELECTRON_START_URL || "http://localhost:60312/#";
const PROD_ENTRY_HASH = "/";
const DEV_SERVER_RETRY_MS = 1200;
const DARWIN_TRAFFIC_LIGHT_X = 14;
const DARWIN_TRAFFIC_LIGHT_Y = 18;
const GITHUB_TOKEN_FILENAME = "github-token.json";
const DEV_SERVER_ORIGIN = (() => {
  try {
    return new URL(DEV_SERVER_URL).origin;
  } catch (_error) {
    return "http://localhost:60312";
  }
})();

let mainWindow = null;
let darwinTrafficLightSyncTimeout = null;

const resolveGithubTokenFilePath = () =>
  path.join(app.getPath("userData"), GITHUB_TOKEN_FILENAME);

const readGithubTokenPayload = () => {
  try {
    const rawValue = fs.readFileSync(resolveGithubTokenFilePath(), "utf-8");
    return JSON.parse(rawValue);
  } catch (_error) {
    return null;
  }
};

const writeGithubTokenPayload = (payload) => {
  const filePath = resolveGithubTokenFilePath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(payload));
};

const clearGithubToken = () => {
  try {
    fs.unlinkSync(resolveGithubTokenFilePath());
  } catch (_error) {
    // Ignore missing token files.
  }
};

const readGithubToken = () => {
  const payload = readGithubTokenPayload();
  if (!payload || typeof payload.value !== "string") {
    return "";
  }

  if (!payload.encrypted) {
    return payload.value;
  }

  try {
    if (!safeStorage.isEncryptionAvailable()) {
      return "";
    }
    return safeStorage.decryptString(Buffer.from(payload.value, "base64"));
  } catch (_error) {
    return "";
  }
};

const storeGithubToken = (token) => {
  const normalizedToken = typeof token === "string" ? token.trim() : "";
  if (!normalizedToken) {
    clearGithubToken();
    return "";
  }

  try {
    if (safeStorage.isEncryptionAvailable()) {
      const encryptedValue = safeStorage.encryptString(normalizedToken);
      writeGithubTokenPayload({
        encrypted: true,
        value: encryptedValue.toString("base64"),
      });
      return normalizedToken;
    }
  } catch (_error) {
    // Fall back to plaintext storage on runtimes without encryption support.
  }

  writeGithubTokenPayload({
    encrypted: false,
    value: normalizedToken,
  });
  return normalizedToken;
};

const emitWindowState = () => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  mainWindow.webContents.send("window-state-event-listener", {
    isMaximized: mainWindow.isMaximized() || mainWindow.isFullScreen(),
  });
};

const syncDarwinTrafficLightPosition = () => {
  if (
    process.platform !== "darwin" ||
    !mainWindow ||
    mainWindow.isDestroyed()
  ) {
    return;
  }

  if (typeof mainWindow.setWindowButtonPosition !== "function") {
    return;
  }

  if (typeof mainWindow.setWindowButtonVisibility === "function") {
    mainWindow.setWindowButtonVisibility(true);
  }
  mainWindow.setWindowButtonPosition({
    x: DARWIN_TRAFFIC_LIGHT_X,
    y: DARWIN_TRAFFIC_LIGHT_Y,
  });
};

const scheduleDarwinTrafficLightSync = () => {
  if (process.platform !== "darwin") {
    return;
  }

  if (darwinTrafficLightSyncTimeout) {
    clearTimeout(darwinTrafficLightSyncTimeout);
  }

  syncDarwinTrafficLightPosition();

  darwinTrafficLightSyncTimeout = setTimeout(() => {
    syncDarwinTrafficLightPosition();
    setTimeout(syncDarwinTrafficLightPosition, 120);
  }, 16);
};

const createWindowOptions = () => {
  const baseWindowOptions = {
    title: "Repo Traffic",
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 620,
    icon: path.join(__dirname, "favicon.ico"),
    autoHideMenuBar: true,
    resizable: true,
    maximizable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (process.platform === "darwin") {
    return {
      ...baseWindowOptions,
      frame: true,
      titleBarStyle: "hidden",
      trafficLightPosition: {
        x: DARWIN_TRAFFIC_LIGHT_X,
        y: DARWIN_TRAFFIC_LIGHT_Y,
      },
      backgroundColor: "#121212",
      hasShadow: true,
    };
  }

  if (process.platform === "win32") {
    return {
      ...baseWindowOptions,
      frame: true,
      titleBarStyle: "hidden",
      hasShadow: true,
      backgroundColor: "#121212",
    };
  }

  return {
    ...baseWindowOptions,
    frame: true,
    titleBarStyle: "hidden",
    backgroundColor: "#121212",
  };
};

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
  mainWindow = new BrowserWindow(createWindowOptions());

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
      url.startsWith("file://") || url.startsWith(DEV_SERVER_ORIGIN);
    if (!isLocalAppUrl) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (process.platform === "darwin") {
    mainWindow.webContents.on(
      "did-finish-load",
      scheduleDarwinTrafficLightSync,
    );
    mainWindow.on("show", scheduleDarwinTrafficLightSync);
    mainWindow.on("focus", scheduleDarwinTrafficLightSync);
    mainWindow.on("resize", scheduleDarwinTrafficLightSync);
    mainWindow.on("leave-full-screen", scheduleDarwinTrafficLightSync);
  }

  mainWindow.on("maximize", emitWindowState);
  mainWindow.on("unmaximize", emitWindowState);
  mainWindow.on("enter-full-screen", emitWindowState);
  mainWindow.on("leave-full-screen", emitWindowState);
  mainWindow.once("ready-to-show", () => {
    emitWindowState();
    scheduleDarwinTrafficLightSync();
  });

  mainWindow.on("closed", () => {
    if (darwinTrafficLightSyncTimeout) {
      clearTimeout(darwinTrafficLightSyncTimeout);
      darwinTrafficLightSyncTimeout = null;
    }
    mainWindow = null;
  });
};

ipcMain.on("theme-set-background-color", (_event, color) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }
  if (typeof color === "string" && /^#[0-9a-fA-F]{6,8}$/.test(color)) {
    mainWindow.setBackgroundColor(color);
  }
});

ipcMain.on("window-state-event-handler", (_event, action) => {
  if (!mainWindow || mainWindow.isDestroyed()) {
    return;
  }

  switch (action) {
    case "close":
      mainWindow.close();
      break;
    case "minimize":
      mainWindow.minimize();
      break;
    case "maximize":
      if (process.platform === "darwin") {
        mainWindow.setFullScreen(!mainWindow.isFullScreen());
      } else if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
      break;
    default:
      break;
  }
});

ipcMain.handle("github-token:get", () => readGithubToken());

ipcMain.handle("github-token:set", (_event, token) => storeGithubToken(token));

ipcMain.handle("github-token:clear", () => {
  clearGithubToken();
  return true;
});

app.whenReady().then(() => {
  if (process.platform === "darwin" && app.dock) {
    const dockIconPath = path.join(__dirname, "logo512.png");
    try {
      const { nativeImage } = require("electron");
      const icon = nativeImage.createFromPath(dockIconPath);
      if (!icon.isEmpty()) {
        app.dock.setIcon(icon);
      }
    } catch (_) {
      // Silently ignore if icon cannot be loaded.
    }
  }

  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
