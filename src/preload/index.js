/**
 * VocabGlance – Preload Script
 * ─────────────────────────────────────────────────────────────────────────────
 * Exposes a safe, narrow API to renderer processes via contextBridge.
 * Never exposes raw Node/Electron APIs — only explicit typed methods.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { contextBridge, ipcRenderer } from 'electron'

/**
 * The `window.api` object available in all renderer windows.
 */
contextBridge.exposeInMainWorld('api', {

  // ── Words ──────────────────────────────────────────────────────────────────

  /** Fetch all words from persistent store */
  getWords: () => ipcRenderer.invoke('get-words'),

  /** Persist full words array */
  saveWords: (words) => ipcRenderer.invoke('save-words', words),

  /** Mark a word as mastered by ID */
  markMastered: (wordId) => ipcRenderer.invoke('mark-mastered', wordId),

  // ── Settings ───────────────────────────────────────────────────────────────

  /** Fetch current settings object */
  getSettings: () => ipcRenderer.invoke('get-settings'),

  /** Persist settings object */
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // ── Popup control ──────────────────────────────────────────────────────────

  /** Trigger an immediate preview popup */
  previewPopup: () => ipcRenderer.invoke('preview-popup'),

  /** Tell main to close the popup window */
  closePopup: () => ipcRenderer.invoke('close-popup'),

  /** Tell main to resize popup window to fit content height */
  resizePopup: (height) => ipcRenderer.invoke('resize-popup', height),

  // ── Window controls (dashboard custom title bar) ───────────────────────────

  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow:    () => ipcRenderer.send('window-close'),

  // ── Event listeners (main → renderer) ─────────────────────────────────────

  /**
   * Called when main pushes a word to the popup window.
   * @param {(payload: {word, duration, position, queueLength}) => void} cb
   */
  onShowWord: (cb) => {
    ipcRenderer.on('show-word', (_e, payload) => cb(payload))
  },

  /**
   * Called when main notifies dashboard that words were updated externally
   * (e.g. seen count changed after a popup).
   * @param {(words: Word[]) => void} cb
   */
  onWordsUpdated: (cb) => {
    ipcRenderer.on('words-updated', (_e, words) => cb(words))
  },

  /**
   * Called when settings changed from tray menu.
   * @param {(settings: Settings) => void} cb
   */
  onSettingsChanged: (cb) => {
    ipcRenderer.on('settings-changed', (_e, settings) => cb(settings))
  },

  /** Remove all listeners for a channel (cleanup on unmount) */
  removeListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel)
  }
})
