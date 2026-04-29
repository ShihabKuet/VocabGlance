/**
 * SettingsTab — Settings panel. Includes theme mode selector.
 */

import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { fonts, radii } from '../styles/tokens'

const INTERVALS = [
  { label: '30 sec', value: 30000   },
  { label: '1 min',  value: 60000   },
  { label: '5 min',  value: 300000  },
  { label: '15 min', value: 900000  },
  { label: '30 min', value: 1800000 },
  { label: '1 hour', value: 3600000 },
]

const DURATIONS = [
  { label: '5 sec',  value: 5000  },
  { label: '8 sec',  value: 8000  },
  { label: '12 sec', value: 12000 },
  { label: '20 sec', value: 20000 },
]

export default function SettingsTab({ toast, onEnabledChange }) {
  const { colors, isDark, themeMode, setThemeMode } = useTheme()
  const [settings, setSettings] = useState(null)
  const [words,    setWords]    = useState([])

  useEffect(() => {
    Promise.all([window.api.getSettings(), window.api.getWords()])
      .then(([s, w]) => { setSettings(s); setWords(w) })
  }, [])

  async function save(patch) {
    const updated = { ...settings, ...patch }
    setSettings(updated)
    onEnabledChange(updated.enabled)
    await window.api.saveSettings(updated)
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `vocabglance-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    toast('Backup downloaded.')
  }

  function importJSON(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) { toast('Invalid file.'); return }
        await window.api.saveWords(data); setWords(data)
        toast(`${data.length} words restored.`)
      } catch { toast('Could not parse file.') }
    }
    reader.readAsText(file); e.target.value = ''
  }

  if (!settings) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: colors.textMuted }}>
      Loading…
    </div>
  )

  const masteredCount = words.filter(w => w.mastered).length
  const totalSeen     = words.reduce((s, w) => s + (w.seen || 0), 0)

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '22px 20px 60px', display: 'flex', flexDirection: 'column', gap: 13 }}>

      {/* ── Theme ── */}
      <Section title="Appearance" colors={colors}>
        <p style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 16, lineHeight: 1.7 }}>
          Choose how VocabGlance looks. <strong style={{ color: colors.textPrimary }}>System</strong> automatically follows your Windows dark/light setting.
        </p>

        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { value: 'system', label: 'System',  icon: '⚙' },
            { value: 'dark',   label: 'Dark',    icon: '🌙' },
            { value: 'light',  label: 'Light',   icon: '☀️' },
          ].map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setThemeMode(value)}
              style={{
                flex: 1, padding: '14px 8px', borderRadius: radii.lg,
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                background: themeMode === value ? colors.goldDim  : colors.surface2,
                color:      themeMode === value ? colors.gold      : colors.textMuted,
                border:     `1px solid ${themeMode === value ? colors.goldBorder : colors.border}`,
                transition: 'all 0.18s ease',
              }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              {label}
              {themeMode === value && (
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: colors.gold, display: 'block' }} />
              )}
            </button>
          ))}
        </div>

        {/* Live preview strip */}
        <div style={{
          marginTop: 14, borderRadius: radii.md, overflow: 'hidden',
          border: `1px solid ${colors.border}`,
          display: 'flex', height: 36,
        }}>
          <div style={{ flex: 1, background: isDark ? '#0D0F14' : '#F0EDE8', display: 'flex', alignItems: 'center', paddingLeft: 12, fontSize: 11, color: isDark ? '#6E6B65' : '#7A776F' }}>
            {isDark ? 'Dark mode active' : 'Light mode active'}
          </div>
          <div style={{ width: 36, background: 'linear-gradient(145deg, #C9912A, #7A5A10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fonts.serif, fontWeight: 700, fontSize: 15, color: '#0C0A06' }}>V</div>
        </div>
      </Section>

      {/* ── Reminder Interval ── */}
      <Section title="Reminder Interval" colors={colors}>
        <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
          A word slides onto your screen every{' '}
          <strong style={{ color: colors.textPrimary }}>{INTERVALS.find(i => i.value === settings.intervalMs)?.label}</strong>{' '}
          — even when minimised or in the system tray.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {INTERVALS.map(o => <OptionBtn key={o.value} label={o.label} active={settings.intervalMs === o.value} onClick={() => save({ intervalMs: o.value })} colors={colors} />)}
        </div>
      </Section>

      {/* ── Popup Duration ── */}
      <Section title="Popup Display Duration" colors={colors}>
        <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
          How long the popup stays on screen before auto-dismissing.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {DURATIONS.map(o => <OptionBtn key={o.value} label={o.label} active={settings.popupDurationMs === o.value} onClick={() => save({ popupDurationMs: o.value })} colors={colors} />)}
        </div>
      </Section>

      {/* ── Popup Position ── */}
      <Section title="Popup Position" colors={colors}>
        <p style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 14 }}>Which corner of your screen should words pop up from?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['bottom-right', 'Bottom Right ↘'], ['bottom-left', 'Bottom Left ↙']].map(([v, l]) => (
            <OptionBtn key={v} label={l} active={settings.position === v} onClick={() => save({ position: v })} colors={colors} />
          ))}
        </div>
      </Section>

      {/* ── General Toggles ── */}
      <Section title="General" colors={colors}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Toggle label="Reminders enabled" description="Pause or resume all popup reminders." checked={settings.enabled} onChange={v => save({ enabled: v })} colors={colors} />
          <Toggle label="Start with Windows" description="Launch VocabGlance automatically when you log in." checked={settings.startWithWindows} onChange={v => save({ startWithWindows: v })} colors={colors} />
        </div>
      </Section>

      {/* ── Preview ── */}
      <Section title="Preview" colors={colors}>
        <p style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 14 }}>Trigger a popup right now to see how it looks on your screen.</p>
        <button className="btn-interactive" onClick={() => window.api.previewPopup()} style={{
          width: '100%', padding: 10, borderRadius: radii.md,
          fontSize: 13, fontWeight: 500,
          background: colors.surface2, color: colors.textPrimary, border: `1px solid ${colors.border}`,
        }}>Preview Popup Now →</button>
      </Section>

      {/* ── Stats ── */}
      <Section title="Bucket Stats" colors={colors}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {[
            ['Total Words',        words.length],
            ['Mastered',           masteredCount],
            ['Still Learning',     words.length - masteredCount],
            ['With Definitions',   words.filter(w => w.definition).length],
            ['With Pronunciation', words.filter(w => w.pronunciation).length],
            ['With Synonyms',      words.filter(w => w.synonyms).length],
          ].map(([label, val]) => (
            <div key={label} style={{ background: colors.surface2, borderRadius: radii.md, padding: '12px 14px', transition: 'background 0.25s ease' }}>
              <p style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>{label}</p>
              <p style={{ fontFamily: fonts.serif, fontSize: 22, fontWeight: 700, color: colors.textPrimary }}>{val}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Backup ── */}
      <Section title="Backup & Restore" colors={colors}>
        <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.7, marginBottom: 14 }}>
          Export your entire bucket as JSON — perfect for switching devices or keeping a backup.
        </p>
        <div style={{ display: 'flex', gap: 9 }}>
          <button className="btn-interactive" onClick={exportJSON} style={{ flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: colors.gold, color: '#0C0A06', border: 'none' }}>Export JSON ↓</button>
          <label className="btn-interactive" style={{ flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: colors.surface2, color: colors.textPrimary, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            Import JSON ↑
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
        </div>
      </Section>

      {/* ── Danger ── */}
      <Section title="Danger Zone" colors={colors} accentColor={colors.danger}>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button className="btn-interactive" onClick={async () => {
            if (!window.confirm('Reset all mastered flags and seen counts?')) return
            const reset = words.map(w => ({ ...w, mastered: false, seen: 0 }))
            await window.api.saveWords(reset); setWords(reset); toast('Progress reset.')
          }} style={{ padding: '9px 14px', borderRadius: radii.md, fontSize: 13, background: colors.dangerBg, color: colors.danger, border: `1px solid ${colors.dangerBorder}` }}>
            Reset Progress
          </button>
          <button className="btn-interactive" onClick={async () => {
            if (!window.confirm('Delete ALL words? This cannot be undone.')) return
            await window.api.saveWords([]); setWords([]); toast('Bucket cleared.')
          }} style={{ padding: '9px 14px', borderRadius: radii.md, fontSize: 13, background: colors.dangerBg, color: colors.danger, border: `1px solid ${colors.dangerBorder}` }}>
            Clear All Words
          </button>
        </div>
      </Section>

      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 2 }}>
          VocabGlance v1.0 · Built with Electron + React<br />
          Data stored locally — works fully offline.
        </p>
      </div>
    </div>
  )
}

function Section({ title, accentColor, colors, children }) {
  return (
    <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.xl, padding: 22, transition: 'background 0.25s ease, border-color 0.25s ease' }}>
      <p style={{ fontSize: 9, fontWeight: 600, color: accentColor || colors.gold, letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 18 }}>{title}</p>
      {children}
    </div>
  )
}

function OptionBtn({ label, active, onClick, colors }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: radii.md, fontSize: 13, fontWeight: 500, cursor: 'pointer',
      background: active ? colors.gold  : colors.surface2,
      color:      active ? '#0C0A06'    : colors.textMuted,
      border:     `1px solid ${active ? colors.gold : colors.border}`,
      transition: 'all 0.15s',
    }}>{label}</button>
  )
}

function Toggle({ label, description, checked, onChange, colors }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 13.5, color: colors.textPrimary, marginBottom: 3 }}>{label}</p>
        {description && <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.6 }}>{description}</p>}
      </div>
      <div onClick={() => onChange(!checked)} style={{
        width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
        background: checked ? colors.gold : colors.surface2,
        border: `1px solid ${checked ? colors.gold : colors.border}`,
        position: 'relative', transition: 'all 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3,
          left: checked ? 20 : 3,
          width: 14, height: 14, borderRadius: '50%',
          background: checked ? '#0C0A06' : colors.textMuted,
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  )
}
