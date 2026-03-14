
import { useState, useEffect } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
type Beam = {
  id: string;
  name: string;
  height: number;
  flange: number;
  web: number;
  flangeT: number;
  weight: number;
};

type FractionOption = {
  label: string;
  mm: number;
};

type SearchInput = {
  height: number;
  flange: number;
  web: number | null;
  flangeT: number | null;
};

type ClosestResult = {
  beam: Beam;
  dist: number;
};

type BeamSVGProps = {
  heightRatio?: number;
  flangeRatio?: number;
  webRatio?: number;
  flangeTRatio?: number;
  size?: number;
};

type FractionPickerProps = {
  label: string;
  selectedMM: number | null;
  onSelect: (value: number | null) => void;
  isMobile: boolean;
};

// ── Catalog (internal: mm) ───────────────────────────────────────────────────
const BEAMS: Beam[] = [
  { id: "IPR-100", name: "IPR 100", height: 100, flange: 50, web: 4.5, flangeT: 6.8, weight: 9.7 },
  { id: "IPR-120", name: "IPR 120", height: 120, flange: 58, web: 4.8, flangeT: 7.3, weight: 11.9 },
  { id: "IPR-140", name: "IPR 140", height: 140, flange: 66, web: 5.0, flangeT: 7.8, weight: 14.3 },
  { id: "IPR-160", name: "IPR 160", height: 160, flange: 74, web: 5.0, flangeT: 8.1, weight: 17.9 },
  { id: "IPR-180", name: "IPR 180", height: 180, flange: 82, web: 5.3, flangeT: 8.7, weight: 21.9 },
  { id: "IPR-200", name: "IPR 200", height: 200, flange: 90, web: 5.6, flangeT: 9.0, weight: 26.2 },
  { id: "IPR-220", name: "IPR 220", height: 220, flange: 98, web: 5.9, flangeT: 9.2, weight: 31.1 },
  { id: "IPR-240", name: "IPR 240", height: 240, flange: 106, web: 6.2, flangeT: 9.5, weight: 36.2 },
  { id: "IPR-270", name: "IPR 270", height: 270, flange: 135, web: 6.6, flangeT: 10.2, weight: 45.0 },
  { id: "IPR-300", name: "IPR 300", height: 300, flange: 150, web: 7.1, flangeT: 10.7, weight: 56.9 },
  { id: "IPR-330", name: "IPR 330", height: 330, flange: 160, web: 7.5, flangeT: 11.5, weight: 66.5 },
  { id: "IPR-360", name: "IPR 360", height: 360, flange: 170, web: 8.0, flangeT: 12.7, weight: 79.7 },
  { id: "IPR-400", name: "IPR 400", height: 400, flange: 180, web: 8.6, flangeT: 13.5, weight: 92.4 },
  { id: "IPR-450", name: "IPR 450", height: 450, flange: 190, web: 9.4, flangeT: 14.6, weight: 110.0 },
  { id: "IPR-500", name: "IPR 500", height: 500, flange: 200, web: 10.2, flangeT: 16.0, weight: 130.0 },
  { id: "IPR-550", name: "IPR 550", height: 550, flange: 210, web: 11.1, flangeT: 17.2, weight: 150.0 },
  { id: "IPR-600", name: "IPR 600", height: 600, flange: 220, web: 12.0, flangeT: 19.0, weight: 174.0 },
  { id: "W8x31", name: "W8×31", height: 203, flange: 203, web: 7.2, flangeT: 11.0, weight: 46.1 },
  { id: "W10x49", name: "W10×49", height: 253, flange: 254, web: 8.6, flangeT: 14.2, weight: 72.9 },
  { id: "W12x65", name: "W12×65", height: 306, flange: 305, web: 9.9, flangeT: 15.4, weight: 96.7 },
];

// ── Fractional inch options for thickness fields ─────────────────────────────
const FRAC_OPTIONS: FractionOption[] = [
  { label: '3/16"', mm: (3 / 16) * 25.4 },
  { label: '1/4"', mm: (1 / 4) * 25.4 },
  { label: '5/16"', mm: (5 / 16) * 25.4 },
  { label: '3/8"', mm: (3 / 8) * 25.4 },
  { label: '7/16"', mm: (7 / 16) * 25.4 },
  { label: '1/2"', mm: (1 / 2) * 25.4 },
  { label: '9/16"', mm: (9 / 16) * 25.4 },
  { label: '5/8"', mm: (5 / 8) * 25.4 },
  { label: '3/4"', mm: (3 / 4) * 25.4 },
];

// ── Unit helpers ─────────────────────────────────────────────────────────────
const CM_TO_MM = 10;
const IN_TO_MM = 25.4;

function toMM(val: number, unit: string): number {
  if (unit === "cm") return val * CM_TO_MM;
  if (unit === "in") return val * IN_TO_MM;
  return val;
}

function fromMM(val: number, unit: string): number {
  if (unit === "cm") return parseFloat((val / 10).toFixed(2));
  if (unit === "in") return parseFloat((val / 25.4).toFixed(3));
  return val;
}

// ── Matching logic ────────────────────────────────────────────────────────────
function computeRanges(beams: Beam[]) {
  return {
    height: { min: Math.min(...beams.map((b) => b.height)), max: Math.max(...beams.map((b) => b.height)) },
    flange: { min: Math.min(...beams.map((b) => b.flange)), max: Math.max(...beams.map((b) => b.flange)) },
    web: { min: Math.min(...beams.map((b) => b.web)), max: Math.max(...beams.map((b) => b.web)) },
    flangeT: { min: Math.min(...beams.map((b) => b.flangeT)), max: Math.max(...beams.map((b) => b.flangeT)) },
  };
}

function normalize(v: number, min: number, max: number): number {
  return max === min ? 0 : (v - min) / (max - min);
}

function beamDistance(input: SearchInput, beam: Beam, ranges: ReturnType<typeof computeRanges>): number {
  const dH =
    normalize(input.height, ranges.height.min, ranges.height.max) -
    normalize(beam.height, ranges.height.min, ranges.height.max);
  const dF =
    normalize(input.flange, ranges.flange.min, ranges.flange.max) -
    normalize(beam.flange, ranges.flange.min, ranges.flange.max);
  const dW =
    input.web != null
      ? normalize(input.web, ranges.web.min, ranges.web.max) -
        normalize(beam.web, ranges.web.min, ranges.web.max)
      : 0;
  const dFT =
    input.flangeT != null
      ? normalize(input.flangeT, ranges.flangeT.min, ranges.flangeT.max) -
        normalize(beam.flangeT, ranges.flangeT.min, ranges.flangeT.max)
      : 0;

  return Math.sqrt(dH * dH * 1.5 + dF * dF * 1.2 + dW * dW * 0.8 + dFT * dFT * 0.8);
}

function findClosest(input: SearchInput, beams: Beam[], top = 4): ClosestResult[] {
  const ranges = computeRanges(beams);
  return beams
    .map((b) => ({ beam: b, dist: beamDistance(input, b, ranges) }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, top);
}

// ── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile(): boolean {
  const [mobile, setMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 640);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return mobile;
}

// ── Beam SVG ──────────────────────────────────────────────────────────────────
function BeamSVG({
  heightRatio = 0.5,
  flangeRatio = 0.5,
  webRatio = 0.4,
  flangeTRatio = 0.4,
  size = 160,
}: BeamSVGProps): JSX.Element {
  const W = size;
  const H = size * 1.15;
  const fw = size * 0.28 + flangeRatio * size * 0.44;
  const bh = size * 0.26 + heightRatio * size * 0.5;
  const wt = Math.max(4, size * 0.028 + webRatio * size * 0.032);
  const ft = Math.max(5, size * 0.032 + flangeTRatio * size * 0.03);
  const cx = W / 2;
  const top = (H - bh) / 2;
  const bot = top + bh;
  const T = "all 0.4s cubic-bezier(.4,0,.2,1)";

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ overflow: "visible", display: "block", transition: T }}>
      <defs>
        <linearGradient id="sg4" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#edf0f4" />
          <stop offset="40%" stopColor="#cdd4dc" />
          <stop offset="60%" stopColor="#b8c2cc" />
          <stop offset="100%" stopColor="#8a9aaa" />
        </linearGradient>
        <linearGradient id="wg4" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#9aaab8" />
          <stop offset="50%" stopColor="#c8d4de" />
          <stop offset="100%" stopColor="#9aaab8" />
        </linearGradient>
        <filter id="sh4">
          <feDropShadow dx="1" dy="3" stdDeviation="3" floodOpacity="0.13" />
        </filter>
      </defs>
      <rect x={cx - fw / 2} y={top} width={fw} height={ft} fill="url(#sg4)" rx="1.5" filter="url(#sh4)" style={{ transition: T }} />
      <rect x={cx - wt / 2} y={top + ft} width={wt} height={bh - ft * 2} fill="url(#wg4)" style={{ transition: T }} />
      <rect x={cx - fw / 2} y={bot - ft} width={fw} height={ft} fill="url(#sg4)" rx="1.5" filter="url(#sh4)" style={{ transition: T }} />
      <line x1={cx - fw / 2 - 13} y1={top} x2={cx - fw / 2 - 13} y2={bot} stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="3,2" />
      <line x1={cx - fw / 2 - 17} y1={top} x2={cx - fw / 2 - 9} y2={top} stroke="#cbd5e1" strokeWidth="0.7" />
      <line x1={cx - fw / 2 - 17} y1={bot} x2={cx - fw / 2 - 9} y2={bot} stroke="#cbd5e1" strokeWidth="0.7" />
      <line x1={cx - fw / 2} y1={top - 12} x2={cx + fw / 2} y2={top - 12} stroke="#cbd5e1" strokeWidth="0.7" strokeDasharray="3,2" />
      <line x1={cx - fw / 2} y1={top - 16} x2={cx - fw / 2} y2={top - 8} stroke="#cbd5e1" strokeWidth="0.7" />
      <line x1={cx + fw / 2} y1={top - 16} x2={cx + fw / 2} y2={top - 8} stroke="#cbd5e1" strokeWidth="0.7" />
    </svg>
  );
}

// ── Fraction pill selector ────────────────────────────────────────────────────
function FractionPicker({ label, selectedMM, onSelect, isMobile }: FractionPickerProps): JSX.Element {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 10, gap: 6 }}>
        <label style={{ fontSize: 11, fontWeight: 500, color: "#94a3b8", letterSpacing: "0.09em", textTransform: "uppercase" }}>
          {label}
        </label>
        <span
          style={{
            fontSize: 9,
            fontWeight: 500,
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            background: "#f1f5f9",
            color: "#94a3b8",
            padding: "2px 6px",
            borderRadius: 4,
          }}
        >
          opcional
        </span>
      </div>

      <div
        style={{
          display: "flex",
          gap: 7,
          overflowX: "auto",
          paddingBottom: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <button
          onClick={() => onSelect(null)}
          style={{
            flexShrink: 0,
            padding: isMobile ? "9px 14px" : "8px 13px",
            borderRadius: 10,
            border: `1.5px solid ${selectedMM === null ? "#0f172a" : "#e2e8f0"}`,
            background: selectedMM === null ? "#0f172a" : "white",
            color: selectedMM === null ? "white" : "#94a3b8",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            transition: "all 0.15s",
            minHeight: isMobile ? 42 : 38,
            minWidth: isMobile ? 44 : 40,
          }}
        >
          —
        </button>

        {FRAC_OPTIONS.map(({ label: fl, mm }) => {
          const active = selectedMM !== null && Math.abs(selectedMM - mm) < 0.01;
          return (
            <button
              key={fl}
              onClick={() => onSelect(mm)}
              style={{
                flexShrink: 0,
                padding: isMobile ? "9px 14px" : "8px 13px",
                borderRadius: 10,
                border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`,
                background: active ? "#0f172a" : "white",
                color: active ? "white" : "#334155",
                fontSize: isMobile ? 14 : 13,
                fontWeight: active ? 500 : 400,
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                transition: "all 0.15s",
                letterSpacing: "-0.01em",
                minHeight: isMobile ? 42 : 38,
                whiteSpace: "nowrap",
              }}
            >
              {fl}
            </button>
          );
        })}
      </div>

      <div style={{ fontSize: 11, color: "#d1d8e0", marginTop: 6, paddingLeft: 2, fontFamily: "'DM Mono', monospace" }}>
        {selectedMM !== null ? `${selectedMM.toFixed(2)} mm` : "Sin seleccionar"}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App(): JSX.Element {
  const isMobile = useIsMobile();

  const [unit, setUnit] = useState<string>("in");
  const [height, setHeight] = useState<string>("");
  const [flange, setFlange] = useState<string>("");
  const [webMM, setWebMM] = useState<number | null>(null);
  const [flangeTMM, setFlangeTMM] = useState<number | null>(null);
  const [results, setResults] = useState<ClosestResult[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<Beam | null>(null);

  const heightMM = height ? toMM(parseFloat(height), unit) : null;
  const flangeMM = flange ? toMM(parseFloat(flange), unit) : null;

  const heightRatio = heightMM ? Math.max(0, Math.min(1, (heightMM - 100) / 500)) : 0.3;
  const flangeRatio = flangeMM ? Math.max(0, Math.min(1, (flangeMM - 50) / 170)) : 0.4;
  const webRatio = webMM ? Math.max(0, Math.min(1, (webMM - 4.5) / 8)) : 0.4;
  const flangeTRatio = flangeTMM ? Math.max(0, Math.min(1, (flangeTMM - 6.8) / 13)) : 0.4;

  const canSearch = !!(height && flange && !loading);

  function handleSearch(): void {
    if (!canSearch || heightMM == null || flangeMM == null) return;

    setLoading(true);
    setSelected(null);

    setTimeout(() => {
      setResults(
        findClosest(
          {
            height: heightMM,
            flange: flangeMM,
            web: webMM,
            flangeT: flangeTMM,
          },
          BEAMS,
          4
        )
      );
      setSearched(true);
      setLoading(false);
    }, 420);
  }

  function handleUnitToggle(newUnit: string): void {
    if (newUnit === unit) return;

    const conv = (val: string): string => {
      const v = parseFloat(val);
      if (isNaN(v)) return "";
      return String(fromMM(toMM(v, unit), newUnit));
    };

    if (height) setHeight(conv(height));
    if (flange) setFlange(conv(flange));
    setUnit(newUnit);
  }

  const dv = (mmVal: number): number => fromMM(mmVal, unit);
  const u = unit;
  const beamSize = isMobile ? 128 : 165;

  function fracLabel(mm: number | null): string {
    if (mm == null) return "—";
    let best = FRAC_OPTIONS[0];
    let bestD = Infinity;

    for (const o of FRAC_OPTIONS) {
      const d = Math.abs(o.mm - mm);
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    }

    return bestD < 1 ? best.label : `${mm.toFixed(1)} mm`;
  }

  const inputStyle = (hasVal: string) => ({
    width: "100%",
    padding: isMobile ? "14px 46px 14px 14px" : "12px 46px 12px 14px",
    border: `1.5px solid ${hasVal ? "#0f172a" : "#e2e8f0"}`,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: 300,
    color: "#0f172a",
    fontFamily: "'DM Mono', monospace",
    outline: "none",
    background: "white",
    WebkitAppearance: "none" as const,
    MozAppearance: "textfield" as const,
    transition: "border-color 0.2s",
    display: "block",
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        fontFamily: "'DM Sans', -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { -webkit-text-size-adjust:100%; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; }
        input[type=number] { -moz-appearance:textfield; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform:rotate(360deg); } }
        .rc   { animation: fadeUp 0.3s ease both; }
        .sbtn:active { transform:scale(0.98); }
        button, input { -webkit-tap-highlight-color:transparent; }
        * { -webkit-font-smoothing:antialiased; }
        div::-webkit-scrollbar { display:none; }
      `}</style>

      <header
        style={{
          background: "white",
          borderBottom: "1px solid #eaecf0",
          padding: isMobile ? "14px 18px" : "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              background: "#0f172a",
              borderRadius: 9,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
              <rect x="0" y="0" width="16" height="3.5" fill="white" rx="0.6" />
              <rect x="6.25" y="3.5" width="3.5" height="9" fill="white" />
              <rect x="0" y="12.5" width="16" height="3.5" fill="white" rx="0.6" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#0f172a", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Surtiaceros
            </div>
            <div
              style={{
                fontSize: 10,
                color: "#94a3b8",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Identificador de Perfiles
            </div>
          </div>
        </div>
        {!isMobile && <div style={{ fontSize: 12, color: "#94a3b8" }}>NMX-B-290 · Mercado Mexicano</div>}
      </header>

      <main
        style={{
          flex: 1,
          padding: isMobile ? "28px 16px 60px" : "48px 24px 80px",
          maxWidth: 640,
          width: "100%",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: isMobile ? 22 : 36,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: isMobile ? 27 : 36,
              fontWeight: 300,
              color: "#0f172a",
              letterSpacing: "-0.03em",
              lineHeight
