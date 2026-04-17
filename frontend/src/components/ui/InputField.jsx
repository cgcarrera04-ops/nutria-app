import T from "../../tokens/T";

const InputField = ({ label, placeholder, type = "text", value, onChange, unit, sublabel }) => (
  <div style={{ marginBottom: 16 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary }}>{label}</label>
      {sublabel && <span style={{ fontSize: 11, color: T.textMuted }}>{sublabel}</span>}
    </div>
    <div style={{
      display: "flex", alignItems: "center",
      background: T.surface, border: `1.5px solid ${T.border}`,
      borderRadius: 12, overflow: "hidden",
      transition: "border-color .2s, box-shadow .2s",
      boxShadow: T.shadow,
    }}>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={e => onChange(e.target.value)}
        style={{ flex: 1, padding: "12px 14px", fontSize: 15, border: "none" }}
        onFocus={e => {
          e.target.parentNode.style.borderColor = T.teal;
          e.target.parentNode.style.boxShadow = `0 0 0 3px ${T.tealMid}`;
        }}
        onBlur={e => {
          e.target.parentNode.style.borderColor = T.border;
          e.target.parentNode.style.boxShadow = T.shadow;
        }}
      />
      {unit && (
        <span style={{
          padding: "0 14px", fontSize: 12, color: T.textMuted,
          fontFamily: "'IBM Plex Mono', monospace",
          borderLeft: `1.5px solid ${T.border}`, paddingBlock: 12,
          background: T.tealXLight,
        }}>{unit}</span>
      )}
    </div>
  </div>
);

export default InputField;
