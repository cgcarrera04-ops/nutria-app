import { useState } from "react";
import Icon from "../components/ui/Icon";
import T from "../tokens/T";

const CheckInScreen = ({ onBack }) => {
  const [weightDelta, setWeightDelta] = useState(null);
  const [hunger,      setHunger]      = useState(null);
  const [fatigue,     setFatigue]     = useState(null);
  const [budgetOk,    setBudgetOk]    = useState(null);
  const [submitted,   setSubmitted]   = useState(false);

  if (submitted) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center", background: T.bg }}>
      <div style={{ width: 80, height: 80, borderRadius: 22, background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, fontSize: 40 }}>
        🎉
      </div>
      <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 8, color: T.textPrimary }}>
        Plan Semana 2 generado
      </h2>
      <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 18, maxWidth: 300, lineHeight: 1.75 }}>
        La IA ajustó tu plan. Volumen de entrenamiento{" "}
        <span style={{ color: T.amber }}>−15%</span>, carbohidratos{" "}
        <span style={{ color: T.teal }}>+8%</span> para mejorar adherencia.
      </p>
      <div style={{ padding: "14px 18px", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, marginBottom: 24, maxWidth: 300, boxShadow: T.shadow }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: T.textMuted, marginBottom: 9 }}>
          AJUSTES IA · SEMANA 2
        </div>
        {[
          { label: "Volumen entrenamiento", change: "−15%",           color: T.amber },
          { label: "Carbohidratos diarios", change: "+18g",           color: T.teal  },
          { label: "Tiempo cocina",         change: "Reducido 20min", color: T.blue  },
        ].map((a, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
            <span style={{ fontSize: 12.5, color: T.textSecondary }}>{a.label}</span>
            <span style={{ fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: a.color, fontWeight: 500 }}>{a.change}</span>
          </div>
        ))}
      </div>
      <button className="btn-primary" onClick={onBack}>Ver nuevo plan →</button>
    </div>
  );

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "18px 16px 100px", background: T.bg, minHeight: "100vh" }}>
      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: T.shadow }}>
          <Icon name="arrowLeft" size={17} color={T.textSecondary} />
        </button>
        <div>
          <div style={{ fontSize: 10.5, color: T.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>FIN DE SEMANA 1</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 19, color: T.textPrimary }}>Check-in Cualitativo</h2>
        </div>
      </div>

      <div className="fade-up fade-up-1" style={{ padding: "11px 14px", background: T.tealLight, border: `1.5px solid ${T.border}`, borderRadius: 12, marginBottom: 16, fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
        <Icon name="brain" size={13} color={T.teal} />{" "}
        Este feedback es <strong style={{ color: T.teal }}>input de re-optimización</strong> directa para la IA.
      </div>

      {/* Peso */}
      <div className="fade-up fade-up-1 card" style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 11 }}>
          ¿Cómo cambió tu peso esta semana?
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { v: "down", l: "Bajé", e: "↓", c: T.teal  },
            { v: "same", l: "Igual", e: "→", c: T.blue  },
            { v: "up",   l: "Subí",  e: "↑", c: T.amber },
          ].map(o => (
            <div key={o.v} onClick={() => setWeightDelta(o.v)} style={{
              padding: "12px 8px",
              background: weightDelta === o.v ? `${o.c}12` : T.surface,
              border: `1.5px solid ${weightDelta === o.v ? o.c : T.border}`,
              borderRadius: 12, cursor: "pointer", textAlign: "center",
              transition: "all .18s", boxShadow: T.shadow,
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{o.e}</div>
              <div style={{ fontSize: 12.5, color: weightDelta === o.v ? o.c : T.textSecondary }}>{o.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Preguntas cualitativas */}
      {[
        { label: "¿Pasaste hambre durante la semana?",              state: hunger,   setState: setHunger,   opts: [{ v: "no", l: "Para nada" }, { v: "mild", l: "Un poco" }, { v: "yes", l: "Bastante" }] },
        { label: "¿Sentiste fatiga extrema en los entrenamientos?", state: fatigue,  setState: setFatigue,  opts: [{ v: "no", l: "Todo bien" }, { v: "mild", l: "Algo" },    { v: "yes", l: "Muy agotado" }] },
        { label: "¿Pudiste pagar la lista de compras?",             state: budgetOk, setState: setBudgetOk, opts: [{ v: "yes", l: "Sin problema" }, { v: "tight", l: "Justo" }, { v: "no", l: "No alcanzó" }] },
      ].map((q, qi) => (
        <div key={qi} className="fade-up card" style={{ marginBottom: 10, animationDelay: `${qi * .09 + .18}s` }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 9 }}>
            {q.label}
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            {q.opts.map(o => (
              <div key={o.v} onClick={() => q.setState(o.v)} style={{
                flex: 1, padding: "9px 6px",
                background: q.state === o.v ? T.tealMid : T.card,
                border: `1.5px solid ${q.state === o.v ? T.teal : T.border}`,
                borderRadius: 10, cursor: "pointer", textAlign: "center",
                fontSize: 12.5, color: q.state === o.v ? T.teal : T.textSecondary,
                fontWeight: q.state === o.v ? 600 : 400, transition: "all .18s",
              }}>{o.l}</div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "14px 22px 24px", background: `linear-gradient(transparent, ${T.bg} 45%)` }}>
        <button id="btn-submit-checkin" className="btn-primary" onClick={() => setSubmitted(true)} style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 15 }}>
          Enviar a IA y generar Semana 2 <Icon name="zap" size={15} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default CheckInScreen;
