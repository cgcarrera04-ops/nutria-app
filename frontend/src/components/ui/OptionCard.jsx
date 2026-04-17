import Icon from "./Icon";
import T from "../../tokens/T";

const OptionCard = ({ label, sublabel, icon, selected, onClick, color = T.teal, emoji }) => (
  <div
    onClick={onClick}
    style={{
      padding: "13px 16px",
      background: selected ? `${color}10` : T.surface,
      border: `1.5px solid ${selected ? color : T.border}`,
      borderRadius: 14, cursor: "pointer",
      transition: "all .2s cubic-bezier(.22,.68,0,1.15)",
      display: "flex", gap: 12, alignItems: "center",
      boxShadow: selected ? `0 3px 12px ${color}22` : T.shadow,
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 11,
      background: selected ? `${color}18` : T.tealXLight,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      fontSize: emoji ? 20 : undefined,
      transition: "background .2s",
    }}>
      {emoji ? emoji : <Icon name={icon} size={16} color={selected ? color : T.textMuted} />}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: selected ? T.textPrimary : T.textSecondary }}>
        {label}
      </div>
      {sublabel && (
        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>{sublabel}</div>
      )}
    </div>
    {selected && (
      <div style={{
        width: 22, height: 22, borderRadius: "50%",
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, animation: "scaleIn .25s ease both",
      }}>
        <Icon name="check" size={11} color="#fff" />
      </div>
    )}
  </div>
);

export default OptionCard;
