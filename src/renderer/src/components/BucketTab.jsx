/**
 * BucketTab — Word management panel.
 *
 * Features:
 *  • Add individual words with definition + source
 *  • Bulk import (word: definition per line)
 *  • Inline edit of definition / source
 *  • Mastered toggle (✓) — reduces popup frequency
 *  • Seen counter with visual progress bar
 *  • Filter: All / Learning / Mastered
 *  • Search by word, definition, or source
 *  • Delete
 *  • Live refresh when main process updates seen counts
 */

import { useState, useEffect } from 'react'
import { colors, fonts, radii } from '../styles/tokens'

const { gold, goldDim, goldBorder, surface, surface2, border, bg,
        textPrimary, textMuted, textSubtle, danger, dangerBg, dangerBorder } = colors

export default function BucketTab({ onCountChange, toast }) {
  const [words,    setWords]    = useState([])
  const [newWord,  setNewWord]  = useState('')
  const [newDef,   setNewDef]   = useState('')
  const [newSrc,   setNewSrc]   = useState('')
  const [search,   setSearch]   = useState('')
  const [filter,   setFilter]   = useState('all')   // all | learning | mastered
  const [editId,   setEditId]   = useState(null)
  const [editDef,  setEditDef]  = useState('')
  const [editSrc,  setEditSrc]  = useState('')
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')

  /* ── Load words on mount ── */
  useEffect(() => {
    window.api.getWords().then(loadWords)

    // Main process pushes updates when seen counts change after a popup
    window.api.onWordsUpdated(loadWords)
    return () => window.api.removeListeners('words-updated')
  }, [])

  function loadWords(ws) {
    setWords(ws)
    onCountChange(ws.length)
  }

  /* ── Persist helper ── */
  async function persist(updated) {
    setWords(updated)
    onCountChange(updated.length)
    await window.api.saveWords(updated)
  }

  /* ── Add word ── */
  async function addWord() {
    const w = newWord.trim()
    if (!w) return
    if (words.some(x => x.word.toLowerCase() === w.toLowerCase())) {
      toast('Already in bucket!'); return
    }
    const entry = {
      id: Date.now(), word: w,
      definition: newDef.trim(),
      source: newSrc.trim(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mastered: false, seen: 0,
    }
    await persist([entry, ...words])
    setNewWord(''); setNewDef(''); setNewSrc('')
    toast(`"${w}" added ✦`)
  }

  /* ── Save edit ── */
  async function saveEdit(id) {
    await persist(words.map(w => w.id === id ? { ...w, definition: editDef.trim(), source: editSrc.trim() } : w))
    setEditId(null); toast('Saved.')
  }

  /* ── Toggle mastered ── */
  async function toggleMastered(id) {
    await persist(words.map(w => w.id === id ? { ...w, mastered: !w.mastered } : w))
  }

  /* ── Delete ── */
  async function deleteWord(id, label) {
    await persist(words.filter(w => w.id !== id))
    toast(`"${label}" removed`)
  }

  /* ── Bulk import ── */
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
      entries.push({ id: Date.now() + added++, word, definition: def, source: '', date, mastered: false, seen: 0 })
    }
    if (!added) { toast('No new words found.'); return }
    await persist([...entries.reverse(), ...words])
    setBulkText(''); setBulkOpen(false)
    toast(`${added} word${added > 1 ? 's' : ''} imported ✦`)
  }

  /* ── Derived list ── */
  const filtered = words
    .filter(w => filter === 'mastered' ? w.mastered : filter === 'learning' ? !w.mastered : true)
    .filter(w =>
      w.word.toLowerCase().includes(search.toLowerCase()) ||
      (w.definition || '').toLowerCase().includes(search.toLowerCase()) ||
      (w.source     || '').toLowerCase().includes(search.toLowerCase())
    )

  const masteredCount = words.filter(w => w.mastered).length
  const learningCount = words.length - masteredCount

  /* ── Render ── */
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '22px 20px 60px' }}>

      {/* ── Bulk Import Modal ── */}
      {bulkOpen && (
        <div
          onClick={() => setBulkOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.72)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()} style={{ background: surface, border: `1px solid ${border}`, borderRadius: radii['2xl'], padding: 28, width: '100%', maxWidth: 500, animation: 'modalScale .25s ease forwards' }}>
            <p style={{ fontSize: 9, fontWeight: 600, color: gold, letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 8 }}>Bulk Import</p>
            <p style={{ fontSize: 12.5, color: textMuted, marginBottom: 14, lineHeight: 1.65 }}>
              One word per line. Add a colon for the definition:<br />
              <span style={{ color: textPrimary, fontFamily: fonts.mono, fontSize: 11.5 }}>Ephemeral: Lasting for a very short time</span>
            </p>
            <textarea
              value={bulkText} onChange={e => setBulkText(e.target.value)}
              rows={9} placeholder={'Laconic\nPernicious: Having a harmful effect\nVoracious: Having a very eager approach'}
              style={{ width: '100%', padding: '11px 13px', borderRadius: radii.lg, background: surface2, border: `1px solid ${border}`, color: textPrimary, fontSize: 13, lineHeight: 1.7, resize: 'vertical' }}
            />
            <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
              <button className="btn-interactive" onClick={runBulk} style={{ flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: gold, color: '#0C0A06', border: 'none' }}>
                Import Words
              </button>
              <button className="btn-interactive" onClick={() => setBulkOpen(false)} style={{ padding: '10px 18px', borderRadius: radii.md, fontSize: 13, background: surface2, color: textMuted, border: `1px solid ${border}` }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Form ── */}
      <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: radii.xl, padding: '20px 20px 17px', marginBottom: 14 }}>
        <p style={{ fontSize: 9, fontWeight: 600, color: gold, letterSpacing: 2.2, textTransform: 'uppercase', marginBottom: 13 }}>
          Add to Bucket
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={newWord} onChange={e => setNewWord(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Word or phrase…"
            style={{ flex: '0 0 155px', padding: '9px 12px', borderRadius: radii.md, background: surface2, border: `1px solid ${border}`, color: textPrimary, fontSize: 14, fontFamily: fonts.serif }}
          />
          <input
            value={newDef} onChange={e => setNewDef(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Definition or example…"
            style={{ flex: '1 1 180px', padding: '9px 12px', borderRadius: radii.md, background: surface2, border: `1px solid ${border}`, color: textPrimary, fontSize: 13.5 }}
          />
          <input
            value={newSrc} onChange={e => setNewSrc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addWord()}
            placeholder="Source (e.g. Daily Star)"
            style={{ flex: '0 0 155px', padding: '9px 12px', borderRadius: radii.md, background: surface2, border: `1px solid ${border}`, color: textPrimary, fontSize: 13 }}
          />
          <button className="btn-interactive" onClick={addWord} style={{ padding: '9px 18px', borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: gold, color: '#0C0A06', border: 'none', whiteSpace: 'nowrap' }}>
            + Add
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 9, flexWrap: 'wrap', gap: 6 }}>
          <p style={{ fontSize: 11, color: textMuted }}>Press Enter to add quickly · Words are randomly shuffled in popups</p>
          <button className="tab-pill" onClick={() => setBulkOpen(true)} style={{ padding: '4px 10px', borderRadius: 6, fontSize: 11, color: gold, background: goldDim, border: `1px solid ${goldBorder}` }}>
            Bulk Import ↗
          </button>
        </div>
      </div>

      {/* ── Filters + Search ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[
            ['all',      `All (${words.length})`],
            ['learning', `Learning (${learningCount})`],
            ['mastered', `Mastered (${masteredCount})`],
          ].map(([v, l]) => (
            <button key={v} className="tab-pill" onClick={() => setFilter(v)} style={{
              padding: '5px 11px', borderRadius: 7, fontSize: 12,
              background: filter === v ? surface2 : 'transparent',
              color:      filter === v ? textPrimary : textMuted,
              border:     filter === v ? `1px solid ${border}` : '1px solid transparent',
            }}>{l}</button>
          ))}
        </div>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search words, definitions, sources…"
          style={{ flex: 1, minWidth: 140, padding: '7px 12px', borderRadius: radii.md, background: surface, border: `1px solid ${border}`, color: textPrimary, fontSize: 13 }}
        />
        {search && (
          <button className="tab-pill" onClick={() => setSearch('')} style={{ padding: '6px 10px', borderRadius: 7, background: surface2, border: `1px solid ${border}`, color: textMuted, fontSize: 12 }}>
            ✕
          </button>
        )}
      </div>

      {/* ── Word List ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {filtered.length === 0 ? (
          <EmptyState isEmpty={words.length === 0} />
        ) : (
          filtered.map(w => (
            <WordRow
              key={w.id}
              word={w}
              index={words.indexOf(w) + 1}
              isEditing={editId === w.id}
              editDef={editDef}   setEditDef={setEditDef}
              editSrc={editSrc}   setEditSrc={setEditSrc}
              onEdit={() => { setEditId(w.id); setEditDef(w.definition || ''); setEditSrc(w.source || '') }}
              onSave={() => saveEdit(w.id)}
              onCancelEdit={() => setEditId(null)}
              onToggleMastered={() => toggleMastered(w.id)}
              onDelete={() => deleteWord(w.id, w.word)}
            />
          ))
        )}
      </div>
    </div>
  )
}

/* ── WordRow sub-component ────────────────────────────────────────────────── */
function WordRow({ word: w, index, isEditing, editDef, setEditDef, editSrc, setEditSrc, onEdit, onSave, onCancelEdit, onToggleMastered, onDelete }) {
  const { gold, goldBorder, surface, surface2, border, textPrimary, textMuted } = colors

  return (
    <div className="word-card" style={{
      display: 'flex', alignItems: 'flex-start', gap: 11,
      background: surface, border: `1px solid ${w.mastered ? 'rgba(201,145,42,0.2)' : border}`,
      borderRadius: radii.lg, padding: '13px 14px',
      opacity: w.mastered ? 0.68 : 1,
    }}>
      {/* Index */}
      <div style={{ width: 22, height: 22, borderRadius: 5, background: surface2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, color: textMuted, flexShrink: 0, marginTop: 2 }}>
        {index}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: fonts.serif, fontSize: 16, fontWeight: 700 }}>{w.word}</span>
          {w.mastered && <span style={{ fontSize: 9.5, color: gold, background: colors.goldDim, border: `1px solid ${goldBorder}`, borderRadius: 5, padding: '1px 6px' }}>mastered</span>}
          {w.source   && <span style={{ fontSize: 10, color: textMuted }}>· {w.source}</span>}
        </div>

        {isEditing ? (
          <div style={{ marginTop: 9 }}>
            <input value={editDef} onChange={e => setEditDef(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave()}
              placeholder="Definition or example…"
              style={{ width: '100%', padding: '7px 10px', borderRadius: radii.md, background: surface2, border: `1px solid ${gold}50`, color: textPrimary, fontSize: 13, marginBottom: 6 }} />
            <input value={editSrc} onChange={e => setEditSrc(e.target.value)} onKeyDown={e => e.key === 'Enter' && onSave()}
              placeholder="Source (optional)…"
              style={{ width: '100%', padding: '7px 10px', borderRadius: radii.md, background: surface2, border: `1px solid ${border}`, color: textPrimary, fontSize: 12.5, marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-interactive" onClick={onSave} style={{ padding: '5px 13px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: gold, color: '#0C0A06', border: 'none' }}>Save</button>
              <button className="btn-interactive" onClick={onCancelEdit} style={{ padding: '5px 11px', borderRadius: 6, fontSize: 12, background: surface2, color: textMuted, border: `1px solid ${border}` }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            {w.definition && <p style={{ fontSize: 12.5, color: textMuted, marginTop: 3, lineHeight: 1.65 }}>{w.definition}</p>}
            {w.seen > 0 && (
              <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 2, background: border, borderRadius: 1 }}>
                  <div className="seen-fill" style={{ height: '100%', width: `${Math.min(100, w.seen * 10)}%`, background: gold, borderRadius: 1, opacity: 0.55 }} />
                </div>
                <span style={{ fontSize: 9.5, color: textMuted }}>seen {w.seen}×</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
        {w.date && <span style={{ fontSize: 10, color: textMuted }}>{w.date}</span>}
        <div style={{ display: 'flex', gap: 4 }}>
          <ActionBtn title={w.mastered ? 'Unmark mastered' : 'Mark as mastered'} onClick={onToggleMastered} active={w.mastered}>✓</ActionBtn>
          <ActionBtn title="Edit" onClick={onEdit}>✎</ActionBtn>
          <button className="btn-delete" title="Delete" onClick={onDelete} style={{ width: 26, height: 26, borderRadius: 6, background: 'transparent', border: `1px solid ${border}`, color: textMuted, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>×</button>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ title, onClick, active, children }) {
  const { gold, goldDim, goldBorder, surface2, border, textMuted } = colors
  return (
    <button className="btn-icon" title={title} onClick={onClick} style={{
      width: 26, height: 26, borderRadius: 6, cursor: 'pointer',
      background: active ? goldDim  : 'transparent',
      border:     active ? `1px solid ${goldBorder}` : `1px solid ${border}`,
      color:      active ? gold     : textMuted,
      fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{children}</button>
  )
}

function EmptyState({ isEmpty }) {
  return (
    <div style={{ textAlign: 'center', padding: '64px 20px', lineHeight: 2.4 }}>
      <p style={{ fontFamily: fonts.serif, fontSize: 22, color: colors.textPrimary }}>
        {isEmpty ? 'Your bucket is empty' : 'No results'}
      </p>
      <p style={{ fontSize: 13, color: colors.textMuted }}>
        {isEmpty ? 'Start adding words from your Daily Star editorials ✦' : 'Try a different search or filter.'}
      </p>
    </div>
  )
}
