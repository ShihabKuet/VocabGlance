import { r as reactExports, j as jsxRuntimeExports, a as radii, c as colors, f as fonts, b as client, R as React } from "./global-rkG7Lyz8.js";
const { gold, goldDim, goldBorder, surface2, border, textPrimary, textMuted, textSubtle } = colors;
function PopupCard() {
  const [payload, setPayload] = reactExports.useState(null);
  const [phase, setPhase] = reactExports.useState("idle");
  const [progress, setProgress] = reactExports.useState(100);
  const progTimer = reactExports.useRef(null);
  const autoClose = reactExports.useRef(null);
  const cardRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    window.api.onShowWord((data) => {
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
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: cardRef,
      className: phase === "out" ? "slide-down" : "slide-up",
      style: {
        margin: 8,
        background: "rgba(10, 12, 18, 0.97)",
        border: `1px solid ${goldBorder}`,
        borderRadius: radii["2xl"],
        padding: "20px 22px 16px",
        boxShadow: [
          `0 0 0 1px rgba(201,145,42,0.06)`,
          `0 24px 64px rgba(0,0,0,0.85)`,
          `0 4px 12px rgba(0,0,0,0.6)`
        ].join(", "),
        // Prevent text selection in popup
        userSelect: "none"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", alignItems: "center", gap: 7 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogoMark, { size: 18 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { style: {
              fontSize: 9,
              letterSpacing: 2.2,
              textTransform: "uppercase",
              color: gold,
              fontWeight: 600,
              fontFamily: fonts.sans
            }, children: "VocabGlance" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => dismiss(null),
              style: {
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: surface2,
                border: "none",
                color: textMuted,
                fontSize: 14,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s"
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.background = "#2A2D3A";
                e.currentTarget.style.color = textPrimary;
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.background = surface2;
                e.currentTarget.style.color = textMuted;
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
          color: textPrimary,
          letterSpacing: wordLen > 12 ? "-0.5px" : 0
        }, children: word.word }),
        word.source && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 10.5, color: textMuted, marginTop: 5, fontStyle: "italic" }, children: [
          "from ",
          word.source
        ] }),
        word.definition && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { height: 1, background: border, margin: "13px 0 11px" } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "def-rev", style: {
            fontSize: 13.5,
            color: textSubtle,
            lineHeight: 1.72,
            fontFamily: fonts.sans
          }, children: word.definition })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: { display: "flex", gap: 7, marginTop: 16 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "btn-feedback",
              onClick: () => dismiss("mastered"),
              style: {
                flex: 1,
                padding: "7px 0",
                borderRadius: radii.md,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                background: goldDim,
                color: gold,
                border: `1px solid ${goldBorder}`
              },
              children: "Got it ✓"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              className: "btn-feedback",
              onClick: () => dismiss("learning"),
              style: {
                flex: 1,
                padding: "7px 0",
                borderRadius: radii.md,
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
                background: surface2,
                color: textMuted,
                border: `1px solid ${border}`
              },
              children: "Still learning"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { marginTop: 14, height: 2, background: border, borderRadius: 1, overflow: "hidden" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "progress-fill", style: { height: "100%", width: `${progress}%`, background: gold, borderRadius: 1 } }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { style: { fontSize: 9.5, color: textMuted, marginTop: 6, textAlign: "right", fontFamily: fonts.sans }, children: [
          queueLength,
          " left in shuffle"
        ] })
      ]
    }
  );
}
function LogoMark({ size = 20 }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
    width: size,
    height: size,
    borderRadius: Math.round(size * 0.27),
    background: "linear-gradient(145deg, #C9912A, #7A5A10)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: fonts.serif,
    fontWeight: 700,
    fontSize: Math.round(size * 0.52),
    color: "#0C0A06",
    flexShrink: 0
  }, children: "V" });
}
client.createRoot(document.getElementById("popup-root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(PopupCard, {}) })
);
