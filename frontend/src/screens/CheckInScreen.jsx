import { useState } from "react";
import Icon from "../components/ui/Icon";
import T from "../tokens/T";
import { useApp } from "../context/AppContext";
import { API_BASE } from "../config/api";

const CheckInScreen = ({ onBack }) => {
  const { state, dispatch } = useApp();
  const [weightDelta, setWeightDelta] = useState(null);
  const [hunger,      setHunger]      = useState(null);
  const [fatigue,     setFatigue]     = useState(null);
  const [budgetOk,    setBudgetOk]    = useState(null);
  const [npsRating,   setNpsRating]   = useState(null); // NPS Cuestionario del 1 al 5
  const [submitted,   setSubmitted]   = useState(false);

  const isFirstWeek = state.currentWeek === 1;
  const canSubmit = weightDelta && hunger && fatigue && budgetOk && (!isFirstWeek || npsRating);

  // ── Calcular ajustes sugeridos según las respuestas ──────────────────────────
  const computeAdjustments = () => {
    const adj = [];
    if (hunger === "yes") {
      adj.push({ label: "Calorías diarias", change: "+150 kcal", color: T.teal, reason: "Pasaste hambre" });
    } else if (hunger === "no") {
      adj.push({ label: "Calorías diarias", change: "Mantenidas", color: T.blue, reason: "Saciedad correcta" });
    }
    if (fatigue === "yes") {
      adj.push({ label: "Volumen entrenamiento", change: "−15%", color: T.amber, reason: "Fatiga elevada" });
    }
    if (budgetOk === "no") {
      adj.push({ label: "Lista de compras", change: "Re-optimizada", color: T.brown, reason: "Presupuesto ajustado" });
    }
    if (weightDelta === "up" && hunger === "no") {
      adj.push({ label: "Carbohidratos", change: "−20g", color: T.amber, reason: "Peso subió sin hambre" });
    }
    if (weightDelta === "down") {
      adj.push({ label: "Proteína diaria", change: "Confirmada ✓", color: T.teal, reason: "Preservación muscular" });
    }
    if (adj.length === 0) {
      adj.push({ label: "Plan actual", change: "Mantenido al 100%", color: T.teal, reason: "Adherencia perfecta" });
    }
    return adj;
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const checkinPayload = {
      weightDelta,
      hunger,
      fatigue,
      budgetOk,
      npsRating, // Guardado para analíticas en tiempo real
      date: Date.now(),
    };
    
    dispatch({
      type: "SAVE_CHECKIN",
      payload: checkinPayload
    });

    // Enviar calificación NPS de la primera semana al backend de forma asíncrona
    if (isFirstWeek && npsRating) {
      // Guardar también localmente por robustez offline
      try {
        const localNps = JSON.parse(localStorage.getItem("nutria_local_nps") || "[]");
        localNps.push({
          rating: npsRating,
          name: state.userData?.name || "Anónimo",
          email: state.userData?.email || null,
          timestamp: Date.now() / 1000
        });
        localStorage.setItem("nutria_local_nps", JSON.stringify(localNps));
      } catch (e) {
        console.error("[NutrIA] Error al guardar NPS localmente:", e);
      }

      fetch(`${API_BASE}/api/submit-nps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nps_rating: npsRating,
          user_name: state.userData?.name || "Anónimo",
          user_email: state.userData?.email || null,
          timestamp: Date.now() / 1000
        })
      })
      .then(res => {
        if (!res.ok) console.warn("[NutrIA] Fallo al enviar NPS al servidor");
      })
      .catch(err => {
        console.warn("[NutrIA] Servidor offline al enviar NPS:", err);
      });
    }

    if (window.__nutriaTriggerGenerate) {
      window.__nutriaTriggerGenerate(state.currentWeek + 1, checkinPayload);
    } else {
      dispatch({ type: "SAVE_PROFILE" });
    }
    
    setSubmitted(true);
  };

  if (submitted) {
    const adjustments = computeAdjustments();
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, textAlign: "center", background: T.bg }}>
        <div style={{ width: 80, height: 80, borderRadius: 22, background: T.tealLight, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22, fontSize: 40 }}>
          🎉
        </div>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 22, marginBottom: 8, color: T.textPrimary }}>
          ¡Tu Semana {state.currentWeek + 1} está lista!
        </h2>
        <p style={{ color: T.textSecondary, fontSize: 14, marginBottom: 20, maxWidth: 320, lineHeight: 1.75 }}>
          NutrIA procesó tus respuestas y ajustó el plan. Cada semana será más precisa para ti.
        </p>

        <div style={{ padding: "16px 18px", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, marginBottom: 24, width: "100%", maxWidth: 320, boxShadow: T.shadow, textAlign: "left" }}>
          <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, color: T.textMuted, marginBottom: 12, textAlign: "center" }}>
            AJUSTES APLICADOS · SEMANA {state.currentWeek + 1}
          </div>
          {adjustments.map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < adjustments.length - 1 ? `1px solid ${T.border}` : "none", gap: 8 }}>
              <div>
                <div style={{ fontSize: 12.5, color: T.textSecondary }}>{a.label}</div>
                <div style={{ fontSize: 10.5, color: T.textMuted, fontStyle: "italic" }}>{a.reason}</div>
              </div>
              <span style={{ fontSize: 12.5, fontFamily: "'IBM Plex Mono', monospace", color: a.color, fontWeight: 600, flexShrink: 0 }}>{a.change}</span>
            </div>
          ))}
        </div>

        <button className="btn-primary" onClick={onBack} style={{ padding: "13px 28px" }}>
          Ver nuevo plan <Icon name="arrowRight" size={15} color="#fff" />
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "18px 16px 100px", background: T.bg, minHeight: "100vh" }}>
      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: T.shadow }}>
          <Icon name="arrowLeft" size={17} color={T.textSecondary} />
        </button>
        <div>
          <div style={{ fontSize: 10.5, color: T.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>FIN DE SEMANA {state.currentWeek}</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 19, color: T.textPrimary }}>Check-in Semanal</h2>
        </div>
      </div>

      <div className="fade-up fade-up-1" style={{ padding: "11px 14px", background: T.tealLight, border: `1.5px solid ${T.border}`, borderRadius: 12, marginBottom: 16, fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>
        <Icon name="brain" size={13} color={T.teal} />{" "}
        Tus respuestas son el <strong style={{ color: T.teal }}>input real que NutrIA necesita</strong> para ajustar tu plan. Sé honesto/a — no hay respuestas incorrectas.
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

      {/* Cuestionario NPS de Recomendación (Axioma 1) - Solo 1ra semana */}
      {isFirstWeek && (
        <div className="fade-up card" style={{ marginBottom: 12, animationDelay: ".4s" }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: T.textSecondary, display: "block", marginBottom: 9 }}>
            ¿Qué tanto recomendarías tu app NutrIA a un ser querido? 🦦
          </label>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: "4px 0" }}>
            {[1, 2, 3, 4, 5].map(num => {
              const isSelected = npsRating === num;
              return (
                <button
                  key={num}
                  onClick={() => setNpsRating(num)}
                  style={{
                    flex: 1, height: 42, borderRadius: 12, border: `1.5px solid ${isSelected ? T.teal : T.border}`,
                    background: isSelected ? `${T.teal}12` : T.surface,
                    color: isSelected ? T.teal : T.textSecondary,
                    fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all .18s",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    boxShadow: isSelected ? `0 2px 8px ${T.teal}22` : T.shadow
                  }}
                >
                  <span style={{ fontSize: 14 }}>{isSelected ? "⭐" : num}</span>
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: T.textMuted, marginTop: 4, padding: "0 4px" }}>
            <span>1: Nada recomendable</span>
            <span>5: ¡Totalmente! 🚀</span>
          </div>
        </div>
      )}

      {/* Hint de respuestas pendientes */}
      {!canSubmit && (weightDelta || hunger || fatigue || budgetOk || (isFirstWeek && npsRating)) && (
        <div className="fade-up" style={{
          fontSize: 12.5, color: T.textMuted, textAlign: "center",
          marginBottom: 10, padding: "9px 14px",
          background: T.surface, borderRadius: 10, border: `1px dashed ${T.border}`,
        }}>
          {(!weightDelta || !hunger || !fatigue || !budgetOk) 
            ? "🦦 Responde las preguntas de tu plan semanal" 
            : "⭐ Danos tu calificación recomendando a NutrIA para continuar"
          }
        </div>
      )}

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "14px 22px 24px", background: `linear-gradient(transparent, ${T.bg} 45%)` }}>
        <button
          id="btn-submit-checkin"
          className="btn-primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: 15, opacity: canSubmit ? 1 : 0.55, cursor: canSubmit ? "pointer" : "not-allowed" }}
        >
          Enviar y ajustar Semana {state.currentWeek + 1} <Icon name="zap" size={15} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default CheckInScreen;
