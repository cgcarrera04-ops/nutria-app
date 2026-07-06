import useFriction from "../../hooks/useFriction";
import T from "../../tokens/T";

// ─── Gauge SVG de 270° ───────────────────────────────────────────────────────
const GaugeSVG = ({ score, color }) => {
  const r = 32;
  const cx = 60;
  const cy = 46;
  const circ = 2 * Math.PI * r; // ~201
  const trackLength = circ * 0.75;
  const gapLength = circ * 0.25;
  const fillLength = (score / 100) * trackLength;

  return (
    <svg width={120} height={90} viewBox="0 0 120 90" style={{ overflow: "visible" }}>
      {/* Track Base (Gris) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={T.border}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${trackLength} ${gapLength}`}
        strokeDashoffset={circ * 0.125}
        transform={`rotate(135 ${cx} ${cy})`}
      />
      {/* Fill (Progreso animado) */}
      {score > 0 && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${fillLength} ${circ - fillLength}`}
          strokeDashoffset={circ * 0.125}
          transform={`rotate(135 ${cx} ${cy})`}
          style={{ transition: "stroke-dasharray 1s cubic-bezier(.22,.68,0,1.15)" }}
        />
      )}
      {/* Score */}
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize="20" fontWeight="700"
        fontFamily="IBM Plex Mono" fill={color}>
        {score}
      </text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="9"
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
