"use strict";
const electron = require("electron");
const path = require("path");
const Store = require("electron-store");
const is = {
  dev: !electron.app.isPackaged
};
({
  isWindows: process.platform === "win32",
  isMacOS: process.platform === "darwin",
  isLinux: process.platform === "linux"
});
const store = new Store({
  name: "vocabglance-data",
  defaults: {
    words: [
      { id: 1, word: "Ephemeral", definition: "Lasting for a very short time; quickly fading.", source: "Daily Star", date: "Apr 27", mastered: false, seen: 0 },
      { id: 2, word: "Eloquent", definition: "Fluent and powerfully persuasive in speech or writing.", source: "Daily Star", date: "Apr 27", mastered: false, seen: 0 },
      { id: 3, word: "Ubiquitous", definition: "Present, appearing, or found everywhere simultaneously.", source: "", date: "Apr 27", mastered: false, seen: 0 },
      { id: 4, word: "Serendipity", definition: "The faculty of making fortunate discoveries by accident.", source: "Daily Star", date: "Apr 27", mastered: false, seen: 0 },
      { id: 5, word: "Perfidious", definition: "Deceitful and untrustworthy; guilty of betrayal.", source: "Daily Star", date: "Apr 27", mastered: false, seen: 0 },
      { id: 6, word: "Laconic", definition: "Using very few words; brief and concise in speech.", source: "", date: "Apr 27", mastered: false, seen: 0 },
      { id: 7, word: "Pernicious", definition: "Having a harmful effect in a gradual or subtle way.", source: "Daily Star", date: "Apr 27", mastered: false, seen: 0 },
      { id: 8, word: "Melancholy", definition: "A deep, reflective sadness — pensive and lingering.", source: "", date: "Apr 27", mastered: false, seen: 0 }
    ],
    settings: {
      intervalMs: 3e5,
      // 5 minutes default
      position: "bottom-right",
      // 'bottom-right' | 'bottom-left'
      enabled: true,
      startWithWindows: false,
      popupDurationMs: 8e3
    }
  }
});
let dashboardWin = null;
let popupWin = null;
let tray = null;
let scheduleTimer = null;
let shuffleQueue = [];
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function buildQueue() {
  const words = store.get("words");
  const active = words.filter((w) => !w.mastered);
  const mastered = words.filter((w) => w.mastered);
  const mSlots = Math.max(0, Math.round(mastered.length * 0.2));
  shuffleQueue = shuffleArray([...active, ...shuffleArray(mastered).slice(0, mSlots)]);
}
function createPopupWindow() {
  const { width, height } = electron.screen.getPrimaryDisplay().workAreaSize;
  const settings = store.get("settings");
  const W = 360, H = 180;
  const x = settings.position === "bottom-left" ? 24 : width - W - 24;
  const y = height;
  popupWin = new electron.BrowserWindow({
    x,
    y,
    width: W,
    height: H,
    minWidth: W,
    minHeight: H,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    // never steals keyboard focus
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  popupWin.setAlwaysOnTop(true, "screen-saver");
  popupWin.setVisibleOnAllWorkspaces(true);
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    popupWin.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/popup.html`);
  } else {
    popupWin.loadFile(path.join(__dirname, "../renderer/popup.html"));
  }
  popupWin.on("closed", () => {
    popupWin = null;
  });
}
function createDashboardWindow() {
  if (dashboardWin) {
    dashboardWin.focus();
    return;
  }
  dashboardWin = new electron.BrowserWindow({
    width: 920,
    height: 680,
    minWidth: 700,
    minHeight: 520,
    title: "VocabGlance",
    frame: false,
    // custom title bar
    transparent: false,
    backgroundColor: "#0D0F14",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  dashboardWin.once("ready-to-show", () => {
    dashboardWin.show();
    if (is.dev) dashboardWin.webContents.openDevTools();
  });
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    dashboardWin.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    dashboardWin.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  dashboardWin.on("closed", () => {
    dashboardWin = null;
  });
  dashboardWin.webContents.setWindowOpenHandler(({ url }) => {
    electron.shell.openExternal(url);
    return { action: "deny" };
  });
}
function createTray() {
  let icon;
  try {
    icon = electron.nativeImage.createFromPath(path.join(__dirname, "../../resources/tray.png"));
    if (icon.isEmpty()) throw new Error("empty");
  } catch {
    icon = electron.nativeImage.createEmpty();
  }
  tray = new electron.Tray(icon);
  tray.setToolTip("VocabGlance – Running");
  buildTrayMenu();
  tray.on("double-click", () => createDashboardWindow());
}
function buildTrayMenu() {
  const settings = store.get("settings");
  const menu = electron.Menu.buildFromTemplate([
    {
      label: "VocabGlance",
      enabled: false
    },
    { type: "separator" },
    {
      label: settings.enabled ? "⏸  Pause Reminders" : "▶  Resume Reminders",
      click: () => {
        const s = store.get("settings");
        s.enabled = !s.enabled;
        store.set("settings", s);
        s.enabled ? startScheduler() : stopScheduler();
        buildTrayMenu();
        dashboardWin?.webContents.send("settings-changed", store.get("settings"));
      }
    },
    {
      label: "👁  Preview Word Now",
      click: () => triggerPopup()
    },
    { type: "separator" },
    {
      label: "📚  Open Dashboard",
      click: () => createDashboardWindow()
    },
    { type: "separator" },
    {
      label: "Quit VocabGlance",
      click: () => {
        electron.app.isQuiting = true;
        electron.app.quit();
      }
    }
  ]);
  tray.setContextMenu(menu);
}
function startScheduler() {
  stopScheduler();
  const settings = store.get("settings");
  if (!settings.enabled) return;
  scheduleTimer = setInterval(() => {
    triggerPopup();
  }, settings.intervalMs);
}
function stopScheduler() {
  if (scheduleTimer) {
    clearInterval(scheduleTimer);
    scheduleTimer = null;
  }
}
function triggerPopup() {
  const words = store.get("words");
  if (words.length === 0) return;
  if (shuffleQueue.length === 0) buildQueue();
  const word = shuffleQueue.shift();
  if (!word) return;
  const updated = words.map(
    (w) => w.id === word.id ? { ...w, seen: (w.seen || 0) + 1 } : w
  );
  store.set("words", updated);
  if (!popupWin || popupWin.isDestroyed()) {
    createPopupWindow();
    popupWin.webContents.once("did-finish-load", () => {
      sendWordToPopup(word);
    });
  } else {
    sendWordToPopup(word);
  }
  dashboardWin?.webContents.send("words-updated", store.get("words"));
}
function sendWordToPopup(word) {
  if (!popupWin || popupWin.isDestroyed()) return;
  const settings = store.get("settings");
  popupWin.webContents.send("show-word", {
    word,
    duration: settings.popupDurationMs,
    position: settings.position,
    queueLength: shuffleQueue.length
  });
}
electron.ipcMain.handle("get-words", () => store.get("words"));
electron.ipcMain.handle("save-words", (_e, words) => {
  store.set("words", words);
  shuffleQueue = [];
  return true;
});
electron.ipcMain.handle("get-settings", () => store.get("settings"));
electron.ipcMain.handle("save-settings", (_e, settings) => {
  store.set("settings", settings);
  electron.app.setLoginItemSettings({ openAtLogin: settings.startWithWindows });
  if (settings.enabled) startScheduler();
  else stopScheduler();
  buildTrayMenu();
  return true;
});
electron.ipcMain.handle("preview-popup", () => {
  triggerPopup();
  return true;
});
electron.ipcMain.handle("mark-mastered", (_e, wordId) => {
  const words = store.get("words").map(
    (w) => w.id === wordId ? { ...w, mastered: true } : w
  );
  store.set("words", words);
  shuffleQueue = [];
  dashboardWin?.webContents.send("words-updated", words);
  return true;
});
electron.ipcMain.handle("close-popup", () => {
  if (popupWin && !popupWin.isDestroyed()) popupWin.close();
  return true;
});
electron.ipcMain.handle("resize-popup", (_e, height) => {
  if (popupWin && !popupWin.isDestroyed()) {
    popupWin.setSize(360, Math.min(Math.max(height, 140), 320));
    const { width, height: screenH } = electron.screen.getPrimaryDisplay().workAreaSize;
    const settings = store.get("settings");
    const [w] = popupWin.getSize();
    const x = settings.position === "bottom-left" ? 24 : width - w - 24;
    const y = screenH - popupWin.getSize()[1] - 24;
    popupWin.setPosition(x, y);
  }
  return true;
});
electron.ipcMain.on("window-minimize", () => dashboardWin?.minimize());
electron.ipcMain.on("window-maximize", () => dashboardWin?.isMaximized() ? dashboardWin.unmaximize() : dashboardWin.maximize());
electron.ipcMain.on("window-close", () => dashboardWin?.close());
electron.app.whenReady().then(() => {
  buildQueue();
  createTray();
  createDashboardWindow();
  setTimeout(() => {
    startScheduler();
    setTimeout(() => triggerPopup(), 1e4);
  }, 3e3);
});
electron.app.on("window-all-closed", (e) => {
  if (!electron.app.isQuiting) e.preventDefault();
});
electron.app.on("before-quit", () => {
  electron.app.isQuiting = true;
  stopScheduler();
});
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createDashboardWindow();
});
