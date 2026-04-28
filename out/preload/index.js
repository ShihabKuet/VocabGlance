"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  // ── Words ──────────────────────────────────────────────────────────────────
  /** Fetch all words from persistent store */
  getWords: () => electron.ipcRenderer.invoke("get-words"),
  /** Persist full words array */
  saveWords: (words) => electron.ipcRenderer.invoke("save-words", words),
  /** Mark a word as mastered by ID */
  markMastered: (wordId) => electron.ipcRenderer.invoke("mark-mastered", wordId),
  // ── Settings ───────────────────────────────────────────────────────────────
  /** Fetch current settings object */
  getSettings: () => electron.ipcRenderer.invoke("get-settings"),
  /** Persist settings object */
  saveSettings: (settings) => electron.ipcRenderer.invoke("save-settings", settings),
  // ── Popup control ──────────────────────────────────────────────────────────
  /** Trigger an immediate preview popup */
  previewPopup: () => electron.ipcRenderer.invoke("preview-popup"),
  /** Tell main to close the popup window */
  closePopup: () => electron.ipcRenderer.invoke("close-popup"),
  /** Tell main to resize popup window to fit content height */
  resizePopup: (height) => electron.ipcRenderer.invoke("resize-popup", height),
  // ── Window controls (dashboard custom title bar) ───────────────────────────
  minimizeWindow: () => electron.ipcRenderer.send("window-minimize"),
  maximizeWindow: () => electron.ipcRenderer.send("window-maximize"),
  closeWindow: () => electron.ipcRenderer.send("window-close"),
  // ── Event listeners (main → renderer) ─────────────────────────────────────
  /**
   * Called when main pushes a word to the popup window.
   * @param {(payload: {word, duration, position, queueLength}) => void} cb
   */
  onShowWord: (cb) => {
    electron.ipcRenderer.on("show-word", (_e, payload) => cb(payload));
  },
  /**
   * Called when main notifies dashboard that words were updated externally
   * (e.g. seen count changed after a popup).
   * @param {(words: Word[]) => void} cb
   */
  onWordsUpdated: (cb) => {
    electron.ipcRenderer.on("words-updated", (_e, words) => cb(words));
  },
  /**
   * Called when settings changed from tray menu.
   * @param {(settings: Settings) => void} cb
   */
  onSettingsChanged: (cb) => {
    electron.ipcRenderer.on("settings-changed", (_e, settings) => cb(settings));
  },
  /** Remove all listeners for a channel (cleanup on unmount) */
  removeListeners: (channel) => {
    electron.ipcRenderer.removeAllListeners(channel);
  }
});
