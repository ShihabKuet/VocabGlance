import { r as reactExports, d as darkTheme, l as lightTheme, j as jsxRuntimeExports, a as radii, f as fonts, c as client, R as React } from "./global-BOecgksB.js";
function PopupCard() {
  const [payload, setPayload] = reactExports.useState(null);
  const [phase, setPhase] = reactExports.useState("idle");
  const [progress, setProgress] = reactExports.useState(100);
  const [colors, setColors] = reactExports.useState(darkTheme);
  const progTimer = reactExports.useRef(null);
  const autoClose = reactExports.useRef(null);
  const cardRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    window.api.onShowWord((data) => {
      setColors(data.isDark ? darkTheme : lightTheme);
      setPayload(data);
      setPhase("in");
      setProgress(100);
      requestAnimationFrame(() => {
        setTimeout(() => {
          const h = cardRef.current?.offsetHeight;
          if (h) window.api.resizePopup(h + 16);
        }, 80);
      });
      const t0 = Date.now();
      progTimer.current = setInterval(() => {
        setProgress(Math.max(0, 100 - (Date.now() - t0) / data.duration * 100));
      }, 50);
      autoClose.current = setTimeout(() => dismiss(null), data.duration);
    });
    return () => window.api.removeListeners("show-word");
  }, []);
  function dismiss(feedback) {
    clearInterval(progTimer.current);
    clearTimeout(autoClose.current);
    if (feedback === "mastered" && payload?.word?.id) {
      window.api.markMastered(payload.word.id);
    }
    setPhase("out");
    setTimeout(() => {
      setPayload(null);
      setPhase("idle");
      window.api.closePopup();
    }, 310);
  }
  if (phase === "idle" || !payload) return null;
  const { word, queueLength } = payload;
  const wordLen = word.word?.length || 0;
  colors.name === "dark";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: cardRef,
      className: phase === "out" ? "slide-down" : "slide-up",
      style: {
        margin: 8,
        background: colors.popupBg,
        border: `1px solid ${colors.popupBorder}`,
        borderRadius: radii["2xl"],
        padding: "20px 22px 16px",
        boxShadow: colors.popupShadow,
        userSelect: "none",
        // Smooth theme-specific border
        transition: "background 0.25s ease, border-color 0.25s ease"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
              width: 17,
              height: 17,
              borderRadius: 4,
              background: "linear-gradient(145deg, #C9912A, #7A5A10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: fonts.serif,
              fontSize: 9,
              fontWeight: 700,
              color: "#0C0A06"
            }, children: "V" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 9, letterSpacing: 2.2, textTransform: "uppercase", color: colors.gold, fontWeight: 600, fontFamily: fonts.sans }, children: "VocabGlance" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => dismiss(null),
              style: {
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: colors.surface2,
                border: "none",
                color: colors.textMuted,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s"
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.background = colors.surface3;
                e.currentTarget.style.color = colors.textPrimary;
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.background = colors.surface2;
                e.currentTarget.style.color = colors.textMuted;
              },
              children: "×"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "word-rev", style: {
          fontFamily: fonts.serif,
          fontSize: wordLen > 16 ? 22 : wordLen > 12 ? 28 : wordLen > 8 ? 33 : 38,
          fontWeight: 700,
          lineHeight: 1.1,
          color: colors.textPrimary,
          letterSpacing: wordLen > 12 ? "-0.5px" : 0
        }, children: word.word }),
        word.pronunciation && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 11, color: colors.textMuted, marginTop: 5, fontStyle: "italic", letterSpacing: "0.3px" }, children: [
          "/",
          word.pronunciation,
          "/"
        ] }),
        word.definition && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 1, background: colors.border, margin: "13px 0 11px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "def-rev", style: { fontSize: 13.5, color: colors.textSubtle, lineHeight: 1.72, fontFamily: fonts.sans }, children: word.definition })
        ] }),
        word.synonyms && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap", marginTop: 10 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: { fontSize: 9.5, color: colors.textMuted, textTransform: "uppercase", letterSpacing: 1 }, children: "syn" }),
          word.synonyms.split(",").map((s) => s.trim()).filter(Boolean).map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
            fontSize: 11,
            color: colors.gold,
            background: colors.goldDim,
            border: `1px solid ${colors.goldBorder}`,
            borderRadius: 4,
            padding: "1px 7px"
          }, children: s }, s))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 7, marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-feedback", onClick: () => dismiss("mastered"), style: {
            flex: 1,
            padding: "7px 0",
            borderRadius: radii.md,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            background: colors.goldDim,
            color: colors.gold,
            border: `1px solid ${colors.goldBorder}`
          }, children: "Got it ✓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "btn-feedback", onClick: () => dismiss("learning"), style: {
            flex: 1,
            padding: "7px 0",
            borderRadius: radii.md,
            fontSize: 12,
            fontWeight: 500,
            cursor: "pointer",
            background: colors.surface2,
            color: colors.textMuted,
            border: `1px solid ${colors.border}`
          }, children: "Still learning" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 14, height: 2, background: colors.border, borderRadius: 1, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-fill", style: { height: "100%", width: `${progress}%`, background: colors.gold, borderRadius: 1 } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 9.5, color: colors.textMuted, marginTop: 6, textAlign: "right", fontFamily: fonts.sans }, children: [
          queueLength,
          " left in shuffle"
        ] })
      ]
    }
  );
}
client.createRoot(document.getElementById("popup-root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PopupCard, {}) })
);
