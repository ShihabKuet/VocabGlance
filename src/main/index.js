/**
 * VocabGlance – Main Process
 * ─────────────────────────────────────────────────────────────────────────────
 * Responsibilities:
 *  • Create & manage the dashboard (BrowserWindow) and popup (BrowserWindow)
 *  • System tray icon with context menu
 *  • Word scheduler – fires popup at user-defined intervals
 *  • IPC handlers for all renderer ↔ main communication
 *  • Persistent storage via electron-store
 *  • System theme detection via nativeTheme
 * ─────────────────────────────────────────────────────────────────────────────
 */

import {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  Menu,
  nativeImage,
  nativeTheme,
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
      { id: 1, word: 'Ephemeral',   definition: 'Lasting for a very short time; quickly fading.',          pronunciation: 'ih-FEM-er-ul',   synonyms: 'transient, fleeting, momentary',  date: 'Apr 27', mastered: false, seen: 0 },
      { id: 2, word: 'Eloquent',    definition: 'Fluent and powerfully persuasive in speech or writing.',   pronunciation: 'EL-oh-kwent',    synonyms: 'articulate, expressive, fluent',  date: 'Apr 27', mastered: false, seen: 0 },
      { id: 3, word: 'Ubiquitous',  definition: 'Present, appearing, or found everywhere simultaneously.',  pronunciation: 'yoo-BIK-wih-tus', synonyms: 'omnipresent, pervasive, universal', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 4, word: 'Serendipity', definition: 'The faculty of making fortunate discoveries by accident.', pronunciation: 'ser-en-DIP-ih-tee', synonyms: 'chance, luck, fortuity',          date: 'Apr 27', mastered: false, seen: 0 },
      { id: 5, word: 'Perfidious',  definition: 'Deceitful and untrustworthy; guilty of betrayal.',         pronunciation: 'per-FID-ee-us',  synonyms: 'treacherous, disloyal, deceitful', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 6, word: 'Laconic',     definition: 'Using very few words; brief and concise in speech.',       pronunciation: 'luh-KON-ik',     synonyms: 'terse, succinct, brief',          date: 'Apr 27', mastered: false, seen: 0 },
      { id: 7, word: 'Pernicious',  definition: 'Having a harmful effect in a gradual or subtle way.',      pronunciation: 'per-NISH-us',    synonyms: 'harmful, destructive, detrimental', date: 'Apr 27', mastered: false, seen: 0 },
      { id: 8, word: 'Melancholy',  definition: 'A deep, reflective sadness — pensive and lingering.',      pronunciation: 'MEL-un-kol-ee',  synonyms: 'sadness, gloom, despondency',     date: 'Apr 27', mastered: false, seen: 0 }
    ],
    settings: {
      intervalMs:      300000,        // 5 minutes default
      position:        'bottom-right',// 'bottom-right' | 'bottom-left'
      enabled:         true,
      startWithWindows:false,
      popupDurationMs: 8000,
      themeMode:       'system',      // 'dark' | 'light' | 'system'
      shuffleMode:     'random',      // 'random' | 'order' | 'reverse'
    }
  }
})

// ─── State ────────────────────────────────────────────────────────────────────
let dashboardWin  = null
let popupWin      = null
let tray          = null
let scheduleTimer = null
let shuffleQueue  = []

// ─── Shuffle utility ──────────────────────────────────────────────────────────
function shuffleArray(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildQueue() {
  const words       = store.get('words')
  const settings    = store.get('settings')
  const mode        = settings.shuffleMode || 'random'
  const active      = words.filter(w => !w.mastered)
  const mastered    = words.filter(w => w.mastered)
  const mSlots      = Math.max(0, Math.round(mastered.length * 0.2))
  const masteredSet = shuffleArray(mastered).slice(0, mSlots)

  if (mode === 'order') {
    // Insertion order — oldest first (array is stored newest-first, so reverse)
    shuffleQueue = [...[...active].reverse(), ...masteredSet]
  } else if (mode === 'reverse') {
    // Reverse order — newest first (natural array order)
    shuffleQueue = [...active, ...masteredSet]
  } else {
    // Random — default shuffle behavior
    shuffleQueue = shuffleArray([...active, ...masteredSet])
  }
}

// ─── Popup Window ─────────────────────────────────────────────────────────────
function createPopupWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  const settings = store.get('settings')
  const W = 360, H = 180

  const x = settings.position === 'bottom-left' ? 24 : width - W - 24
  const y = height  // start off-screen below

  popupWin = new BrowserWindow({
    x, y,
    width: W, height: H,
    minWidth: W, minHeight: H,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    hasShadow: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

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
    width: 920, height: 680,
    minWidth: 700, minHeight: 520,
    title: 'VocabGlance',
    frame: false,
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

  dashboardWin.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ─── Tray Icon ────────────────────────────────────────────────────────────────
function createTray() {
  let icon
  try {
    const iconPath = app.isPackaged
      ? join(process.resourcesPath, 'tray.png')
      : join(__dirname, '../../resources/tray.png')
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) throw new Error('empty')
  } catch {
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
    { label: 'VocabGlance', enabled: false },
    { type: 'separator' },
    {
      label: settings.enabled ? '⏸  Pause Reminders' : '▶  Resume Reminders',
      click: () => {
        const s = store.get('settings')
        s.enabled = !s.enabled
        store.set('settings', s)
        s.enabled ? startScheduler() : stopScheduler()
        buildTrayMenu()
        dashboardWin?.webContents.send('settings-changed', store.get('settings'))
      }
    },
    { label: '👁  Preview Word Now', click: () => triggerPopup() },
    { type: 'separator' },
    { label: '📚  Open Dashboard',   click: () => createDashboardWindow() },
    { type: 'separator' },
    { label: 'Quit VocabGlance', click: () => { app.isQuiting = true; app.quit() } }
  ])
  tray.setContextMenu(menu)
}

// ─── Scheduler ────────────────────────────────────────────────────────────────
function startScheduler() {
  stopScheduler()
  const settings = store.get('settings')
  if (!settings.enabled) return
  scheduleTimer = setInterval(() => triggerPopup(), settings.intervalMs)
}

function stopScheduler() {
  if (scheduleTimer) { clearInterval(scheduleTimer); scheduleTimer = null }
}

function triggerPopup() {
  const words = store.get('words')
  if (words.length === 0) return

  if (shuffleQueue.length === 0) buildQueue()
  const word = shuffleQueue.shift()
  if (!word) return

  const updated = words.map(w =>
    w.id === word.id ? { ...w, seen: (w.seen || 0) + 1 } : w
  )
  store.set('words', updated)

  if (!popupWin || popupWin.isDestroyed()) {
    createPopupWindow()
    popupWin.webContents.once('did-finish-load', () => sendWordToPopup(word))
  } else {
    sendWordToPopup(word)
  }

  dashboardWin?.webContents.send('words-updated', store.get('words'))
}

function sendWordToPopup(word) {
  if (!popupWin || popupWin.isDestroyed()) return
  const settings = store.get('settings')

  // Resolve the active theme to send to popup
  const themeMode = settings.themeMode || 'system'
  const isDark = themeMode === 'system'
    ? nativeTheme.shouldUseDarkColors
    : themeMode === 'dark'

  popupWin.webContents.send('show-word', {
    word,
    duration:    settings.popupDurationMs,
    position:    settings.position,
    queueLength: shuffleQueue.length,
    isDark,
  })
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

ipcMain.handle('get-words',    () => store.get('words'))
ipcMain.handle('save-words',   (_e, words) => { store.set('words', words); shuffleQueue = []; return true })
ipcMain.handle('get-settings', () => store.get('settings'))

ipcMain.handle('save-settings', (_e, settings) => {
  store.set('settings', settings)
  app.setLoginItemSettings({ openAtLogin: settings.startWithWindows })
  if (settings.enabled) startScheduler()
  else stopScheduler()
  buildTrayMenu()
  // Rebuild queue so new order takes effect immediately
  shuffleQueue = []
  return true
})

ipcMain.handle('preview-popup', () => { triggerPopup(); return true })

ipcMain.handle('mark-mastered', (_e, wordId) => {
  const words = store.get('words').map(w =>
    w.id === wordId ? { ...w, mastered: true } : w
  )
  store.set('words', words)
  shuffleQueue = []
  dashboardWin?.webContents.send('words-updated', words)
  return true
})

ipcMain.handle('close-popup', () => {
  if (popupWin && !popupWin.isDestroyed()) popupWin.close()
  return true
})

ipcMain.handle('resize-popup', (_e, height) => {
  if (popupWin && !popupWin.isDestroyed()) {
    popupWin.setSize(360, Math.min(Math.max(height, 140), 320))
    const { width, height: screenH } = screen.getPrimaryDisplay().workAreaSize
    const settings = store.get('settings')
    const [w] = popupWin.getSize()
    const x = settings.position === 'bottom-left' ? 24 : width - w - 24
    const y = screenH - popupWin.getSize()[1] - 24
    popupWin.setPosition(x, y)
  }
  return true
})

/** Get current OS dark mode state */
ipcMain.handle('get-system-theme', () => nativeTheme.shouldUseDarkColors)

ipcMain.on('window-minimize', () => dashboardWin?.minimize())
ipcMain.on('window-maximize', () => dashboardWin?.isMaximized() ? dashboardWin.unmaximize() : dashboardWin.maximize())
ipcMain.on('window-close',    () => dashboardWin?.close())

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  buildQueue()
  createTray()
  createDashboardWindow()

  // Broadcast OS theme changes to dashboard renderer in real time
  nativeTheme.on('updated', () => {
    dashboardWin?.webContents.send('system-theme-changed', nativeTheme.shouldUseDarkColors)
  })

  setTimeout(() => {
    startScheduler()
    setTimeout(() => triggerPopup(), 10000)
  }, 3000)
})

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
