import useFriction from "../../hooks/useFriction";
import T from "../../tokens/T";

// ─── Gauge SVG de 270° ───────────────────────────────────────────────────────
const GaugeSVG = ({ score, color }) => {
  const R   = 44;
  const cx  = 60, cy = 60;
  const total = 270; // grados del arco
  const filled = (score / 100) * total;
  const toRad  = (deg) => (deg * Math.PI) / 180;

  const arcPath = (startDeg, endDeg) => {
    const start = toRad(startDeg - 90 + 45);
    const end   = toRad(endDeg   - 90 + 45);
    const x1 = cx + R * Math.cos(start);
    const y1 = cy + R * Math.sin(start);
    const x2 = cx + R * Math.cos(end);
    const y2 = cy + R * Math.sin(end);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
  };

  return (
    <svg width={120} height={90} viewBox="0 0 120 90">
      {/* Track */}
      <path d={arcPath(0, 270)} fill="none" stroke={T.border} strokeWidth="7" strokeLinecap="round" />
      {/* Fill animado */}
      {score > 0 && (
        <path
          d={arcPath(0, filled)}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.22,.68,0,1.15)" }}
        />
      )}
      {/* Score */}
      <text x={cx} y={cy + 2} textAnchor="middle" fontSize="18" fontWeight="600"
        fontFamily="IBM Plex Mono" fill={color}>
        {score}
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="9"
        fontFamily="'Nunito Sans', sans-serif" fill={T.textMuted}>
        / 100
      </text>
    </svg>
  );
};

// ─── Mini barra de desglose ───────────────────────────────────────────────────
const BreakdownBar = ({ emoji, label, value, weight, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span style={{ fontSize: 14, flexShrink: 0 }}>{emoji}</span>
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11.5, color: T.textSecondary }}>{label}</span>
        <span style={{ fontSize: 10.5, color: T.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>
          {weight}
        </span>
      </div>
      <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: color, borderRadius: 2,
          transition: "width .8s cubic-bezier(.22,.68,0,1.15)",
        }} />
      </div>
    </div>
  </div>
);

// ─── Componente principal ─────────────────────────────────────────────────────
const FrictionScore = () => {
  const { score, level, breakdown } = useFriction();

  return (
    <div className="card">
      {/* Header */}
      <p style={{
        fontSize: 10.5, color: T.textMuted,
        fontFamily: "'IBM Plex Mono', monospace", marginBottom: 12,
      }}>
        ÍNDICE DE FRICCIÓN DEL PLAN
      </p>

      {/* Gauge + descripción */}
      <div style={{ display: "flex", gap: 14, alignItems: "center", marginBottom: 14 }}>
        <GaugeSVG score={score} color={level.color} />
        <div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700,
            fontSize: 16, color: level.color, marginBottom: 4,
          }}>
            Fricción {level.label}
          </div>
          <div style={{ fontSize: 12.5, color: T.textSecondary, lineHeight: 1.55 }}>
            {level.desc}
          </div>
        </div>
      </div>

      {/* Desglose */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {breakdown.map(b => (
          <BreakdownBar key={b.label} {...b} />
        ))}
      </div>
    </div>
  );
};

export default FrictionScore;
