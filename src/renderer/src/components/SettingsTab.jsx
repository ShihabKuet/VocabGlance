/**
 * SettingsTab — Configure VocabGlance behaviour.
 *
 * Controls:
 *  • Reminder interval (30s / 1m / 5m / 15m / 30m / 1h)
 *  • Popup position (bottom-right / bottom-left)
 *  • Popup display duration
 *  • Pause / Resume reminders
 *  • Start with Windows (login item)
 *  • Preview popup button
 *  • Bucket stats grid
 *  • Export / Import JSON backup
 *  • Danger zone: reset progress / clear all
 */

import { useState, useEffect } from 'react'
import { colors, fonts, radii } from '../styles/tokens'

const { gold, goldDim, goldBorder, surface, surface2, border,
        textPrimary, textMuted, danger, dangerBg, dangerBorder } = colors

const INTERVALS = [
  { label: '30 sec',  value: 30000   },
  { label: '1 min',   value: 60000   },
  { label: '5 min',   value: 300000  },
  { label: '15 min',  value: 900000  },
  { label: '30 min',  value: 1800000 },
  { label: '1 hour',  value: 3600000 },
]

const DURATIONS = [
  { label: '5 sec',  value: 5000  },
  { label: '8 sec',  value: 8000  },
  { label: '12 sec', value: 12000 },
  { label: '20 sec', value: 20000 },
]

export default function SettingsTab({ toast, onEnabledChange }) {
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

  /* ── Export ── */
  function exportJSON() {
    const blob = new Blob([JSON.stringify(words, null, 2)], { type: 'application/json' })
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `vocabglance-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    toast('Backup downloaded.')
  }

  /* ── Import ── */
  function importJSON(e) {
    const file = e.target.files[0]; if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (!Array.isArray(data)) { toast('Invalid file.'); return }
        await window.api.saveWords(data)
        setWords(data)
        toast(`${data.length} words restored.`)
      } catch { toast('Could not parse file.') }
    }
    reader.readAsText(file); e.target.value = ''
  }

  if (!settings) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: textMuted }}>
      Loading…
    </div>
  )

  const masteredCount = words.filter(w => w.mastered).length
  const totalSeen     = words.reduce((s, w) => s + (w.seen || 0), 0)

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '22px 20px 60px', display: 'flex', flexDirection: 'column', gap: 13 }}>

      {/* ── Reminder Interval ── */}
      <Section title="Reminder Interval">
        <p style={{ fontSize: 12.5, color: textMuted, lineHeight: 1.7, marginBottom: 14 }}>
          A word will slide onto your screen every{' '}
          <strong style={{ color: textPrimary }}>{INTERVALS.find(i => i.value === settings.intervalMs)?.label}</strong>{' '}
          — even when VocabGlance is minimised or hidden in the system tray.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 6 }}>
          {INTERVALS.map(o => (
            <OptionBtn key={o.value} label={o.label} active={settings.intervalMs === o.value} onClick={() => save({ intervalMs: o.value })} />
          ))}
        </div>
      </Section>

      {/* ── Popup Duration ── */}
      <Section title="Popup Display Duration">
        <p style={{ fontSize: 12.5, color: textMuted, lineHeight: 1.7, marginBottom: 14 }}>
          How long the popup stays on screen before auto-dismissing.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {DURATIONS.map(o => (
            <OptionBtn key={o.value} label={o.label} active={settings.popupDurationMs === o.value} onClick={() => save({ popupDurationMs: o.value })} />
          ))}
        </div>
      </Section>

      {/* ── Popup Position ── */}
      <Section title="Popup Position">
        <p style={{ fontSize: 12.5, color: textMuted, marginBottom: 14 }}>Which corner of your screen should words pop up from?</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {[['bottom-right', 'Bottom Right ↘'], ['bottom-left', 'Bottom Left ↙']].map(([v, l]) => (
            <OptionBtn key={v} label={l} active={settings.position === v} onClick={() => save({ position: v })} />
          ))}
        </div>
      </Section>

      {/* ── General Toggles ── */}
      <Section title="General">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Toggle
            label="Reminders enabled"
            description="Pause or resume all popup reminders."
            checked={settings.enabled}
            onChange={v => save({ enabled: v })}
          />
          <Toggle
            label="Start with Windows"
            description="Launch VocabGlance automatically when you log in."
            checked={settings.startWithWindows}
            onChange={v => save({ startWithWindows: v })}
          />
        </div>
      </Section>

      {/* ── Preview ── */}
      <Section title="Preview">
        <p style={{ fontSize: 12.5, color: textMuted, marginBottom: 14 }}>
          Trigger a popup right now to see how it looks on your screen.
        </p>
        <button className="btn-interactive" onClick={() => window.api.previewPopup()} style={{
          width: '100%', padding: 10, borderRadius: radii.md,
          fontSize: 13, fontWeight: 500,
          background: surface2, color: textPrimary, border: `1px solid ${border}`,
        }}>
          Preview Popup Now →
        </button>
      </Section>

      {/* ── Stats ── */}
      <Section title="Bucket Stats">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
          {[
            ['Total Words',        words.length],
            ['Mastered',           masteredCount],
            ['Still Learning',     words.length - masteredCount],
            ['With Definitions',   words.filter(w => w.definition).length],
            ['With Sources',       words.filter(w => w.source).length],
            ['Total Pop-ups Seen', totalSeen],
          ].map(([label, val]) => (
            <div key={label} style={{ background: surface2, borderRadius: radii.md, padding: '12px 14px' }}>
              <p style={{ fontSize: 10, color: textMuted, marginBottom: 4 }}>{label}</p>
              <p style={{ fontFamily: fonts.serif, fontSize: 22, fontWeight: 700 }}>{val}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Backup ── */}
      <Section title="Backup & Restore">
        <p style={{ fontSize: 12.5, color: textMuted, lineHeight: 1.7, marginBottom: 14 }}>
          Export your entire bucket as JSON — perfect for switching devices or keeping an offline backup.
        </p>
        <div style={{ display: 'flex', gap: 9 }}>
          <button className="btn-interactive" onClick={exportJSON} style={{ flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: gold, color: '#0C0A06', border: 'none' }}>
            Export JSON ↓
          </button>
          <label className="btn-interactive" style={{ flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: surface2, color: textPrimary, border: `1px solid ${border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            Import JSON ↑
            <input type="file" accept=".json" onChange={importJSON} style={{ display: 'none' }} />
          </label>
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone" accentColor={colors.danger}>
        <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
          <button className="btn-interactive" onClick={async () => {
            if (!window.confirm('Reset all mastered flags and seen counts? Words are kept.')) return
            const reset = words.map(w => ({ ...w, mastered: false, seen: 0 }))
            await window.api.saveWords(reset); setWords(reset); toast('Progress reset.')
          }} style={{ padding: '9px 14px', borderRadius: radii.md, fontSize: 13, background: dangerBg, color: danger, border: `1px solid ${dangerBorder}` }}>
            Reset Progress
          </button>
          <button className="btn-interactive" onClick={async () => {
            if (!window.confirm('Delete ALL words? This cannot be undone.')) return
            await window.api.saveWords([]); setWords([]); toast('Bucket cleared.')
          }} style={{ padding: '9px 14px', borderRadius: radii.md, fontSize: 13, background: dangerBg, color: danger, border: `1px solid ${dangerBorder}` }}>
            Clear All Words
          </button>
        </div>
      </Section>

      {/* ── About ── */}
      <div style={{ textAlign: 'center', paddingTop: 8 }}>
        <p style={{ fontSize: 11, color: textMuted, lineHeight: 2 }}>
          VocabGlance v1.0 · Built with Electron + React<br />
          Data stored locally — works fully offline.
        </p>
      </div>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function Section({ title, accentColor = gold, children }) {
  return (
    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: radii.xl, padding: 22 }}>
      <p style={{ fontSize: 9, fontWeight: 600, color: accentColor, letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 18 }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function OptionBtn({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', borderRadius: radii.md, fontSize: 13, fontWeight: 500, cursor: 'pointer',
      background: active ? gold  : surface2,
      color:      active ? '#0C0A06' : textMuted,
      border:     `1px solid ${active ? gold : border}`,
      transition: 'all 0.15s',
    }}>{label}</button>
  )
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 13.5, color: textPrimary, marginBottom: 3 }}>{label}</p>
        {description && <p style={{ fontSize: 11.5, color: textMuted, lineHeight: 1.6 }}>{description}</p>}
      </div>
      {/* Toggle switch */}
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
          background: checked ? gold : surface2,
          border: `1px solid ${checked ? gold : border}`,
          position: 'relative', flexShrink: 0, transition: 'all 0.2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: checked ? 20 : 3,
          width: 14, height: 14, borderRadius: '50%',
          background: checked ? '#0C0A06' : textMuted,
          transition: 'left 0.2s',
        }} />
      </div>
    </div>
  )
}
