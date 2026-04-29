/**
 * BucketTab — Word management panel. Fully theme-aware.
 * Fields: word, definition, pronunciation (optional), synonyms (optional)
 */

import { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { fonts, radii } from '../styles/tokens'

export default function BucketTab({ onCountChange, toast }) {
  const { colors, isDark } = useTheme()

  const [words,       setWords]       = useState([])
  const [newWord,     setNewWord]     = useState('')
  const [newDef,      setNewDef]      = useState('')
  const [newPronun,   setNewPronun]   = useState('')
  const [newSynonyms, setNewSynonyms] = useState('')
  const [search,      setSearch]      = useState('')
  const [filter,      setFilter]      = useState('all')
  const [editId,      setEditId]      = useState(null)
  const [editDef,     setEditDef]     = useState('')
  const [editPronun,  setEditPronun]  = useState('')
  const [editSyn,     setEditSyn]     = useState('')
  const [bulkOpen,    setBulkOpen]    = useState(false)
  const [bulkText,    setBulkText]    = useState('')

  useEffect(() => {
    window.api.getWords().then(loadWords)
    window.api.onWordsUpdated(loadWords)
    return () => window.api.removeListeners('words-updated')
  }, [])

  function loadWords(ws) { setWords(ws); onCountChange(ws.length) }

  async function persist(updated) {
    setWords(updated); onCountChange(updated.length)
    await window.api.saveWords(updated)
  }

  async function addWord() {
    const w = newWord.trim()
    if (!w) return
    if (words.some(x => x.word.toLowerCase() === w.toLowerCase())) { toast('Already in bucket!'); return }
    const entry = {
      id: Date.now(), word: w,
      definition:    newDef.trim(),
      pronunciation: newPronun.trim(),
      synonyms:      newSynonyms.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mastered: false, seen: 0,
    }
    await persist([entry, ...words])
    setNewWord(''); setNewDef(''); setNewPronun(''); setNewSynonyms('')
    toast(`"${w}" added ✦`)
  }

  async function saveEdit(id) {
    await persist(words.map(w => w.id === id
      ? { ...w, definition: editDef.trim(), pronunciation: editPronun.trim(), synonyms: editSyn.trim() }
      : w
    ))
    setEditId(null); toast('Saved.')
  }

  async function toggleMastered(id) {
    await persist(words.map(w => w.id === id ? { ...w, mastered: !w.mastered } : w))
  }

  async function deleteWord(id, label) {
    await persist(words.filter(w => w.id !== id))
    toast(`"${label}" removed`)
  }

  async function runBulk() {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(Boolean)
    const date  = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const entries = []; let added = 0
    for (const line of lines) {
      const sep  = line.indexOf(':')
      const word = (sep > -1 ? line.slice(0, sep) : line).trim()
      const def  = (sep > -1 ? line.slice(sep + 1) : '').trim()
      if (!word) continue
      if (words.some(x => x.word.toLowerCase() === word.toLowerCase())) continue
      if (entries.some(x => x.word.toLowerCase() === word.toLowerCase())) continue
      entries.push({ id: Date.now() + added++, word, definition: def, pronunciation: '', synonyms: '', date, mastered: false, seen: 0 })
    }
    if (!added) { toast('No new words found.'); return }
    await persist([...entries.reverse(), ...words])
    setBulkText(''); setBulkOpen(false)
    toast(`${added} word${added > 1 ? 's' : ''} imported ✦`)
  }

  const filtered = words
    .filter(w => filter === 'mastered' ? w.mastered : filter === 'learning' ? !w.mastered : true)
    .filter(w =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      (w.definition    || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.synonyms      || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.pronunciation || '').toLowerCase().includes(search.toLowerCase())
    )

  const masteredCount = words.filter(w => w.mastered).length
  const learningCount = words.length - masteredCount

  const inputStyle = {
    padding: '9px 12px', borderRadius: radii.md,
    background: colors.surface2, border: `1px solid ${colors.border}`,
    color: colors.textPrimary, fontSize: 13.5,
    transition: 'background 0.2s, border-color 0.2s',
  }

  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '22px 20px 60px' }}>

      {/* ── Bulk Import Modal ── */}
      {bulkOpen && (
        <div onClick={() => setBulkOpen(false)} style={{
          position: 'fixed', inset: 0, background: `rgba(0,0,0,${isDark ? '0.72' : '0.4'})`,
          zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: colors.surface, border: `1px solid ${colors.border}`,
            borderRadius: radii['2xl'], padding: 28, width: '100%', maxWidth: 500,
            animation: 'modalScale .25s ease forwards',
            boxShadow: `0 24px 64px rgba(0,0,0,${isDark ? '0.6' : '0.18'})`,
          }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: colors.gold, letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 8 }}>Bulk Import</p>
            <p style={{ fontSize: 12.5, color: colors.textMuted, marginBottom: 14, lineHeight: 1.65 }}>
              One word per line. Add a colon for the definition:<br />
              <span style={{ color: colors.textPrimary, fontFamily: fonts.mono, fontSize: 11.5 }}>Ephemeral: Lasting for a very short time</span><br />
              <span style={{ color: colors.textMuted, fontSize: 11 }}>Pronunciation and synonyms can be added after import via inline edit.</span>
            </p>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={9}
              placeholder={'Laconic\nPernicious: Having a harmful effect\nVoracious: Having a very eager approach'}
              style={{ width: '100%', padding: '11px 13px', borderRadius: radii.lg, background: colors.surface2, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: 13, lineHeight: 1.7, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
              <button className="btn-interactive" onClick={runBulk} style={{ flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: colors.gold, color: '#0C0A06', border: 'none' }}>Import Words</button>
              <button className="btn-interactive" onClick={() => setBulkOpen(false)} style={{ padding: '10px 18px', borderRadius: radii.md, fontSize: 13, background: colors.surface2, color: colors.textMuted, border: `1px solid ${colors.border}` }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Form ── */}
      <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radii.xl, padding: '20px 20px 17px', marginBottom: 14, transition: 'background 0.25s ease' }}>
        <p style={{ fontSize: 9, fontWeight: 600, color: colors.gold, letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 13 }}>Add to Bucket</p>

        {/* Row 1: Word + Definition */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <input value={newWord} onChange={e => setNewWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Word or phrase…"
            style={{ ...inputStyle, flex: '0 0 170px', fontFamily: fonts.serif, fontSize: 14 }} />
          <input value={newDef} onChange={e => setNewDef(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Definition or example…"
            style={{ ...inputStyle, flex: '1 1 200px' }} />
        </div>

        {/* Row 2: Pronunciation + Synonyms + Add button */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={newPronun} onChange={e => setNewPronun(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Pronunciation (e.g. ih-FEM-er-ul)"
            style={{ ...inputStyle, flex: '0 0 210px', fontSize: 13 }} />
          <input value={newSynonyms} onChange={e => setNewSynonyms(e.target.value)} onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Synonyms (e.g. fleeting, transient)"
            style={{ ...inputStyle, flex: '1 1 180px', fontSize: 13 }} />
          <button className="btn-interactive" onClick={addWord} style={{ padding: '9px 18px', borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: colors.gold, color: '#0C0A06', border: 'none', whiteSpace: 'nowrap', alignSelf: 'stretch' }}>+ Add</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9, flexWrap: 'wrap', gap: 6 }}>
          <p style={{ fontSize: 11, color: colors.textMuted }}>All fields except the word are optional · Press Enter to add quickly</p>
          <button className="tab-pill" onClick={() => setBulkOpen(true)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, color: colors.gold, background: colors.goldDim, border: `1px solid ${colors.goldBorder}` }}>Bulk Import ↗</button>
        </div>
      </div>

      {/* ── Filters + Search ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[['all', `All (${words.length})`], ['learning', `Learning (${learningCount})`], ['mastered', `Mastered (${masteredCount})`]].map(([v, l]) => (
            <button key={v} className="tab-pill" onClick={() => setFilter(v)} style={{
              padding: '5px 11px', borderRadius: 7, fontSize: 12,
              background: filter === v ? colors.surface2 : 'transparent',
              color:      filter === v ? colors.textPrimary : colors.textMuted,
              border:     filter === v ? `1px solid ${colors.border}` : '1px solid transparent',
              transition: 'all 0.15s',
            }}>{l}</button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search words, definitions, synonyms…"
          style={{ ...inputStyle, flex: 1, minWidth: 140, padding: '7px 12px' }} />
        {search && <button className="tab-pill" onClick={() => setSearch('')} style={{ padding: '6px 10px', borderRadius: 7, background: colors.surface2, border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 12 }}>✕</button>}
      </div>

      {/* ── Word List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', lineHeight: 2.4 }}>
            <p style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.textPrimary }}>
              {words.length === 0 ? 'Your bucket is empty' : 'No results'}
            </p>
            <p style={{ fontSize: 13, color: colors.textMuted }}>
              {words.length === 0 ? 'Start adding words from your Daily Star editorials ✦' : 'Try a different search or filter.'}
            </p>
          </div>
        ) : filtered.map(w => (
          <WordRow key={w.id} word={w} index={words.indexOf(w) + 1}
            colors={colors} isDark={isDark}
            isEditing={editId === w.id}
            editDef={editDef}     setEditDef={setEditDef}
            editPronun={editPronun} setEditPronun={setEditPronun}
            editSyn={editSyn}     setEditSyn={setEditSyn}
            onEdit={() => { setEditId(w.id); setEditDef(w.definition || ''); setEditPronun(w.pronunciation || ''); setEditSyn(w.synonyms || '') }}
            onSave={() => saveEdit(w.id)}
            onCancelEdit={() => setEditId(null)}
            onToggleMastered={() => toggleMastered(w.id)}
            onDelete={() => deleteWord(w.id, w.word)}
          />
        ))}
      </div>
    </div>
  )
}

/* ── WordRow ─────────────────────────────────────────────────────────────── */
function WordRow({ word: w, index, colors, isDark, isEditing, editDef, setEditDef, editPronun, setEditPronun, editSyn, setEditSyn, onEdit, onSave, onCancelEdit, onToggleMastered, onDelete }) {
  return (
    <div className="word-card" style={{
      display: 'flex', alignItems: 'flex-start', gap: 11,
      background: colors.surface,
      border: `1px solid ${w.mastered ? colors.goldBorder : colors.border}`,
      borderRadius: radii.lg, padding: '13px 14px',
      opacity: w.mastered ? 0.7 : 1,
      transition: 'background 0.25s ease, border-color 0.2s',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(201,145,42,0.055)' : 'rgba(166,116,32,0.05)' }}
    onMouseLeave={e => { e.currentTarget.style.background = colors.surface }}
    >
      {/* Index */}
      <div style={{ width: 22, height: 22, borderRadius: 5, background: colors.surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, color: colors.textMuted, flexShrink: 0, marginTop: 2 }}>{index}</div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Word + badges */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontFamily: fonts.serif, fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>{w.word}</span>
          {w.mastered && (
            <span style={{ fontSize: 9.5, color: colors.gold, background: colors.goldDim, border: `1px solid ${colors.goldBorder}`, borderRadius: 5, padding: '1px 6px' }}>mastered</span>
          )}
          {/* Pronunciation inline badge */}
          {w.pronunciation && !isEditing && (
            <span style={{ fontSize: 10.5, color: colors.textMuted, fontStyle: 'italic', letterSpacing: '0.3px' }}>
              /{w.pronunciation}/
            </span>
          )}
        </div>

        {isEditing ? (
          /* ── Edit Mode ── */
          <div style={{ marginTop: 9 }}>
            <input value={editDef} onChange={e => setEditDef(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave()}
              placeholder="Definition or example…"
              style={{ width: '100%', padding: '7px 10px', borderRadius: radii.md, background: colors.surface2, border: `1px solid ${colors.gold}50`, color: colors.textPrimary, fontSize: 13, marginBottom: 6 }} />
            <div style={{ display: 'flex', gap: 7, marginBottom: 6 }}>
              <input value={editPronun} onChange={e => setEditPronun(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave()}
                placeholder="Pronunciation (e.g. ih-FEM-er-ul)"
                style={{ flex: 1, padding: '7px 10px', borderRadius: radii.md, background: colors.surface2, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: 12.5 }} />
              <input value={editSyn} onChange={e => setEditSyn(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave()}
                placeholder="Synonyms (comma-separated)"
                style={{ flex: 1, padding: '7px 10px', borderRadius: radii.md, background: colors.surface2, border: `1px solid ${colors.border}`, color: colors.textPrimary, fontSize: 12.5 }} />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-interactive" onClick={onSave} style={{ padding: '5px 13px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: colors.gold, color: '#0C0A06', border: 'none' }}>Save</button>
              <button className="btn-interactive" onClick={onCancelEdit} style={{ padding: '5px 11px', borderRadius: 6, fontSize: 12, background: colors.surface2, color: colors.textMuted, border: `1px solid ${colors.border}` }}>Cancel</button>
            </div>
          </div>
        ) : (
          /* ── View Mode ── */
          <>
            {w.definition && (
              <p style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.65, marginBottom: 4 }}>{w.definition}</p>
            )}
            {/* Synonyms row */}
            {w.synonyms && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 3 }}>
                <span style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>syn</span>
                {w.synonyms.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                  <span key={s} style={{
                    fontSize: 11, color: colors.gold, background: colors.goldDim,
                    border: `1px solid ${colors.goldBorder}`, borderRadius: 4,
                    padding: '1px 7px',
                  }}>{s}</span>
                ))}
              </div>
            )}
            {/* Seen bar */}
            {w.seen > 0 && (
              <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 2, background: colors.border, borderRadius: 1 }}>
                  <div className="seen-fill" style={{ height: '100%', width: `${Math.min(100, w.seen * 10)}%`, background: colors.gold, borderRadius: 1, opacity: 0.55 }} />
                </div>
                <span style={{ fontSize: 9.5, color: colors.textMuted }}>seen {w.seen}×</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        {w.date && <span style={{ fontSize: 10, color: colors.textMuted }}>{w.date}</span>}
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionBtn title={w.mastered ? 'Unmark mastered' : 'Mark as mastered'} onClick={onToggleMastered} active={w.mastered} colors={colors}>✓</ActionBtn>
          <ActionBtn title="Edit" onClick={onEdit} colors={colors}>✎</ActionBtn>
          <button title="Delete" onClick={onDelete}
            style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: `1px solid ${colors.border}`, color: colors.textMuted, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.13s' }}
            onMouseEnter={e => { e.currentTarget.style.background = colors.dangerBg; e.currentTarget.style.color = colors.danger }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textMuted }}
          >×</button>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ title, onClick, active, colors, children }) {
  return (
    <button title={title} onClick={onClick} style={{
      width: 26, height: 26, borderRadius: 6, cursor: 'pointer',
      background: active ? colors.goldDim  : 'transparent',
      border:     active ? `1px solid ${colors.goldBorder}` : `1px solid ${colors.border}`,
      color:      active ? colors.gold     : colors.textMuted,
      fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.14s',
    }}
    onMouseEnter={e => { if (!active) { e.currentTarget.style.background = colors.goldDim; e.currentTarget.style.color = colors.gold; e.currentTarget.style.borderColor = colors.goldBorder }}}
    onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = colors.textMuted; e.currentTarget.style.borderColor = colors.border }}}
    >{children}</button>
  )
}
