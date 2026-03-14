import { useState, useEffect, type CSSProperties, type JSX } from "react";
import { BEAMS, type Beam } from "./BEAMS_catalog_final";

// ── Types ────────────────────────────────────────────────────────────────────
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

type Ranges = {
  height: { min: number; max: number };
  flange: { min: number; max: number };
  web: { min: number; max: number };
  flangeT: { min: number; max: number };
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

const CM_TO_MM = 10;
const IN_TO_MM = 25.4;
const LENGTH_OPTIONS = [
  { label: "20 ft", feet: 20, meters: 6.096 },
  { label: "40 ft", feet: 40, meters: 12.192 },
] as const;
const PRICE_PER_KG_MXN = 40;

function toMM(val: number, unit: "cm" | "in"): number {
  if (unit === "cm") return val * CM_TO_MM;
  return val * IN_TO_MM;
}

function fromMM(val: number, unit: "cm" | "in"): number {
  if (unit === "cm") return parseFloat((val / 10).toFixed(2));
  return parseFloat((val / 25.4).toFixed(3));
}

function formatMXN(value: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(value);
}

function computeRanges(beams: Beam[]): Ranges {
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

function beamDistance(input: SearchInput, beam: Beam, ranges: Ranges): number {
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
          type="button"
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
              type="button"
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

export default function App(): JSX.Element {
  const isMobile = useIsMobile();

  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [height, setHeight] = useState<string>("");
  const [flange, setFlange] = useState<string>("");
  const [webMM, setWebMM] = useState<number | null>(null);
  const [flangeTMM, setFlangeTMM] = useState<number | null>(null);
  const [selectedLengthFeet, setSelectedLengthFeet] = useState<20 | 40>(20);

  const [results, setResults] = useState<ClosestResult[]>([]);
  const [searched, setSearched] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [selected, setSelected] = useState<Beam | null>(null);

  const heightMM = height ? toMM(parseFloat(height), unit) : null;
  const flangeMM = flange ? toMM(parseFloat(flange), unit) : null;

  const heightRatio = heightMM ? Math.max(0, Math.min(1, (heightMM - 100) / 1000)) : 0.3;
  const flangeRatio = flangeMM ? Math.max(0, Math.min(1, (flangeMM - 100) / 350)) : 0.4;
  const webRatio = webMM ? Math.max(0, Math.min(1, (webMM - 4.5) / 20)) : 0.4;
  const flangeTRatio = flangeTMM ? Math.max(0, Math.min(1, (flangeTMM - 6.8) / 35)) : 0.4;

  const canSearch = !!(height && flange && !loading);

  const selectedLength = LENGTH_OPTIONS.find((x) => x.feet === selectedLengthFeet) ?? LENGTH_OPTIONS[0];

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

  function handleUnitToggle(newUnit: "in" | "cm"): void {
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

  function totalWeightKg(beam: Beam): number {
    return beam.weight * selectedLength.meters;
  }

  function totalPriceMXN(beam: Beam): number {
    return totalWeightKg(beam) * PRICE_PER_KG_MXN;
  }

  const inputStyle = (hasVal: string): CSSProperties => ({
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
    WebkitAppearance: "none",
    MozAppearance: "textfield" as CSSProperties["MozAppearance"],
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
        @keyframes spin { to { transform:rotate(360deg); } }
        .rc { animation: fadeUp 0.3s ease both; }
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
              Identificador de Vigas I
            </div>
          </div>
        </div>

        {!isMobile && <div style={{ fontSize: 12, color: "#94a3b8" }}>Precio: 40 MXN/kg IVA incluido</div>}
      </header>

      <main
        style={{
          flex: 1,
          padding: isMobile ? "28px 16px 60px" : "48px 24px 80px",
          maxWidth: 720,
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
              lineHeight: 1.2,
              marginBottom: 10,
            }}
          >
            {isMobile ? (
              <>
                Encuentra tu viga I
                <br />
                y calcula el precio
              </>
            ) : (
              "Encuentra tu viga I y calcula el precio"
            )}
          </h1>

          <p
            style={{
              fontSize: isMobile ? 14 : 15,
              color: "#64748b",
              lineHeight: 1.6,
              maxWidth: 420,
              margin: "0 auto",
            }}
          >
            Ingresa las dimensiones y te mostramos la viga más cercana, el peso total para 20 ft o 40 ft y su precio final.
          </p>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: isMobile ? 18 : 22,
            border: "1px solid #e8ecf0",
            padding: isMobile ? "22px 18px 28px" : "36px 32px 42px",
            boxShadow: "0 2px 20px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 22 : 28,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#cbd5e1", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Unidad — altura &amp; patín
            </span>

            <div style={{ display: "flex", background: "#f1f5f9", borderRadius: 10, padding: 3, gap: 2 }}>
              {(["in", "cm"] as const).map((uu) => (
                <button
                  key={uu}
                  type="button"
                  onClick={() => handleUnitToggle(uu)}
                  style={{
                    padding: isMobile ? "9px 18px" : "6px 16px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: "0.04em",
                    transition: "all 0.15s",
                    background: unit === uu ? "white" : "transparent",
                    color: unit === uu ? "#0f172a" : "#94a3b8",
                    boxShadow: unit === uu ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                    minWidth: isMobile ? 50 : 44,
                    minHeight: isMobile ? 40 : 34,
                  }}
                >
                  {uu}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <BeamSVG
              heightRatio={heightRatio}
              flangeRatio={flangeRatio}
              webRatio={webRatio}
              flangeTRatio={flangeTRatio}
              size={beamSize}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: isMobile ? 14 : 16,
            }}
          >
            {[
              {
                label: "Altura / Peralte (h)",
                val: height,
                set: setHeight,
                ph: u === "in" ? 'ej. 12.03"' : "ej. 30.6",
                hint: u === "in" ? '4.16" – 39.4"' : "10.6 – 100 cm",
              },
              {
                label: "Ancho de Patín (b)",
                val: flange,
                set: setFlange,
                ph: u === "in" ? 'ej. 12.01"' : "ej. 30.5",
                hint: u === "in" ? '4.0" – 15.8"' : "10 – 40 cm",
              },
            ].map(({ label, val, set, ph, hint }) => (
              <div key={label}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 500,
                    color: "#94a3b8",
                    letterSpacing: "0.09em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  {label} <span style={{ color: "#f87171", fontSize: 10 }}>*</span>
                </label>

                <div style={{ position: "relative" }}>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={val}
                    onChange={(e) => set(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={ph}
                    style={inputStyle(val)}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0f172a";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = val ? "#0f172a" : "#e2e8f0";
                    }}
                  />

                  <span
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: 12,
                      color: "#94a3b8",
                      fontFamily: "'DM Mono', monospace",
                      pointerEvents: "none",
                    }}
                  >
                    {u}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: "#d1d8e0", marginTop: 5, paddingLeft: 2 }}>{hint}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px dashed #e8ecf0", paddingTop: isMobile ? 4 : 6 }}>
            <div
              style={{
                fontSize: 11,
                color: "#cbd5e1",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: isMobile ? 16 : 20,
              }}
            >
              Espesores en pulgadas — opcionales
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 20 : 22 }}>
              <FractionPicker
                label="Espesor de Alma (tw)"
                selectedMM={webMM}
                onSelect={setWebMM}
                isMobile={isMobile}
              />
              <FractionPicker
                label="Espesor de Patín (tf)"
                selectedMM={flangeTMM}
                onSelect={setFlangeTMM}
                isMobile={isMobile}
              />
            </div>
          </div>

          <div style={{ borderTop: "1px dashed #e8ecf0", paddingTop: isMobile ? 16 : 18 }}>
            <div
              style={{
                fontSize: 11,
                color: "#cbd5e1",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Longitud de venta
            </div>

            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row" }}>
              {LENGTH_OPTIONS.map((opt) => {
                const active = selectedLengthFeet === opt.feet;
                return (
                  <button
                    key={opt.feet}
                    type="button"
                    onClick={() => setSelectedLengthFeet(opt.feet)}
                    style={{
                      flex: 1,
                      padding: isMobile ? "14px 16px" : "12px 16px",
                      borderRadius: 12,
                      border: `1.5px solid ${active ? "#0f172a" : "#e2e8f0"}`,
                      background: active ? "#0f172a" : "white",
                      color: active ? "white" : "#334155",
                      cursor: "pointer",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {opt.label} · {opt.meters.toFixed(3)} m
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: -8 }}>
            <span style={{ color: "#f87171" }}>*</span> Altura y Patín son requeridos. Los espesores mejoran la precisión.
          </div>

          <button
            type="button"
            className="sbtn"
            onClick={handleSearch}
            disabled={!canSearch}
            style={{
              width: "100%",
              padding: isMobile ? "18px" : "15px",
              background: canSearch ? "#0f172a" : "#e8ecf0",
              color: canSearch ? "white" : "#94a3b8",
              border: "none",
              borderRadius: 14,
              fontSize: isMobile ? 16 : 15,
              fontWeight: 500,
              letterSpacing: "0.02em",
              cursor: canSearch ? "pointer" : "not-allowed",
              transition: "all 0.2s",
              boxShadow: canSearch ? "0 4px 18px rgba(15,23,42,0.2)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: isMobile ? 56 : 50,
            }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}>
                  <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="none" />
                  <path d="M8 2 A6 6 0 0 1 14 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                Buscando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="6.8" cy="6.8" r="4.3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M10 10L13 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
                Buscar Viga
              </>
            )}
          </button>
        </div>

        {searched && !loading && results.length > 0 && (
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 500,
                color: "#94a3b8",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: 12,
                paddingLeft: 2,
              }}
            >
              Vigas más cercanas
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {results.map(({ beam, dist }, i) => {
                const isTop = i === 0;
                const isExp = selected?.id === beam.id;
                const score = Math.max(0, 100 - dist * 200);

                const mLabel =
                  score > 90 ? "Exacta" : score > 70 ? "Muy cercana" : score > 50 ? "Cercana" : "Aproximada";

                const mColor = isTop
                  ? "rgba(255,255,255,0.45)"
                  : score > 90
                    ? "#22c55e"
                    : score > 70
                      ? "#3b82f6"
                      : score > 50
                        ? "#f59e0b"
                        : "#94a3b8";

                return (
                  <div key={beam.id}>
                    <div
                      className="rc"
                      onClick={() => setSelected(isExp ? null : beam)}
                      style={{
                        animationDelay: `${i * 0.06}s`,
                        background: isTop ? "#0f172a" : "white",
                        border: `1.5px solid ${isTop ? "#0f172a" : isExp ? "#334155" : "#e8ecf0"}`,
                        borderRadius: isExp ? "14px 14px 0 0" : 14,
                        padding: isMobile ? "15px 16px" : "17px 20px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        transition: "border-color 0.2s",
                        userSelect: "none",
                      }}
                    >
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: 8,
                          flexShrink: 0,
                          background: isTop ? "rgba(255,255,255,0.1)" : "#f1f5f9",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          fontWeight: 600,
                          color: isTop ? "rgba(255,255,255,0.6)" : "#94a3b8",
                        }}
                      >
                        {i + 1}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: isMobile ? 16 : 18,
                            fontWeight: 500,
                            color: isTop ? "white" : "#0f172a",
                            fontFamily: "'DM Mono', monospace",
                            letterSpacing: "-0.01em",
                          }}
                        >
                          {beam.name}
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: mColor, flexShrink: 0 }} />
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 500,
                              letterSpacing: "0.06em",
                              textTransform: "uppercase",
                              color: mColor,
                            }}
                          >
                            {mLabel}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                          style={{
                            fontSize: isMobile ? 12 : 13,
                            fontFamily: "'DM Mono', monospace",
                            color: isTop ? "rgba(255,255,255,0.6)" : "#475569",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {dv(beam.height)} × {dv(beam.flange)} {u}
                        </div>
                        <div style={{ fontSize: 11, color: isTop ? "rgba(255,255,255,0.3)" : "#94a3b8", marginTop: 2 }}>
                          {beam.weight.toFixed(2)} kg/m
                        </div>
                      </div>

                      <div
                        style={{
                          color: isTop ? "rgba(255,255,255,0.3)" : "#cbd5e1",
                          flexShrink: 0,
                          transform: isExp ? "rotate(90deg)" : "none",
                          transition: "transform 0.2s",
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M5 3.5l3.5 3.5L5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    {isExp && (
                      <div
                        style={{
                          animation: "fadeUp 0.2s ease",
                          background: "white",
                          border: "1.5px solid #334155",
                          borderTop: "1px solid #f1f5f9",
                          borderRadius: "0 0 14px 14px",
                          padding: isMobile ? "18px 16px 20px" : "22px 20px 24px",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "#94a3b8",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            marginBottom: 14,
                          }}
                        >
                          Especificaciones — {beam.name}
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                            gap: isMobile ? 12 : 16,
                            marginBottom: 18,
                          }}
                        >
                          {[
                            ["Altura (h)", `${dv(beam.height)} ${u}`],
                            ["Patín (b)", `${dv(beam.flange)} ${u}`],
                            ["Alma (tw)", fracLabel(beam.web)],
                            ["Esp. Patín (tf)", fracLabel(beam.flangeT)],
                            ["Peso por metro", `${beam.weight.toFixed(2)} kg/m`],
                            ["Peso nominal", `${beam.lbft.toFixed(0)} lb/ft`],
                            ["Longitud", selectedLength.label],
                            ["Peso total", `${totalWeightKg(beam).toFixed(2)} kg`],
                            ["Precio", formatMXN(totalPriceMXN(beam))],
                          ].map(([lbl, val]) => (
                            <div key={lbl}>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#94a3b8",
                                  letterSpacing: "0.07em",
                                  textTransform: "uppercase",
                                  marginBottom: 3,
                                }}
                              >
                                {lbl}
                              </div>
                              <div
                                style={{
                                  fontSize: isMobile ? 13 : 14,
                                  color: lbl === "Precio" ? "#16a34a" : "#0f172a",
                                  fontFamily: "'DM Mono', monospace",
                                  fontWeight: lbl === "Precio" ? 700 : 400,
                                }}
                              >
                                {val}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: 12,
                            padding: isMobile ? "14px" : "16px",
                            marginBottom: 14,
                          }}
                        >
                          <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                            Resumen comercial
                          </div>
                          <div style={{ fontSize: 14, color: "#0f172a", lineHeight: 1.7 }}>
                            {beam.name} · {selectedLength.label} · {totalWeightKg(beam).toFixed(2)} kg ·{" "}
                            <strong>{formatMXN(totalPriceMXN(beam))}</strong>
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: 10 }}>
                          <button
                            type="button"
                            style={{
                              flex: 1,
                              padding: isMobile ? "15px" : "13px",
                              background: "#0f172a",
                              color: "white",
                              border: "none",
                              borderRadius: 10,
                              fontSize: 14,
                              fontWeight: 500,
                              cursor: "pointer",
                              minHeight: isMobile ? 50 : 44,
                            }}
                          >
                            Solicitar cotización
                          </button>

                          <button
                            type="button"
                            style={{
                              flex: 1,
                              padding: isMobile ? "15px" : "13px",
                              background: "#f0fdf4",
                              color: "#16a34a",
                              border: "1.5px solid #bbf7d0",
                              borderRadius: 10,
                              fontSize: 14,
                              fontWeight: 500,
                              cursor: "pointer",
                              minHeight: isMobile ? 50 : 44,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 8,
                            }}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.126.558 4.121 1.532 5.856L.057 23.882l6.198-1.627A11.944 11.944 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.52-5.184-1.426l-.371-.22-3.681.965.982-3.588-.242-.38A9.937 9.937 0 0 1 2 12C2 6.478 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
                            </svg>
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!searched && (
          <div style={{ textAlign: "center", paddingBottom: 8 }}>
            <div style={{ fontSize: 12, color: "#d1d8e0" }}>
              Catálogo base: {BEAMS.length} vigas cargadas · Longitudes 20 ft y 40 ft
            </div>
          </div>
        )}
      </main>

      <footer
        style={{
          borderTop: "1px solid #eaecf0",
          background: "white",
          padding: isMobile ? "14px 18px" : "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, color: "#cbd5e1" }}>© 2026 Surtiaceros</span>
        <span style={{ fontSize: 11, color: "#e2e8f0", fontFamily: "'DM Mono', monospace" }}>v2.0</span>
      </footer>
    </div>
  );
}
