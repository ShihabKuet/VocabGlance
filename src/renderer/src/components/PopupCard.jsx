/**
 * PopupCard — Floating word reminder window.
 * Receives isDark flag directly from main process via IPC payload,
 * since this window has no access to ThemeContext (separate BrowserWindow).
 */

import { useEffect, useRef, useState } from 'react'
import { darkTheme, lightTheme, fonts, radii } from '../styles/tokens'

export default function PopupCard() {
  const [payload,  setPayload]  = useState(null)
  const [phase,    setPhase]    = useState('idle')
  const [progress, setProgress] = useState(100)
  const [colors,   setColors]   = useState(darkTheme)  // default dark until IPC arrives

  const progTimer = useRef(null)
  const autoClose = useRef(null)
  const cardRef   = useRef(null)

  useEffect(() => {
    window.api.onShowWord((data) => {
      // Apply theme from main process payload
      setColors(data.isDark ? darkTheme : lightTheme)
      setPayload(data)
      setPhase('in')
      setProgress(100)

      requestAnimationFrame(() => {
        setTimeout(() => {
          const h = cardRef.current?.offsetHeight
          if (h) window.api.resizePopup(h + 16)
        }, 80)
      })

      const t0 = Date.now()
      progTimer.current = setInterval(() => {
        setProgress(Math.max(0, 100 - ((Date.now() - t0) / data.duration) * 100))
      }, 50)

      autoClose.current = setTimeout(() => dismiss(null), data.duration)
    })

    return () => window.api.removeListeners('show-word')
  }, [])

  function dismiss(feedback) {
    clearInterval(progTimer.current)
    clearTimeout(autoClose.current)
    if (feedback === 'mastered' && payload?.word?.id) {
      window.api.markMastered(payload.word.id)
    }
    setPhase('out')
    setTimeout(() => {
      setPayload(null); setPhase('idle')
      window.api.closePopup()
    }, 310)
  }

  if (phase === 'idle' || !payload) return null

  const { word, queueLength } = payload
  const wordLen = word.word?.length || 0
  const isDark  = colors.name === 'dark'

  return (
    <div
      ref={cardRef}
      className={phase === 'out' ? 'slide-down' : 'slide-up'}
      style={{
        margin: 8,
        background: colors.popupBg,
        border: `1px solid ${colors.popupBorder}`,
        borderRadius: radii['2xl'],
        padding: '20px 22px 16px',
        boxShadow: colors.popupShadow,
        userSelect: 'none',
        // Smooth theme-specific border
        transition: 'background 0.25s ease, border-color 0.25s ease',
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{
            width: 17, height: 17, borderRadius: 4,
            background: 'linear-gradient(145deg, #C9912A, #7A5A10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: fonts.serif, fontSize: 9, fontWeight: 700, color: '#0C0A06',
          }}>V</div>
          <span style={{ fontSize: 9, letterSpacing: 2.2, textTransform: 'uppercase', color: colors.gold, fontWeight: 600, fontFamily: fonts.sans }}>
            VocabGlance
          </span>
        </div>
        <button onClick={() => dismiss(null)} style={{
          width: 22, height: 22, borderRadius: '50%',
          background: colors.surface2, border: 'none',
          color: colors.textMuted, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = colors.surface3; e.currentTarget.style.color = colors.textPrimary }}
        onMouseLeave={e => { e.currentTarget.style.background = colors.surface2; e.currentTarget.style.color = colors.textMuted  }}
        >×</button>
      </div>

      {/* Word */}
      <p className="word-rev" style={{
        fontFamily: fonts.serif,
        fontSize: wordLen > 16 ? 22 : wordLen > 12 ? 28 : wordLen > 8 ? 33 : 38,
        fontWeight: 700, lineHeight: 1.1,
        color: colors.textPrimary,
        letterSpacing: wordLen > 12 ? '-0.5px' : 0,
      }}>{word.word}</p>

      {/* Pronunciation */}
      {word.pronunciation && (
        <p style={{ fontSize: 11, color: colors.textMuted, marginTop: 5, fontStyle: 'italic', letterSpacing: '0.3px' }}>
          /{word.pronunciation}/
        </p>
      )}

      {word.definition && (
        <>
          <div style={{ height: 1, background: colors.border, margin: '13px 0 11px' }} />
          <p className="def-rev" style={{ fontSize: 13.5, color: colors.textSubtle, lineHeight: 1.72, fontFamily: fonts.sans }}>
            {word.definition}
          </p>
        </>
      )}

      {/* Synonyms */}
      {word.synonyms && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginTop: 10 }}>
          <span style={{ fontSize: 9.5, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>syn</span>
          {word.synonyms.split(',').map(s => s.trim()).filter(Boolean).map(s => (
            <span key={s} style={{
              fontSize: 11, color: colors.gold, background: colors.goldDim,
              border: `1px solid ${colors.goldBorder}`, borderRadius: 4,
              padding: '1px 7px',
            }}>{s}</span>
          ))}
        </div>
      )}

      {/* Feedback buttons */}
      <div style={{ display: 'flex', gap: 7, marginTop: 16 }}>
        <button className="btn-feedback" onClick={() => dismiss('mastered')} style={{
          flex: 1, padding: '7px 0', borderRadius: radii.md,
          fontSize: 12, fontWeight: 500, cursor: 'pointer',
          background: colors.goldDim, color: colors.gold, border: `1px solid ${colors.goldBorder}`,
        }}>Got it ✓</button>
        <button className="btn-feedback" onClick={() => dismiss('learning')} style={{
          flex: 1, padding: '7px 0', borderRadius: radii.md,
          fontSize: 12, fontWeight: 500, cursor: 'pointer',
          background: colors.surface2, color: colors.textMuted, border: `1px solid ${colors.border}`,
        }}>Still learning</button>
      </div>

      {/* Progress bar */}
      <div style={{ marginTop: 14, height: 2, background: colors.border, borderRadius: 1, overflow: 'hidden' }}>
        <div className="progress-fill" style={{ height: '100%', width: `${progress}%`, background: colors.gold, borderRadius: 1 }} />
      </div>
      <p style={{ fontSize: 9.5, color: colors.textMuted, marginTop: 6, textAlign: 'right', fontFamily: fonts.sans }}>
        {queueLength} left in shuffle
      </p>
    </div>
  )
}
