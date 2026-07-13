import Icon from "./Icon";
import T from "../../tokens/T";

const TABS = [
  { id: "dashboard", icon: "home",     label: "Inicio"   },
  { id: "nutrition", icon: "apple",    label: "Nutrición"},
  { id: "training",  icon: "dumbbell", label: "Entreno"  },
  { id: "habits",    icon: "droplets", label: "Hábitos"  },
  { id: "analytics", icon: "barChart", label: "Stats"    },
];

const BottomNav = ({ current, onNav }) => (
  <div style={{
    position: "fixed", bottom: 0, left: 0, right: 0,
    background: T.glass,
    backdropFilter: "blur(12px) saturate(180%)",
    WebkitBackdropFilter: "blur(12px) saturate(180%)",
    borderTop: `1.5px solid ${T.border}`,
    display: "flex", padding: "7px 6px 14px",
    boxShadow: "0 -4px 24px rgba(43,188,185,0.12)",
    zIndex: 100,
  }}>
    {TABS.map(t => {
      const active = current === t.id;
      return (
        <button
          key={t.id}
          id={`nav-${t.id}`}
          onClick={() => onNav(t.id)}
          style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "6px 3px", background: "none", border: "none",
            cursor: "pointer", borderRadius: 11, transition: "all .2s",
          }}
        >
          <div style={{
            padding: "5px 14px", borderRadius: 10,
            background: active ? T.tealLight : "transparent",
            transition: "background .2s",
          }}>
            <Icon name={t.icon} size={20} color={active ? T.teal : T.textMuted} />
          </div>
          <span style={{
            fontSize: 10, color: active ? T.teal : T.textMuted,
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: active ? 500 : 400,
          }}>
            {t.label}
          </span>
        </button>
      );
    })}
  </div>
);

export default BottomNav;
