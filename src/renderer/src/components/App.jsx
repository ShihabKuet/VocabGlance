/**
 * App — Dashboard shell.
 * Renders the custom title bar and routes between the Bucket and Settings tabs.
 */

import { useState, useEffect } from 'react'
import TitleBar    from './TitleBar'
import BucketTab   from './BucketTab'
import SettingsTab from './SettingsTab'
import { colors, fonts } from '../styles/tokens'

const { bg, surface, border, gold, textPrimary, textMuted } = colors

export default function App() {
  const [tab,      setTab]      = useState('bucket')
  const [wordCount,setWordCount]= useState(0)
  const [enabled,  setEnabled]  = useState(true)
  const [notif,    setNotif]    = useState('')

  /* ── Sync enabled state from tray ── */
  useEffect(() => {
    window.api.getSettings().then(s => setEnabled(s.enabled))
    window.api.onSettingsChanged(s => setEnabled(s.enabled))
    return () => window.api.removeListeners('settings-changed')
  }, [])

  /* ── Toast helper ── */
  function toast(msg) {
    setNotif(msg)
    setTimeout(() => setNotif(''), 2600)
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      background: bg, color: textPrimary,
      fontFamily: fonts.sans, overflow: 'hidden',
    }}>

      {/* Custom OS-style title bar (draggable) */}
      <TitleBar />

      {/* ── Header / Nav ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 52,
        borderBottom: `1px solid ${border}`,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark />
          <span style={{ fontFamily: fonts.serif, fontSize: 18, fontWeight: 700, letterSpacing: '-0.2px' }}>
            VocabGlance
          </span>
          <span style={{
            fontSize: 10, color: textMuted,
            background: colors.surface2, border: `1px solid ${border}`,
            borderRadius: 5, padding: '1px 7px',
          }}>v1.0</span>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {[['bucket', 'Word Bucket'], ['settings', 'Settings']].map(([v, l]) => (
            <button key={v} className="tab-pill" onClick={() => setTab(v)} style={{
              padding: '5px 13px', borderRadius: 7, fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              background: tab === v ? colors.surface2 : 'transparent',
              color:      tab === v ? textPrimary : textMuted,
              border:     tab === v ? `1px solid ${border}` : '1px solid transparent',
            }}>{l}</button>
          ))}
        </nav>

        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: enabled ? gold : textMuted,
            display: 'block',
            animation: enabled ? 'pulse 2.4s ease infinite' : 'none',
          }} />
          <span style={{ fontSize: 11.5, color: textMuted }}>
            {wordCount} words · {enabled ? 'Active' : 'Paused'}
          </span>
        </div>
      </header>

      {/* ── Toast ── */}
      {notif && (
        <div style={{
          position: 'fixed', top: 18, left: '50%',
          animation: 'notifIn .24s ease forwards',
          background: colors.surface2, border: `1px solid ${border}`,
          borderRadius: 9, padding: '8px 18px',
          fontSize: 12.5, color: textPrimary, zIndex: 999,
          boxShadow: '0 8px 28px rgba(0,0,0,.55)', whiteSpace: 'nowrap',
        }}>{notif}</div>
      )}

      {/* ── Tab content (scrollable) ── */}
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
    }}>V</div>
  )
}
