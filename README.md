# VocabGlance 📚

> A desktop vocabulary reminder that periodically pops words onto your screen — no matter what app you're using.

![Platform](https://img.shields.io/badge/Platform-Windows%2010%2B-blue)
![Built With](https://img.shields.io/badge/Built%20With-Electron%20%2B%20React-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

---

## What It Does

VocabGlance runs silently in your system tray. At a configurable interval, a beautiful floating word card **slides up from the corner of your screen** — on top of Chrome, VS Code, SecureCRT, or anything else you're using. You glance at the word and definition, tap "Got it" or "Still learning", and it vanishes. Over days and weeks, words stick.

Inspired by daily reading of The Daily Star editorial page.

---

## Features

| Feature | Description |
|---|---|
| 🔔 System-level popups | Floats above ALL windows using Electron `alwaysOnTop: 'screen-saver'` |
| 🔀 Smart shuffle queue | All words cycle once before repeating; mastered words appear 5× less |
| ✓ Mastered toggle | Mark words you know; they fade in the bucket and appear rarely |
| 👁 Seen counter | Tracks how many times each word has been shown |
| ✎ Inline edit | Edit definition / source without leaving the app |
| 📋 Bulk import | Paste a block of `word: definition` lines |
| 💾 JSON backup | Export & import your full bucket for cross-device sync |
| 🕐 Flexible intervals | 30 sec → 1 hour |
| 📍 Corner choice | Bottom-right or bottom-left |
| 🔇 Pause/Resume | From tray right-click menu or Settings |
| 🚀 Start with Windows | Optional login item |
| 🌐 Offline-first | No internet required after install |

---

## Tech Stack

```
VocabGlance/
├── Electron 29          — Desktop shell, window management, tray
├── React 18             — UI for both dashboard and popup windows
├── electron-vite 2      — Fast dev server + build tool
├── electron-store 8     — Persistent JSON storage (no database needed)
└── electron-builder 24  — Windows NSIS installer packaging
```

---

## Project Structure

```
VocabGlance/
├── src/
│   ├── main/
│   │   └── index.js          ← Main process: windows, tray, IPC, scheduler
│   ├── preload/
│   │   └── index.js          ← contextBridge API (safe IPC bridge)
│   └── renderer/
│       ├── index.html         ← Dashboard window entry
│       ├── popup.html         ← Popup window entry (separate)
│       └── src/
│           ├── main.jsx       ← Dashboard React root
│           ├── popup.jsx      ← Popup React root
│           ├── components/
│           │   ├── App.jsx          ← Dashboard shell + nav
│           │   ├── TitleBar.jsx     ← Custom draggable title bar
│           │   ├── BucketTab.jsx    ← Word management UI
│           │   ├── SettingsTab.jsx  ← Settings UI
│           │   └── PopupCard.jsx    ← Floating word popup UI
│           └── styles/
│               ├── global.css       ← Animations, resets, utility classes
│               └── tokens.js        ← Design tokens (colors, fonts, spacing)
├── resources/
│   ├── icon.ico          ← Windows app icon (replace with your own)
│   ├── icon.icns         ← macOS icon
│   └── tray.png          ← 16×16 system tray icon
├── docs/
│   └── architecture.md   ← IPC flow diagrams
├── electron.vite.config.js
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm 9+

### Development

```bash
# Install dependencies
npm install

# Run in development mode (hot-reload)
npm run dev
```

### Build Windows Installer

```bash
# Build distributable NSIS installer
npm run dist:win
# Output: release/VocabGlance Setup x.x.x.exe
```

---

## Adding Your Own Icons

Place these files in the `resources/` folder before building:

| File | Size | Usage |
|---|---|---|
| `icon.ico` | 256×256 | Windows app icon |
| `tray.png` | 16×16 | System tray icon |
| `icon.icns` | 512×512 | macOS (future) |

Free icon generators: [icoconvert.com](https://icoconvert.com), [favicon.io](https://favicon.io)

---

## How the Popup Works (Architecture)

```
Main Process (scheduler timer)
        │
        ▼
  triggerPopup()
  ├── picks next word from shuffleQueue
  ├── increments word.seen in electron-store
  ├── creates BrowserWindow (transparent, alwaysOnTop)
  └── sends IPC → 'show-word' → PopupCard renderer
                                      │
                              User clicks "Got it"
                                      │
                              IPC → 'mark-mastered'
                                      │
                              Main updates store
                                      │
                              IPC → 'words-updated'
                                      │
                              Dashboard refreshes list
```

---

## Keyboard Shortcuts (Dashboard)

| Shortcut | Action |
|---|---|
| `Enter` (in add form) | Add word |
| `Enter` (in edit mode) | Save edit |
| `Escape` | Cancel edit |

---

## Roadmap

- [ ] Mobile companion app (React Native) sharing the same JSON format
- [ ] Word of the Day from dictionary API
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Quiz mode in the dashboard
- [ ] Dark/light theme toggle
- [ ] Custom popup themes

---

## License

MIT © 2025 — Free to use, modify, and include in your portfolio.
