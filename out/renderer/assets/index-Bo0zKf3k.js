import { j as jsxRuntimeExports, c as colors, r as reactExports, a as radii, f as fonts, b as client, R as React } from "./global-rkG7Lyz8.js";
const { bg: bg$1, border: border$3 } = colors;
function TitleBar() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    height: 36,
    background: bg$1,
    borderBottom: `1px solid ${border$3}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 12px",
    flexShrink: 0,
    // Makes the entire bar draggable (Electron specific)
    WebkitAppRegion: "drag"
  }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6, WebkitAppRegion: "no-drag" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WinBtn, { color: "#FFB93E", hoverColor: "#FFA500", onClick: () => window.api.minimizeWindow(), title: "Minimize" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WinBtn, { color: "#3FD265", hoverColor: "#28A745", onClick: () => window.api.maximizeWindow(), title: "Maximize" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(WinBtn, { color: "#FF6058", hoverColor: "#E0443C", onClick: () => window.api.closeWindow(), title: "Close" })
  ] }) });
}
function WinBtn({ color, hoverColor, onClick, title }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      title,
      onClick,
      style: {
        width: 12,
        height: 12,
        borderRadius: "50%",
        background: color,
        border: "none",
        cursor: "pointer",
        transition: "background 0.15s, transform 0.12s"
      },
      onMouseEnter: (e) => {
        e.currentTarget.style.background = hoverColor;
        e.currentTarget.style.transform = "scale(1.15)";
      },
      onMouseLeave: (e) => {
        e.currentTarget.style.background = color;
        e.currentTarget.style.transform = "scale(1)";
      }
    }
  );
}
const {
  gold: gold$2,
  goldDim,
  goldBorder,
  surface: surface$1,
  surface2: surface2$1,
  border: border$2,
  textPrimary: textPrimary$2,
  textMuted: textMuted$2
} = colors;
function BucketTab({ onCountChange, toast }) {
  const [words, setWords] = reactExports.useState([]);
  const [newWord, setNewWord] = reactExports.useState("");
  const [newDef, setNewDef] = reactExports.useState("");
  const [newSrc, setNewSrc] = reactExports.useState("");
  const [search, setSearch] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState("all");
  const [editId, setEditId] = reactExports.useState(null);
  const [editDef, setEditDef] = reactExports.useState("");
  const [editSrc, setEditSrc] = reactExports.useState("");
  const [bulkOpen, setBulkOpen] = reactExports.useState(false);
  const [bulkText, setBulkText] = reactExports.useState("");
  reactExports.useEffect(() => {
    window.api.getWords().then(loadWords);
    window.api.onWordsUpdated(loadWords);
    return () => window.api.removeListeners("words-updated");
  }, []);
  function loadWords(ws) {
    setWords(ws);
    onCountChange(ws.length);
  }
  async function persist(updated) {
    setWords(updated);
    onCountChange(updated.length);
    await window.api.saveWords(updated);
  }
  async function addWord() {
    const w = newWord.trim();
    if (!w) return;
    if (words.some((x) => x.word.toLowerCase() === w.toLowerCase())) {
      toast("Already in bucket!");
      return;
    }
    const entry = {
      id: Date.now(),
      word: w,
      definition: newDef.trim(),
      source: newSrc.trim(),
      date: (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      mastered: false,
      seen: 0
    };
    await persist([entry, ...words]);
    setNewWord("");
    setNewDef("");
    setNewSrc("");
    toast(`"${w}" added ✦`);
  }
  async function saveEdit(id) {
    await persist(words.map((w) => w.id === id ? { ...w, definition: editDef.trim(), source: editSrc.trim() } : w));
    setEditId(null);
    toast("Saved.");
  }
  async function toggleMastered(id) {
    await persist(words.map((w) => w.id === id ? { ...w, mastered: !w.mastered } : w));
  }
  async function deleteWord(id, label) {
    await persist(words.filter((w) => w.id !== id));
    toast(`"${label}" removed`);
  }
  async function runBulk() {
    const lines = bulkText.split("\n").map((l) => l.trim()).filter(Boolean);
    const date = (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const entries = [];
    let added = 0;
    for (const line of lines) {
      const sep = line.indexOf(":");
      const word = (sep > -1 ? line.slice(0, sep) : line).trim();
      const def = (sep > -1 ? line.slice(sep + 1) : "").trim();
      if (!word) continue;
      if (words.some((x) => x.word.toLowerCase() === word.toLowerCase())) continue;
      if (entries.some((x) => x.word.toLowerCase() === word.toLowerCase())) continue;
      entries.push({ id: Date.now() + added++, word, definition: def, source: "", date, mastered: false, seen: 0 });
    }
    if (!added) {
      toast("No new words found.");
      return;
    }
    await persist([...entries.reverse(), ...words]);
    setBulkText("");
    setBulkOpen(false);
    toast(`${added} word${added > 1 ? "s" : ""} imported ✦`);
  }
  const filtered = words.filter((w) => filter === "mastered" ? w.mastered : filter === "learning" ? !w.mastered : true).filter(
    (w) => w.word.toLowerCase().includes(search.toLowerCase()) || (w.definition || "").toLowerCase().includes(search.toLowerCase()) || (w.source || "").toLowerCase().includes(search.toLowerCase())
  );
  const masteredCount = words.filter((w) => w.mastered).length;
  const learningCount = words.length - masteredCount;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 820, margin: "0 auto", padding: "22px 20px 60px" }, children: [
    bulkOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onClick: () => setBulkOpen(false),
        style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => e.stopPropagation(), style: { background: surface$1, border: `1px solid ${border$2}`, borderRadius: radii["2xl"], padding: 28, width: "100%", maxWidth: 500, animation: "modalScale .25s ease forwards" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 9, fontWeight: 600, color: gold$2, letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 8 }, children: "Bulk Import" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 12.5, color: textMuted$2, marginBottom: 14, lineHeight: 1.65 }, children: [
            "One word per line. Add a colon for the definition:",
            /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { color: textPrimary$2, fontFamily: fonts.mono, fontSize: 11.5 }, children: "Ephemeral: Lasting for a very short time" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              value: bulkText,
              onChange: (e) => setBulkText(e.target.value),
              rows: 9,
              placeholder: "Laconic\nPernicious: Having a harmful effect\nVoracious: Having a very eager approach",
              style: { width: "100%", padding: "11px 13px", borderRadius: radii.lg, background: surface2$1, border: `1px solid ${border$2}`, color: textPrimary$2, fontSize: 13, lineHeight: 1.7, resize: "vertical" }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 9, marginTop: 14 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: runBulk, style: { flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: gold$2, color: "#0C0A06", border: "none" }, children: "Import Words" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: () => setBulkOpen(false), style: { padding: "10px 18px", borderRadius: radii.md, fontSize: 13, background: surface2$1, color: textMuted$2, border: `1px solid ${border$2}` }, children: "Cancel" })
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: surface$1, border: `1px solid ${border$2}`, borderRadius: radii.xl, padding: "20px 20px 17px", marginBottom: 14 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 9, fontWeight: 600, color: gold$2, letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 13 }, children: "Add to Bucket" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: newWord,
            onChange: (e) => setNewWord(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && addWord(),
            placeholder: "Word or phrase…",
            style: { flex: "0 0 155px", padding: "9px 12px", borderRadius: radii.md, background: surface2$1, border: `1px solid ${border$2}`, color: textPrimary$2, fontSize: 14, fontFamily: fonts.serif }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: newDef,
            onChange: (e) => setNewDef(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && addWord(),
            placeholder: "Definition or example…",
            style: { flex: "1 1 180px", padding: "9px 12px", borderRadius: radii.md, background: surface2$1, border: `1px solid ${border$2}`, color: textPrimary$2, fontSize: 13.5 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: newSrc,
            onChange: (e) => setNewSrc(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && addWord(),
            placeholder: "Source (e.g. Daily Star)",
            style: { flex: "0 0 155px", padding: "9px 12px", borderRadius: radii.md, background: surface2$1, border: `1px solid ${border$2}`, color: textPrimary$2, fontSize: 13 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: addWord, style: { padding: "9px 18px", borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: gold$2, color: "#0C0A06", border: "none", whiteSpace: "nowrap" }, children: "+ Add" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 9, flexWrap: "wrap", gap: 6 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 11, color: textMuted$2 }, children: "Press Enter to add quickly · Words are randomly shuffled in popups" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "tab-pill", onClick: () => setBulkOpen(true), style: { padding: "4px 10px", borderRadius: 6, fontSize: 11, color: gold$2, background: goldDim, border: `1px solid ${goldBorder}` }, children: "Bulk Import ↗" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 11, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 3 }, children: [
        ["all", `All (${words.length})`],
        ["learning", `Learning (${learningCount})`],
        ["mastered", `Mastered (${masteredCount})`]
      ].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "tab-pill", onClick: () => setFilter(v), style: {
        padding: "5px 11px",
        borderRadius: 7,
        fontSize: 12,
        background: filter === v ? surface2$1 : "transparent",
        color: filter === v ? textPrimary$2 : textMuted$2,
        border: filter === v ? `1px solid ${border$2}` : "1px solid transparent"
      }, children: l }, v)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          value: search,
          onChange: (e) => setSearch(e.target.value),
          placeholder: "Search words, definitions, sources…",
          style: { flex: 1, minWidth: 140, padding: "7px 12px", borderRadius: radii.md, background: surface$1, border: `1px solid ${border$2}`, color: textPrimary$2, fontSize: 13 }
        }
      ),
      search && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "tab-pill", onClick: () => setSearch(""), style: { padding: "6px 10px", borderRadius: 7, background: surface2$1, border: `1px solid ${border$2}`, color: textMuted$2, fontSize: 12 }, children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexDirection: "column", gap: 5 }, children: filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyState, { isEmpty: words.length === 0 }) : filtered.map((w) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      WordRow,
      {
        word: w,
        index: words.indexOf(w) + 1,
        isEditing: editId === w.id,
        editDef,
        setEditDef,
        editSrc,
        setEditSrc,
        onEdit: () => {
          setEditId(w.id);
          setEditDef(w.definition || "");
          setEditSrc(w.source || "");
        },
        onSave: () => saveEdit(w.id),
        onCancelEdit: () => setEditId(null),
        onToggleMastered: () => toggleMastered(w.id),
        onDelete: () => deleteWord(w.id, w.word)
      },
      w.id
    )) })
  ] });
}
function WordRow({ word: w, index, isEditing, editDef, setEditDef, editSrc, setEditSrc, onEdit, onSave, onCancelEdit, onToggleMastered, onDelete }) {
  const { gold: gold2, goldBorder: goldBorder2, surface: surface3, surface2: surface22, border: border2, textPrimary: textPrimary2, textMuted: textMuted2 } = colors;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "word-card", style: {
    display: "flex",
    alignItems: "flex-start",
    gap: 11,
    background: surface3,
    border: `1px solid ${w.mastered ? "rgba(201,145,42,0.2)" : border2}`,
    borderRadius: radii.lg,
    padding: "13px 14px",
    opacity: w.mastered ? 0.68 : 1
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { width: 22, height: 22, borderRadius: 5, background: surface22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9.5, color: textMuted2, flexShrink: 0, marginTop: 2 }, children: index }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: fonts.serif, fontSize: 16, fontWeight: 700 }, children: w.word }),
        w.mastered && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 9.5, color: gold2, background: colors.goldDim, border: `1px solid ${goldBorder2}`, borderRadius: 5, padding: "1px 6px" }, children: "mastered" }),
        w.source && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 10, color: textMuted2 }, children: [
          "· ",
          w.source
        ] })
      ] }),
      isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 9 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: editDef,
            onChange: (e) => setEditDef(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && onSave(),
            placeholder: "Definition or example…",
            style: { width: "100%", padding: "7px 10px", borderRadius: radii.md, background: surface22, border: `1px solid ${gold2}50`, color: textPrimary2, fontSize: 13, marginBottom: 6 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            value: editSrc,
            onChange: (e) => setEditSrc(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && onSave(),
            placeholder: "Source (optional)…",
            style: { width: "100%", padding: "7px 10px", borderRadius: radii.md, background: surface22, border: `1px solid ${border2}`, color: textPrimary2, fontSize: 12.5, marginBottom: 8 }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: onSave, style: { padding: "5px 13px", borderRadius: 6, fontSize: 12, fontWeight: 500, background: gold2, color: "#0C0A06", border: "none" }, children: "Save" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: onCancelEdit, style: { padding: "5px 11px", borderRadius: 6, fontSize: 12, background: surface22, color: textMuted2, border: `1px solid ${border2}` }, children: "Cancel" })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        w.definition && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12.5, color: textMuted2, marginTop: 3, lineHeight: 1.65 }, children: w.definition }),
        w.seen > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { marginTop: 7, display: "flex", alignItems: "center", gap: 6 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, height: 2, background: border2, borderRadius: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "seen-fill", style: { height: "100%", width: `${Math.min(100, w.seen * 10)}%`, background: gold2, borderRadius: 1, opacity: 0.55 } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 9.5, color: textMuted2 }, children: [
            "seen ",
            w.seen,
            "×"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }, children: [
      w.date && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 10, color: textMuted2 }, children: w.date }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { title: w.mastered ? "Unmark mastered" : "Mark as mastered", onClick: onToggleMastered, active: w.mastered, children: "✓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(ActionBtn, { title: "Edit", onClick: onEdit, children: "✎" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-delete", title: "Delete", onClick: onDelete, style: { width: 26, height: 26, borderRadius: 6, background: "transparent", border: `1px solid ${border2}`, color: textMuted2, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }, children: "×" })
      ] })
    ] })
  ] });
}
function ActionBtn({ title, onClick, active, children }) {
  const { gold: gold2, goldDim: goldDim2, goldBorder: goldBorder2, border: border2, textMuted: textMuted2 } = colors;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-icon", title, onClick, style: {
    width: 26,
    height: 26,
    borderRadius: 6,
    cursor: "pointer",
    background: active ? goldDim2 : "transparent",
    border: active ? `1px solid ${goldBorder2}` : `1px solid ${border2}`,
    color: active ? gold2 : textMuted2,
    fontSize: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }, children });
}
function EmptyState({ isEmpty }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { textAlign: "center", padding: "64px 20px", lineHeight: 2.4 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontFamily: fonts.serif, fontSize: 22, color: colors.textPrimary }, children: isEmpty ? "Your bucket is empty" : "No results" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13, color: colors.textMuted }, children: isEmpty ? "Start adding words from your Daily Star editorials ✦" : "Try a different search or filter." })
  ] });
}
const {
  gold: gold$1,
  surface,
  surface2,
  border: border$1,
  textPrimary: textPrimary$1,
  textMuted: textMuted$1,
  danger,
  dangerBg,
  dangerBorder
} = colors;
const INTERVALS = [
  { label: "30 sec", value: 3e4 },
  { label: "1 min", value: 6e4 },
  { label: "5 min", value: 3e5 },
  { label: "15 min", value: 9e5 },
  { label: "30 min", value: 18e5 },
  { label: "1 hour", value: 36e5 }
];
const DURATIONS = [
  { label: "5 sec", value: 5e3 },
  { label: "8 sec", value: 8e3 },
  { label: "12 sec", value: 12e3 },
  { label: "20 sec", value: 2e4 }
];
function SettingsTab({ toast, onEnabledChange }) {
  const [settings, setSettings] = reactExports.useState(null);
  const [words, setWords] = reactExports.useState([]);
  reactExports.useEffect(() => {
    Promise.all([window.api.getSettings(), window.api.getWords()]).then(([s, w]) => {
      setSettings(s);
      setWords(w);
    });
  }, []);
  async function save(patch) {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    onEnabledChange(updated.enabled);
    await window.api.saveSettings(updated);
  }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(words, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `vocabglance-backup-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.json`;
    a.click();
    toast("Backup downloaded.");
  }
  function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!Array.isArray(data)) {
          toast("Invalid file.");
          return;
        }
        await window.api.saveWords(data);
        setWords(data);
        toast(`${data.length} words restored.`);
      } catch {
        toast("Could not parse file.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  if (!settings) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: textMuted$1 }, children: "Loading…" });
  const masteredCount = words.filter((w) => w.mastered).length;
  const totalSeen = words.reduce((s, w) => s + (w.seen || 0), 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { maxWidth: 500, margin: "0 auto", padding: "22px 20px 60px", display: "flex", flexDirection: "column", gap: 13 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Reminder Interval", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 12.5, color: textMuted$1, lineHeight: 1.7, marginBottom: 14 }, children: [
        "A word will slide onto your screen every",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { style: { color: textPrimary$1 }, children: INTERVALS.find((i) => i.value === settings.intervalMs)?.label }),
        " ",
        "— even when VocabGlance is minimised or hidden in the system tray."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 6 }, children: INTERVALS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(OptionBtn, { label: o.label, active: settings.intervalMs === o.value, onClick: () => save({ intervalMs: o.value }) }, o.value)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Popup Display Duration", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12.5, color: textMuted$1, lineHeight: 1.7, marginBottom: 14 }, children: "How long the popup stays on screen before auto-dismissing." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", flexWrap: "wrap", gap: 7 }, children: DURATIONS.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsx(OptionBtn, { label: o.label, active: settings.popupDurationMs === o.value, onClick: () => save({ popupDurationMs: o.value }) }, o.value)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Popup Position", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12.5, color: textMuted$1, marginBottom: 14 }, children: "Which corner of your screen should words pop up from?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "flex", gap: 10 }, children: [["bottom-right", "Bottom Right ↘"], ["bottom-left", "Bottom Left ↙"]].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx(OptionBtn, { label: l, active: settings.position === v, onClick: () => save({ position: v }) }, v)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "General", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 11 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Toggle,
        {
          label: "Reminders enabled",
          description: "Pause or resume all popup reminders.",
          checked: settings.enabled,
          onChange: (v) => save({ enabled: v })
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Toggle,
        {
          label: "Start with Windows",
          description: "Launch VocabGlance automatically when you log in.",
          checked: settings.startWithWindows,
          onChange: (v) => save({ startWithWindows: v })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Preview", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12.5, color: textMuted$1, marginBottom: 14 }, children: "Trigger a popup right now to see how it looks on your screen." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: () => window.api.previewPopup(), style: {
        width: "100%",
        padding: 10,
        borderRadius: radii.md,
        fontSize: 13,
        fontWeight: 500,
        background: surface2,
        color: textPrimary$1,
        border: `1px solid ${border$1}`
      }, children: "Preview Popup Now →" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Bucket Stats", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }, children: [
      ["Total Words", words.length],
      ["Mastered", masteredCount],
      ["Still Learning", words.length - masteredCount],
      ["With Definitions", words.filter((w) => w.definition).length],
      ["With Sources", words.filter((w) => w.source).length],
      ["Total Pop-ups Seen", totalSeen]
    ].map(([label, val]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: surface2, borderRadius: radii.md, padding: "12px 14px" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 10, color: textMuted$1, marginBottom: 4 }, children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontFamily: fonts.serif, fontSize: 22, fontWeight: 700 }, children: val })
    ] }, label)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Section, { title: "Backup & Restore", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 12.5, color: textMuted$1, lineHeight: 1.7, marginBottom: 14 }, children: "Export your entire bucket as JSON — perfect for switching devices or keeping an offline backup." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 9 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: exportJSON, style: { flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: gold$1, color: "#0C0A06", border: "none" }, children: "Export JSON ↓" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "btn-interactive", style: { flex: 1, padding: 10, borderRadius: radii.md, fontSize: 13, fontWeight: 500, background: surface2, color: textPrimary$1, border: `1px solid ${border$1}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }, children: [
          "Import JSON ↑",
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ".json", onChange: importJSON, style: { display: "none" } })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Section, { title: "Danger Zone", accentColor: colors.danger, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 9, flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: async () => {
        if (!window.confirm("Reset all mastered flags and seen counts? Words are kept.")) return;
        const reset = words.map((w) => ({ ...w, mastered: false, seen: 0 }));
        await window.api.saveWords(reset);
        setWords(reset);
        toast("Progress reset.");
      }, style: { padding: "9px 14px", borderRadius: radii.md, fontSize: 13, background: dangerBg, color: danger, border: `1px solid ${dangerBorder}` }, children: "Reset Progress" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-interactive", onClick: async () => {
        if (!window.confirm("Delete ALL words? This cannot be undone.")) return;
        await window.api.saveWords([]);
        setWords([]);
        toast("Bucket cleared.");
      }, style: { padding: "9px 14px", borderRadius: radii.md, fontSize: 13, background: dangerBg, color: danger, border: `1px solid ${dangerBorder}` }, children: "Clear All Words" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { textAlign: "center", paddingTop: 8 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 11, color: textMuted$1, lineHeight: 2 }, children: [
      "VocabGlance v1.0 · Built with Electron + React",
      /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
      "Data stored locally — works fully offline."
    ] }) })
  ] });
}
function Section({ title, accentColor = gold$1, children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { background: surface, border: `1px solid ${border$1}`, borderRadius: radii.xl, padding: 22 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 9, fontWeight: 600, color: accentColor, letterSpacing: 2.2, textTransform: "uppercase", marginBottom: 18 }, children: title }),
    children
  ] });
}
function OptionBtn({ label, active, onClick }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick, style: {
    padding: "7px 14px",
    borderRadius: radii.md,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    background: active ? gold$1 : surface2,
    color: active ? "#0C0A06" : textMuted$1,
    border: `1px solid ${active ? gold$1 : border$1}`,
    transition: "all 0.15s"
  }, children: label });
}
function Toggle({ label, description, checked, onChange }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "flex-start", gap: 14, justifyContent: "space-between" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 13.5, color: textPrimary$1, marginBottom: 3 }, children: label }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { style: { fontSize: 11.5, color: textMuted$1, lineHeight: 1.6 }, children: description })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        onClick: () => onChange(!checked),
        style: {
          width: 40,
          height: 22,
          borderRadius: 11,
          cursor: "pointer",
          background: checked ? gold$1 : surface2,
          border: `1px solid ${checked ? gold$1 : border$1}`,
          position: "relative",
          flexShrink: 0,
          transition: "all 0.2s"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
          position: "absolute",
          top: 3,
          left: checked ? 20 : 3,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: checked ? "#0C0A06" : textMuted$1,
          transition: "left 0.2s"
        } })
      }
    )
  ] });
}
const { bg, border, gold, textPrimary, textMuted } = colors;
function App() {
  const [tab, setTab] = reactExports.useState("bucket");
  const [wordCount, setWordCount] = reactExports.useState(0);
  const [enabled, setEnabled] = reactExports.useState(true);
  const [notif, setNotif] = reactExports.useState("");
  reactExports.useEffect(() => {
    window.api.getSettings().then((s) => setEnabled(s.enabled));
    window.api.onSettingsChanged((s) => setEnabled(s.enabled));
    return () => window.api.removeListeners("settings-changed");
  }, []);
  function toast(msg) {
    setNotif(msg);
    setTimeout(() => setNotif(""), 2600);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    background: bg,
    color: textPrimary,
    fontFamily: fonts.sans,
    overflow: "hidden"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(TitleBar, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      height: 52,
      borderBottom: `1px solid ${border}`,
      flexShrink: 0
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 10 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LogoMark, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontFamily: fonts.serif, fontSize: 18, fontWeight: 700, letterSpacing: "-0.2px" }, children: "VocabGlance" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          fontSize: 10,
          color: textMuted,
          background: colors.surface2,
          border: `1px solid ${border}`,
          borderRadius: 5,
          padding: "1px 7px"
        }, children: "v1.0" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { style: { display: "flex", gap: 2 }, children: [["bucket", "Word Bucket"], ["settings", "Settings"]].map(([v, l]) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "tab-pill", onClick: () => setTab(v), style: {
        padding: "5px 13px",
        borderRadius: 7,
        fontSize: 12.5,
        fontWeight: 500,
        cursor: "pointer",
        background: tab === v ? colors.surface2 : "transparent",
        color: tab === v ? textPrimary : textMuted,
        border: tab === v ? `1px solid ${border}` : "1px solid transparent"
      }, children: l }, v)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: enabled ? gold : textMuted,
          display: "block",
          animation: enabled ? "pulse 2.4s ease infinite" : "none"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { style: { fontSize: 11.5, color: textMuted }, children: [
          wordCount,
          " words · ",
          enabled ? "Active" : "Paused"
        ] })
      ] })
    ] }),
    notif && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      position: "fixed",
      top: 18,
      left: "50%",
      animation: "notifIn .24s ease forwards",
      background: colors.surface2,
      border: `1px solid ${border}`,
      borderRadius: 9,
      padding: "8px 18px",
      fontSize: 12.5,
      color: textPrimary,
      zIndex: 999,
      boxShadow: "0 8px 28px rgba(0,0,0,.55)",
      whiteSpace: "nowrap"
    }, children: notif }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, overflowY: "auto", overflowX: "hidden" }, children: tab === "bucket" ? /* @__PURE__ */ jsxRuntimeExports.jsx(BucketTab, { onCountChange: setWordCount, toast }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsTab, { toast, onEnabledChange: setEnabled }) })
  ] });
}
function LogoMark() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "linear-gradient(145deg, #C9912A, #7A5A10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.serif,
    fontWeight: 700,
    fontSize: 15,
    color: "#0C0A06"
  }, children: "V" });
}
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) })
);
