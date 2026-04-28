/**
 * VocabGlance – Main Process
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *  • Create & manage the dashboard (BrowserWindow) and popup (BrowserWindow)
 *  • System tray icon with context menu
 *  • Word scheduler – fires popup at user-defined intervals
 *  • IPC handlers for all renderer ↔ main communication
 *  • Persistent storage via electron-store
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  screen,
  shell
} from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import Store from 'electron-store'

// ─── Persistent Store Schema ──────────────────────────────────────────────────
const store = new Store({
  name: 'vocabglance-data',
  defaults: {
    words: [
      { id: 1,  word: 'Ephemeral',   definition: 'Lasting for a very short time; quickly fading.', source: 'Daily Star', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 2,  word: 'Eloquent',    definition: 'Fluent and powerfully persuasive in speech or writing.', source: 'Daily Star', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 3,  word: 'Ubiquitous',  definition: 'Present, appearing, or found everywhere simultaneously.', source: '', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 4,  word: 'Serendipity', definition: 'The faculty of making fortunate discoveries by accident.', source: 'Daily Star', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 5,  word: 'Perfidious',  definition: 'Deceitful and untrustworthy; guilty of betrayal.', source: 'Daily Star', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 6,  word: 'Laconic',     definition: 'Using very few words; brief and concise in speech.', source: '', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 7,  word: 'Pernicious',  definition: 'Having a harmful effect in a gradual or subtle way.', source: 'Daily Star', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 8,  word: 'Melancholy',  definition: 'A deep, reflective sadness — pensive and lingering.', source: '', date: 'Apr 27', mastered: false, seen: 0 }
    ],
    settings: {
      intervalMs: 300000,   // 5 minutes default
      position: 'bottom-right', // 'bottom-right' | 'bottom-left'
      enabled: true,
      startWithWindows: false,
      popupDurationMs: 8000
    }
  }
})

// ─── State ────────────────────────────────────────────────────────────────────
let dashboardWin = null
let popupWin     = null
let tray         = null
let scheduleTimer = null
let shuffleQueue  = []

// ─── Shuffle utility ─────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Build a weighted shuffle queue.
 * Mastered words appear with ~20% frequency compared to learning words.
 */
function buildQueue() {
  const words    = store.get('words')
  const active   = words.filter(w => !w.mastered)
  const mastered = words.filter(w => w.mastered)
  const mSlots   = Math.max(0, Math.round(mastered.length * 0.2))
  shuffleQueue   = shuffleArray([...active, ...shuffleArray(mastered).slice(0, mSlots)])
}

// ─── Popup Window ─────────────────────────────────────────────────────────────
function createPopupWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const settings = store.get('settings')
  const W = 360, H = 180          // initial size, grows with content

  const x = settings.position === 'bottom-left'
    ? 24
    : width - W - 24
  const y = height                 // start off-screen below (slide-up animation)

  popupWin = new BrowserWindow({
    x, y,
    width: W,
    height: H,
    minWidth: W,
    minHeight: H,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,              // never steals keyboard focus
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  // Keep on top of everything (works on Windows 10/11)
  popupWin.setAlwaysOnTop(true, 'screen-saver')
  popupWin.setVisibleOnAllWorkspaces(true)

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    popupWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/popup.html`)
  } else {
    popupWin.loadFile(join(__dirname, '../renderer/popup.html'))
  }

  popupWin.on('closed', () => { popupWin = null })
}

// ─── Dashboard Window ─────────────────────────────────────────────────────────
function createDashboardWindow() {
  if (dashboardWin) { dashboardWin.focus(); return }

  dashboardWin = new BrowserWindow({
    width: 920,
    height: 680,
    minWidth: 700,
    minHeight: 520,
    title: 'VocabGlance',
    frame: false,                  // custom title bar
    transparent: false,
    backgroundColor: '#0D0F14',
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  dashboardWin.once('ready-to-show', () => {
    dashboardWin.show()
    if (is.dev) dashboardWin.webContents.openDevTools()
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    dashboardWin.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    dashboardWin.loadFile(join(__dirname, '../renderer/index.html'))
  }

  dashboardWin.on('closed', () => { dashboardWin = null })

  // Handle external links
  dashboardWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ─── Tray Icon ────────────────────────────────────────────────────────────────
function createTray() {
  // Fallback to a 16x16 native image if icon file not present
  let icon
  try {
    icon = nativeImage.createFromPath(join(__dirname, '../../resources/tray.png'))
    if (icon.isEmpty()) throw new Error('empty')
  } catch {
    // Create a simple 16x16 placeholder tray icon programmatically
    icon = nativeImage.createEmpty()
  }

  tray = new Tray(icon)
  tray.setToolTip('VocabGlance – Running')
  buildTrayMenu()

  tray.on('double-click', () => createDashboardWindow())
}

function buildTrayMenu() {
  const settings = store.get('settings')
  const menu = Menu.buildFromTemplate([
    {
      label: 'VocabGlance',
      enabled: false
    },
    { type: 'separator' },
    {
      label: settings.enabled ? '⏸  Pause Reminders' : '▶  Resume Reminders',
      click: () => {
        const s = store.get('settings')
        s.enabled = !s.enabled
        store.set('settings', s)
        s.enabled ? startScheduler() : stopScheduler()
        buildTrayMenu()
        // Notify dashboard if open
        dashboardWin?.webContents.send('settings-changed', store.get('settings'))
      }
    },
    {
      label: '👁  Preview Word Now',
      click: () => triggerPopup()
    },
    { type: 'separator' },
    {
      label: '📚  Open Dashboard',
      click: () => createDashboardWindow()
    },
    { type: 'separator' },
    {
      label: 'Quit VocabGlance',
      click: () => { app.isQuiting = true; app.quit() }
    }
  ])
  tray.setContextMenu(menu)
}

// ─── Scheduler ────────────────────────────────────────────────────────────────
function startScheduler() {
  stopScheduler()
  const settings = store.get('settings')
  if (!settings.enabled) return

  scheduleTimer = setInterval(() => {
    triggerPopup()
  }, settings.intervalMs)
}

function stopScheduler() {
  if (scheduleTimer) { clearInterval(scheduleTimer); scheduleTimer = null }
}

/**
 * triggerPopup – pick next word from queue, show the popup window,
 * send the word data via IPC, then auto-close after duration.
 */
function triggerPopup() {
  const words = store.get('words')
  if (words.length === 0) return

  // Rebuild queue when exhausted
  if (shuffleQueue.length === 0) buildQueue()
  const word = shuffleQueue.shift()
  if (!word) return

  // Update seen count in store
  const updated = words.map(w =>
    w.id === word.id ? { ...w, seen: (w.seen || 0) + 1 } : w
  )
  store.set('words', updated)

  // Create popup window if not already open
  if (!popupWin || popupWin.isDestroyed()) {
    createPopupWindow()
    // Wait for window to load then send word
    popupWin.webContents.once('did-finish-load', () => {
      sendWordToPopup(word)
    })
  } else {
    sendWordToPopup(word)
  }

  // Notify dashboard to refresh word list (seen count updated)
  dashboardWin?.webContents.send('words-updated', store.get('words'))
}

function sendWordToPopup(word) {
  if (!popupWin || popupWin.isDestroyed()) return
  const settings = store.get('settings')
  popupWin.webContents.send('show-word', {
    word,
    duration: settings.popupDurationMs,
    position: settings.position,
    queueLength: shuffleQueue.length
  })
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

/** Dashboard: get all words */
ipcMain.handle('get-words', () => store.get('words'))

/** Dashboard: save full words array */
ipcMain.handle('save-words', (_e, words) => {
  store.set('words', words)
  shuffleQueue = []               // reset queue on any change
  return true
})

/** Dashboard: get settings */
ipcMain.handle('get-settings', () => store.get('settings'))

/** Dashboard: save settings */
ipcMain.handle('save-settings', (_e, settings) => {
  store.set('settings', settings)
  app.setLoginItemSettings({ openAtLogin: settings.startWithWindows })
  // Restart scheduler with new interval
  if (settings.enabled) startScheduler()
  else stopScheduler()
  buildTrayMenu()
  return true
})

/** Dashboard: trigger a preview popup immediately */
ipcMain.handle('preview-popup', () => { triggerPopup(); return true })

/** Popup: user clicked "Got it" – mark word as mastered */
ipcMain.handle('mark-mastered', (_e, wordId) => {
  const words = store.get('words').map(w =>
    w.id === wordId ? { ...w, mastered: true } : w
  )
  store.set('words', words)
  shuffleQueue = []
  dashboardWin?.webContents.send('words-updated', words)
  return true
})

/** Popup: user dismissed – close popup window */
ipcMain.handle('close-popup', () => {
  if (popupWin && !popupWin.isDestroyed()) popupWin.close()
  return true
})

/** Popup: resize window to fit content */
ipcMain.handle('resize-popup', (_e, height) => {
  if (popupWin && !popupWin.isDestroyed()) {
    popupWin.setSize(360, Math.min(Math.max(height, 140), 320))
    // Re-position after resize so it stays in corner
    const { width, height: screenH } = screen.getPrimaryDisplay().workAreaSize
    const settings = store.get('settings')
    const [w] = popupWin.getSize()
    const x = settings.position === 'bottom-left' ? 24 : width - w - 24
    const y = screenH - popupWin.getSize()[1] - 24
    popupWin.setPosition(x, y)
  }
  return true
})

/** Dashboard: window controls (custom title bar) */
ipcMain.on('window-minimize',  () => dashboardWin?.minimize())
ipcMain.on('window-maximize',  () => dashboardWin?.isMaximized() ? dashboardWin.unmaximize() : dashboardWin.maximize())
ipcMain.on('window-close',     () => dashboardWin?.close())

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  buildQueue()
  createTray()

  // Show dashboard on first launch
  createDashboardWindow()

  // Start word scheduler after a short delay
  setTimeout(() => {
    startScheduler()
    // First popup after 10 seconds so the user sees it on first run
    setTimeout(() => triggerPopup(), 10000)
  }, 3000)
})

// Prevent quitting when dashboard is closed — stay in tray
app.on('window-all-closed', (e) => {
  if (!app.isQuiting) e.preventDefault()
})

app.on('before-quit', () => {
  app.isQuiting = true
  stopScheduler()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createDashboardWindow()
})
