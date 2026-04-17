import { useState, useEffect } from "react";
import T from "../../tokens/T";

/**
 * MacroBar con animación de montaje (0% → valor real)
 * Props: label, val, max, color, unit
 */
const MacroBar = ({ label, val, max, color = T.teal, unit = "g" }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  const pct    = max > 0 ? Math.min((val / max) * 100, 100) : 0;
  const isOver = val > max;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: T.textSecondary, fontWeight: 500 }}>{label}</span>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 13, color: isOver ? T.amber : color, fontWeight: 500,
        }}>
          {val}{unit}
          <span style={{ color: T.textMuted, fontWeight: 400 }}> / {max}{unit}</span>
          {isOver && <span style={{ marginLeft: 5, fontSize: 11 }}>⚠️</span>}
        </span>
      </div>
      <div style={{
        height: 5, background: T.border, borderRadius: 3,
        overflow: "hidden", position: "relative",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          width: mounted ? `${pct}%` : "0%",
          background: isOver
            ? `linear-gradient(90deg, ${color}, ${T.amber})`
            : `linear-gradient(90deg, ${color}BB, ${color})`,
          borderRadius: 3,
          transition: "width .9s cubic-bezier(.22,.68,0,1.15)",
        }} />
      </div>
    </div>
  );
};

export default MacroBar;
