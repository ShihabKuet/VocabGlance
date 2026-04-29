/**
 * VocabGlance – Preload Script
 * Exposes a safe, narrow API to renderer processes via contextBridge.
 */

import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {

  // ── Words ──────────────────────────────────────────────────────────────────
  getWords:     ()      => ipcRenderer.invoke('get-words'),
  saveWords:    (words) => ipcRenderer.invoke('save-words', words),
  markMastered: (id)    => ipcRenderer.invoke('mark-mastered', id),

  // ── Settings ───────────────────────────────────────────────────────────────
  getSettings:  ()         => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // ── Theme ──────────────────────────────────────────────────────────────────
  /** Returns true if OS is currently in dark mode */
  getSystemTheme: () => ipcRenderer.invoke('get-system-theme'),

  /** Called when the OS switches dark/light mode */
  onSystemThemeChanged: (cb) => {
    ipcRenderer.on('system-theme-changed', (_e, isDark) => cb(isDark))
  },

  // ── Popup control ──────────────────────────────────────────────────────────
  previewPopup: ()       => ipcRenderer.invoke('preview-popup'),
  closePopup:   ()       => ipcRenderer.invoke('close-popup'),
  resizePopup:  (height) => ipcRenderer.invoke('resize-popup', height),

  // ── Window controls ────────────────────────────────────────────────────────
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow:    () => ipcRenderer.send('window-close'),

  // ── Main → Renderer events ─────────────────────────────────────────────────
  onShowWord:       (cb) => ipcRenderer.on('show-word',        (_e, p) => cb(p)),
  onWordsUpdated:   (cb) => ipcRenderer.on('words-updated',    (_e, w) => cb(w)),
  onSettingsChanged:(cb) => ipcRenderer.on('settings-changed', (_e, s) => cb(s)),

  removeListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})
