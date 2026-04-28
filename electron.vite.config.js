import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  // ── Main process ──────────────────────────────────────────────
  // electron-vite auto-discovers src/main/index.js
  main: {
    plugins: [externalizeDepsPlugin()]
  },

  // ── Preload scripts ───────────────────────────────────────────
  // electron-vite auto-discovers src/preload/index.js
  preload: {
    plugins: [externalizeDepsPlugin()]
  },

  // ── Renderer (React UI) ───────────────────────────────────────
  renderer: {
    root: resolve(__dirname, 'src/renderer'),
    build: {
      rollupOptions: {
        input: {
          // Main dashboard window
          index: resolve(__dirname, 'src/renderer/index.html'),
          // Floating popup window (separate HTML entry)
          popup: resolve(__dirname, 'src/renderer/popup.html')
        }
      }
    },
    plugins: [react()]
  }
})
