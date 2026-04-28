# VocabGlance — Architecture & IPC Reference

## Process Model

Electron runs two OS processes:

```
┌─────────────────────────────────────────────────────────────────┐
│  MAIN PROCESS  (Node.js)                                        │
│  src/main/index.js                                              │
│                                                                 │
│  • electron-store  (persistent JSON data)                       │
│  • Tray icon + context menu                                     │
│  • Word scheduler (setInterval)                                 │
│  • BrowserWindow factory (dashboard + popup)                    │
│  • All ipcMain.handle() handlers                                │
└────────────────────┬────────────────────────────────────────────┘
                     │  IPC (contextBridge / ipcRenderer)
          ┌──────────┴──────────┐
          ▼                     ▼
┌──────────────────┐  ┌──────────────────────────┐
│  DASHBOARD       │  │  POPUP WINDOW            │
│  RENDERER        │  │  RENDERER                │
│                  │  │                          │
│  App.jsx         │  │  PopupCard.jsx           │
│  BucketTab.jsx   │  │                          │
│  SettingsTab.jsx │  │  Transparent window,     │
│  TitleBar.jsx    │  │  alwaysOnTop,            │
│                  │  │  focusable: false        │
└──────────────────┘  └──────────────────────────┘
```

---

## IPC Channel Reference

### Renderer → Main (invoke/handle)

| Channel | Direction | Payload | Returns |
|---|---|---|---|
| `get-words` | R→M | — | `Word[]` |
| `save-words` | R→M | `Word[]` | `true` |
| `get-settings` | R→M | — | `Settings` |
| `save-settings` | R→M | `Settings` | `true` |
| `preview-popup` | R→M | — | `true` |
| `mark-mastered` | R→M | `wordId: number` | `true` |
| `close-popup` | R→M | — | `true` |
| `resize-popup` | R→M | `height: number` | `true` |

### Renderer → Main (send, fire-and-forget)

| Channel | Payload |
|---|---|
| `window-minimize` | — |
| `window-maximize` | — |
| `window-close` | — |

### Main → Renderer (webContents.send)

| Channel | Target | Payload |
|---|---|---|
| `show-word` | Popup | `{ word, duration, position, queueLength }` |
| `words-updated` | Dashboard | `Word[]` |
| `settings-changed` | Dashboard | `Settings` |

---

## Data Schemas

```typescript
interface Word {
  id: number           // Date.now() at creation
  word: string         // The vocabulary word
  definition: string   // Short definition or example sentence
  source: string       // e.g. "Daily Star Apr 28"
  date: string         // e.g. "Apr 28"
  mastered: boolean    // true = appears 5× less in popups
  seen: number         // count of popup appearances
}

interface Settings {
  intervalMs: number        // Popup interval in ms (default: 300000)
  position: 'bottom-right' | 'bottom-left'
  enabled: boolean          // Paused or active
  startWithWindows: boolean // Login item
  popupDurationMs: number   // Auto-dismiss time (default: 8000)
}
```

---

## Shuffle Queue Algorithm

```
buildQueue(words):
  active   = words where mastered = false
  mastered = words where mastered = true
  mSlots   = round(mastered.length × 0.20)   // 20% weight
  queue    = shuffle([...active, ...mastered.slice(0, mSlots)])
  return queue

triggerPopup():
  if queue is empty → buildQueue()
  word = queue.shift()
  word.seen += 1
  open popup window → send 'show-word'
```

This guarantees:
- Every unmastered word appears once before any repeats
- Mastered words appear occasionally as reinforcement
- True randomness within each cycle
