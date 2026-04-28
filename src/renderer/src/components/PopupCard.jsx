/**
 * PopupCard — The floating word reminder window.
 *
 * This component renders inside a dedicated transparent BrowserWindow
 * that sits above ALL other applications. It receives word data from
 * the main process via IPC (window.api.onShowWord) and handles:
 *
 *  • Slide-up entrance animation
 *  • Auto-dismiss with progress bar countdown
 *  • "Got it" (mark mastered) / "Still learning" feedback
 *  • Resize IPC so the window fits content height
 */

import { useEffect, useRef, useState } from 'react'
import { colors, fonts, radii } from '../styles/tokens'

const { gold, goldDim, goldBorder, bg, surface2, border, textPrimary, textMuted, textSubtle } = colors

export default function PopupCard() {
  const [payload,  setPayload]  = useState(null)   // { word, duration, position, queueLength }
  const [phase,    setPhase]    = useState('idle')  // idle | in | visible | out
  const [progress, setProgress] = useState(100)

  const progTimer = useRef(null)
  const autoClose = useRef(null)
  const cardRef   = useRef(null)

  /* ── Receive word from main process ── */
  useEffect(() => {
    window.api.onShowWord((data) => {
      setPayload(data)
      setPhase('in')
      setProgress(100)

      // Resize window to fit content after paint
      requestAnimationFrame(() => {
        setTimeout(() => {
          const h = cardRef.current?.offsetHeight
          if (h) window.api.resizePopup(h + 16)
        }, 80)
      })

      // Progress countdown
      const t0 = Date.now()
      progTimer.current = setInterval(() => {
        setProgress(Math.max(0, 100 - ((Date.now() - t0) / data.duration) * 100))
      }, 50)

      // Auto-dismiss
      autoClose.current = setTimeout(() => dismiss(null), data.duration)
    })

    return () => window.api.removeListeners('show-word')
  }, [])

  /* ── Dismiss: optionally send feedback ── */
  function dismiss(feedback) {
    clearInterval(progTimer.current)
    clearTimeout(autoClose.current)

    if (feedback === 'mastered' && payload?.word?.id) {
      window.api.markMastered(payload.word.id)
    }

    setPhase('out')
    setTimeout(() => {
      setPayload(null)
      setPhase('idle')
      window.api.closePopup()
    }, 310)
  }

  if (phase === 'idle' || !payload) return null

  const { word, queueLength } = payload
  const wordLen = word.word?.length || 0

  return (
    <div
      ref={cardRef}
      className={phase === 'out' ? 'slide-down' : 'slide-up'}
      style={{
        margin: 8,
        background: 'rgba(10, 12, 18, 0.97)',
        border: `1px solid ${goldBorder}`,
        borderRadius: radii['2xl'],
        padding: '20px 22px 16px',
        boxShadow: [
          `0 0 0 1px rgba(201,145,42,0.06)`,
          `0 24px 64px rgba(0,0,0,0.85)`,
          `0 4px 12px rgba(0,0,0,0.6)`,
        ].join(', '),
        // Prevent text selection in popup
        userSelect: 'none',
      }}
    >
      {/* ── Top row: branding + close ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <LogoMark size={18} />
          <span style={{
            fontSize: 9, letterSpacing: 2.2, textTransform: 'uppercase',
            color: gold, fontWeight: 600, fontFamily: fonts.sans,
          }}>
            VocabGlance
          </span>
        </div>
        <button
          onClick={() => dismiss(null)}
          style={{
            width: 22, height: 22, borderRadius: '50%',
            background: surface2, border: 'none',
            color: textMuted, fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2A2D3A'; e.currentTarget.style.color = textPrimary }}
          onMouseLeave={e => { e.currentTarget.style.background = surface2;  e.currentTarget.style.color = textMuted  }}
        >×</button>
      </div>

      {/* ── Word ── */}
      <p className="word-rev" style={{
        fontFamily: fonts.serif,
        fontSize: wordLen > 16 ? 22 : wordLen > 12 ? 28 : wordLen > 8 ? 33 : 38,
        fontWeight: 700,
        lineHeight: 1.1,
        color: textPrimary,
        letterSpacing: wordLen > 12 ? '-0.5px' : 0,
      }}>
        {word.word}
      </p>

      {/* ── Source tag ── */}
      {word.source && (
        <p style={{ fontSize: 10.5, color: textMuted, marginTop: 5, fontStyle: 'italic' }}>
          from {word.source}
        </p>
      )}

      {/* ── Divider + Definition ── */}
      {word.definition && (
        <>
          <div style={{ height: 1, background: border, margin: '13px 0 11px' }} />
          <p className="def-rev" style={{
            fontSize: 13.5,
            color: textSubtle,
            lineHeight: 1.72,
            fontFamily: fonts.sans,
          }}>
            {word.definition}
          </p>
        </>
      )}

      {/* ── Feedback buttons ── */}
      <div style={{ display: 'flex', gap: 7, marginTop: 16 }}>
        <button
          className="btn-feedback"
          onClick={() => dismiss('mastered')}
          style={{
            flex: 1, padding: '7px 0', borderRadius: radii.md,
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: goldDim, color: gold, border: `1px solid ${goldBorder}`,
          }}
        >
          Got it ✓
        </button>
        <button
          className="btn-feedback"
          onClick={() => dismiss('learning')}
          style={{
            flex: 1, padding: '7px 0', borderRadius: radii.md,
            fontSize: 12, fontWeight: 500, cursor: 'pointer',
            background: surface2, color: textMuted, border: `1px solid ${border}`,
          }}
        >
          Still learning
        </button>
      </div>

      {/* ── Progress bar ── */}
      <div style={{ marginTop: 14, height: 2, background: border, borderRadius: 1, overflow: 'hidden' }}>
        <div className="progress-fill" style={{ height: '100%', width: `${progress}%`, background: gold, borderRadius: 1 }} />
      </div>

      {/* ── Queue hint ── */}
      <p style={{ fontSize: 9.5, color: textMuted, marginTop: 6, textAlign: 'right', fontFamily: fonts.sans }}>
        {queueLength} left in shuffle
      </p>
    </div>
  )
}

/** Tiny V logo mark */
function LogoMark({ size = 20 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: Math.round(size * 0.27),
      background: 'linear-gradient(145deg, #C9912A, #7A5A10)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: fonts.serif, fontWeight: 700,
      fontSize: Math.round(size * 0.52), color: '#0C0A06',
      flexShrink: 0,
    }}>V</div>
  )
}
