import { useState } from "react";

type Beam = {
  id: string;
  name: string;
  height: number;
  flange: number;
  weight: number;
};

const BEAMS: Beam[] = [
  { id: "IPR-100", name: "IPR 100", height: 100, flange: 50, weight: 9.7 },
  { id: "IPR-120", name: "IPR 120", height: 120, flange: 58, weight: 11.9 },
  { id: "IPR-140", name: "IPR 140", height: 140, flange: 66, weight: 14.3 },
  { id: "IPR-160", name: "IPR 160", height: 160, flange: 74, weight: 17.9 },
  { id: "IPR-180", name: "IPR 180", height: 180, flange: 82, weight: 21.9 },
  { id: "IPR-200", name: "IPR 200", height: 200, flange: 90, weight: 26.2 },
  { id: "W12x65", name: "W12×65", height: 306, flange: 305, weight: 96.7 },
];

export default function App(): JSX.Element {
  const [height, setHeight] = useState("");
  const [flange, setFlange] = useState("");
  const [result, setResult] = useState<Beam | null>(null);

  function handleSearch(): void {
    const h = parseFloat(height);
    const f = parseFloat(flange);

    if (isNaN(h) || isNaN(f)) return;

    let best: Beam | null = null;
    let bestScore = Infinity;

    for (const beam of BEAMS) {
      const score = Math.abs(beam.height - h) + Math.abs(beam.flange - f);
      if (score < bestScore) {
        bestScore = score;
        best = beam;
      }
    }

    setResult(best);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fa",
        fontFamily: "Arial, sans-serif",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: 600,
          margin: "0 auto",
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: 12, color: "#0f172a" }}>
          Encuentra tu perfil de acero
        </h1>

        <p style={{ marginBottom: 20, color: "#475569" }}>
          Ingresa altura y patín en mm.
        </p>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            type="number"
            placeholder="Altura / Peralte (mm)"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 16,
            }}
          />

          <input
            type="number"
            placeholder="Ancho de Patín (mm)"
            value={flange}
            onChange={(e) => setFlange(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              border: "1px solid #cbd5e1",
              fontSize: 16,
            }}
          />

          <button
            onClick={handleSearch}
            style={{
              padding: 14,
              borderRadius: 10,
              border: "none",
              background: "#0f172a",
              color: "white",
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            Buscar Perfil
          </button>
        </div>

        {result && (
          <div
            style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>
              Mejor coincidencia
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              {result.name}
            </div>
            <div style={{ marginTop: 8, color: "#334155" }}>
              Altura: {result.height} mm
            </div>
            <div style={{ color: "#334155" }}>
              Patín: {result.flange} mm
            </div>
            <div style={{ color: "#334155" }}>
              Peso: {result.weight} kg/m
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
