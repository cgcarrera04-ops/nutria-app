import T from "../../tokens/T";

/**
 * TagSelector — Componente para alergias y lesiones
 * Props:
 *   tags        string[]      — tags actuales
 *   onAdd       (tag) => void
 *   onRemove    (tag) => void
 *   suggestions string[]      — sugerencias rápidas
 *   placeholder string
 *   color?      string        — color de acento (default T.teal)
 */
const TagSelector = ({
  tags       = [],
  onAdd,
  onRemove,
  suggestions = [],
  placeholder = "Escribe y presiona Enter…",
  color,
}) => {
  const accent = color || T.teal;

  const handleKey = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      onAdd(e.target.value.trim());
      e.target.value = "";
    }
  };

  return (
    <div>
      {/* Sugerencias rápidas */}
      {suggestions.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>
          {suggestions
            .filter(s => !tags.includes(s))
            .map(s => (
              <button
                key={s}
                onClick={() => onAdd(s)}
                style={{
                  padding: "5px 12px", borderRadius: 20,
                  background: T.surface, border: `1.5px solid ${T.border}`,
                  fontSize: 12, color: T.textSecondary, cursor: "pointer",
                  transition: "all .15s",
                }}
                onMouseEnter={e => {
                  e.target.style.borderColor = accent;
                  e.target.style.color = accent;
                }}
                onMouseLeave={e => {
                  e.target.style.borderColor = T.border;
                  e.target.style.color = T.textSecondary;
                }}
              >
                + {s}
              </button>
            ))}
        </div>
      )}

      {/* Tags seleccionados */}
      {tags.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 9 }}>
          {tags.map(t => (
            <div
              key={t}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 10px", borderRadius: 20,
                background: `${accent}15`,
                border: `1.5px solid ${accent}50`,
                fontSize: 12.5, color: accent,
              }}
            >
              {t}
              <button
                onClick={() => onRemove(t)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: accent, fontSize: 14, lineHeight: 1,
                  padding: "0 0 0 2px", display: "flex", alignItems: "center",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input libre */}
      <input
        type="text"
        placeholder={placeholder}
        onKeyDown={handleKey}
        style={{
          width: "100%", padding: "10px 13px", fontSize: 13,
          fontFamily: "'Nunito Sans', sans-serif",
          background: T.surface, border: `1.5px solid ${T.border}`,
          borderRadius: 11, color: T.textPrimary, boxShadow: T.shadow,
          transition: "border-color .18s",
        }}
        onFocus={e => (e.target.style.borderColor = accent)}
        onBlur={e => (e.target.style.borderColor = T.border)}
      />
      <div style={{ fontSize: 11, color: T.textMuted, marginTop: 5 }}>
        Escribe y presiona <kbd style={{ background: T.card, padding: "1px 5px", borderRadius: 4, border: `1px solid ${T.border}` }}>Enter</kbd> para añadir
      </div>
    </div>
  );
};

export default TagSelector;
