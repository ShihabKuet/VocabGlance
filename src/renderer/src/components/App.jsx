/**
 * App — Dashboard shell.
 * Wraps everything in ThemeProvider so all children have access to theme tokens.
 */

import { useState, useEffect } from 'react'
import { ThemeProvider, useTheme } from '../context/ThemeContext'
import TitleBar    from './TitleBar'
import BucketTab   from './BucketTab'
import SettingsTab from './SettingsTab'
import { fonts }   from '../styles/tokens'

export default function App() {
  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  )
}

function AppShell() {
  const { colors, isDark } = useTheme()
  const [tab,       setTab]       = useState('bucket')
  const [wordCount, setWordCount] = useState(0)
  const [enabled,   setEnabled]   = useState(true)
  const [notif,     setNotif]     = useState('')
  const [version, setVersion] = useState('')

  useEffect(() => {
    window.api.getSettings().then(s => setEnabled(s.enabled))
    window.api.onSettingsChanged(s => setEnabled(s.enabled))
    window.api.getAppVersion().then(v => setVersion(v))
    return () => window.api.removeListeners('settings-changed')
  }, [])

  function toast(msg) {
    setNotif(msg)
    setTimeout(() => setNotif(''), 2600)
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: colors.bg, color: colors.textPrimary,
      fontFamily: fonts.sans, overflow: 'hidden',
      transition: 'background 0.25s ease, color 0.25s ease',
    }}>

      <TitleBar />

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 52,
        borderBottom: `1px solid ${colors.border}`,
        background: colors.headerBg,
        backdropFilter: 'blur(10px)',
        flexShrink: 0,
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img
            src="/logo.png"
            alt="VocabGlance"
            style={{
              width: 30, height: 30,
              borderRadius: 8,
              objectFit: 'contain',
            }}
          />
          <span style={{ fontFamily: fonts.serif, fontSize: 18, fontWeight: 700, letterSpacing: '-0.2px' }}>
            VocabGlance
          </span>
          <span style={{
            fontSize: 10, color: colors.textMuted,
            background: colors.surface2, border: `1px solid ${colors.border}`,
            borderRadius: 5, padding: '1px 7px',
            transition: 'background 0.25s ease',
          }}>v{version}</span>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {[['bucket', 'Word Bucket'], ['settings', 'Settings']].map(([v, l]) => (
            <button key={v} className="tab-pill" onClick={() => setTab(v)} style={{
              padding: '5px 13px', borderRadius: 7, fontSize: 12.5, fontWeight: 500,
              background: tab === v ? colors.surface2 : 'transparent',
              color:      tab === v ? colors.textPrimary : colors.textMuted,
              border:     tab === v ? `1px solid ${colors.border}` : '1px solid transparent',
              transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </nav>

        {/* Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: enabled ? colors.gold : colors.textMuted,
            display: 'block',
            animation: enabled ? 'pulse 2.4s ease infinite' : 'none',
          }} />
          <span style={{ fontSize: 11.5, color: colors.textMuted }}>
            {wordCount} words · {enabled ? 'Active' : 'Paused'}
          </span>
        </div>
      </header>

      {/* Toast */}
      {notif && (
        <div style={{
          position: 'fixed', top: 18, left: '50%',
          animation: 'notifIn .24s ease forwards',
          background: colors.surface2, border: `1px solid ${colors.border}`,
          borderRadius: 9, padding: '8px 18px',
          fontSize: 12.5, color: colors.textPrimary, zIndex: 999,
          boxShadow: `0 8px 28px rgba(0,0,0,${isDark ? '0.55' : '0.15'})`,
          whiteSpace: 'nowrap',
        }}>{notif}</div>
      )}

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {tab === 'bucket' ? (
          <BucketTab onCountChange={setWordCount} toast={toast} />
        ) : (
          <SettingsTab toast={toast} onEnabledChange={setEnabled} />
        )}
      </div>
    </div>
  )
}

function LogoMark() {
  return (
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: 'linear-gradient(145deg, #C9912A, #7A5A10)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: fonts.serif, fontWeight: 700, fontSize: 15, color: '#0C0A06',
      flexShrink: 0,
    }}>V</div>
  )
}
