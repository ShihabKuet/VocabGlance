/**
 * ThemeContext
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides the active theme palette to every component in the tree.
 *
 * Priority order:
 *  1. User's saved preference in electron-store ('dark' | 'light' | 'system')
 *  2. If 'system' → follow Windows dark/light mode via Electron nativeTheme
 *  3. Default fallback → dark
 *
 * Usage in any component:
 *   const { colors, isDark, themeMode, setThemeMode } = useTheme()
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { darkTheme, lightTheme } from '../styles/tokens'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  // 'dark' | 'light' | 'system'
  const [themeMode,  setThemeModeState] = useState('system')
  // Whether the OS is currently in dark mode
  const [systemDark, setSystemDark]     = useState(true)

  /* ── Load saved preference + system theme on mount ── */
  useEffect(() => {
    window.api.getSettings().then(s => {
      setThemeModeState(s.themeMode || 'system')
    })

    window.api.getSystemTheme().then(isDark => {
      setSystemDark(isDark)
    })

    // Listen for OS theme changes in real time
    window.api.onSystemThemeChanged((isDark) => {
      setSystemDark(isDark)
    })

    return () => window.api.removeListeners('system-theme-changed')
  }, [])

  /* ── Persist theme preference when changed ── */
  const setThemeMode = useCallback(async (mode) => {
    setThemeModeState(mode)
    const settings = await window.api.getSettings()
    await window.api.saveSettings({ ...settings, themeMode: mode })
  }, [])

  /* ── Resolve active theme ── */
  const isDark = themeMode === 'system' ? systemDark : themeMode === 'dark'
  const colors = isDark ? darkTheme : lightTheme

  /* ── Apply bg color to document body so no white flash on edges ── */
  useEffect(() => {
    document.body.style.background = colors.bg
    document.body.style.color      = colors.textPrimary
  }, [colors.bg, colors.textPrimary])

  return (
    <ThemeContext.Provider value={{ colors, isDark, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

/** Hook — use inside any component */
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
