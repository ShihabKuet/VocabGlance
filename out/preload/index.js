"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // ── Words ──────────────────────────────────────────────────────────────────
  getWords: () => electron.ipcRenderer.invoke("get-words"),
  saveWords: (words) => electron.ipcRenderer.invoke("save-words", words),
  markMastered: (id) => electron.ipcRenderer.invoke("mark-mastered", id),
  // ── App Info ───────────────────────────────────────────────────────────────
  getAppVersion: () => electron.ipcRenderer.invoke("get-app-version"),
  // ── Settings ───────────────────────────────────────────────────────────────
  getSettings: () => electron.ipcRenderer.invoke("get-settings"),
  saveSettings: (settings) => electron.ipcRenderer.invoke("save-settings", settings),
  // ── Theme ──────────────────────────────────────────────────────────────────
  /** Returns true if OS is currently in dark mode */
  getSystemTheme: () => electron.ipcRenderer.invoke("get-system-theme"),
  /** Called when the OS switches dark/light mode */
  onSystemThemeChanged: (cb) => {
    electron.ipcRenderer.on("system-theme-changed", (_e, isDark) => cb(isDark));
  },
  // ── Popup control ──────────────────────────────────────────────────────────
  previewPopup: () => electron.ipcRenderer.invoke("preview-popup"),
  closePopup: () => electron.ipcRenderer.invoke("close-popup"),
  resizePopup: (height) => electron.ipcRenderer.invoke("resize-popup", height),
  // ── Window controls ────────────────────────────────────────────────────────
  minimizeWindow: () => electron.ipcRenderer.send("window-minimize"),
  maximizeWindow: () => electron.ipcRenderer.send("window-maximize"),
  closeWindow: () => electron.ipcRenderer.send("window-close"),
  // ── Main → Renderer events ─────────────────────────────────────────────────
  onShowWord: (cb) => electron.ipcRenderer.on("show-word", (_e, p) => cb(p)),
  onWordsUpdated: (cb) => electron.ipcRenderer.on("words-updated", (_e, w) => cb(w)),
  onSettingsChanged: (cb) => electron.ipcRenderer.on("settings-changed", (_e, s) => cb(s)),
  removeListeners: (channel) => electron.ipcRenderer.removeAllListeners(channel)
});
