import { useState } from "react";
import ProgressBar from "../../components/ui/ProgressBar";
import Icon from "../../components/ui/Icon";
import { useApp } from "../../context/AppContext";
import T from "../../tokens/T";
import MASCOT from "../../constants/mascotImages";

const GOALS = [
  {
    id:       "deficit",
    emoji:    "🔥",
    label:    "Perder grasa",
    sublabel: "Déficit calórico · −300 a −500 kcal/día",
    icon:     "trendingDown",
    color:    T.amber,
    expand: {
      headline:  "Déficit calórico inteligente",
      points: [
        "La IA calcula −300 a −500 kcal según tu metabolismo real",
        "Proteína alta (≥2g/kg) para preservar músculo mientras bajas grasa",
        "Recetas de alto volumen y baja densidad energética → más saciedad",
        "Ideal si tienes grasa corporal que deseas reducir",
      ],
    },
  },
  {
    id:       "maintain",
    emoji:    "⚖️",
    label:    "Recomposición",
    sublabel: "Balance calórico · Cambiar grasa por músculo",
    icon:     "target",
    color:    T.blue,
    expand: {
      headline:  "Recomposición corporal",
      points: [
        "Plan isocalórico: mismas calorías que gastas",
        "Funciona mejor en personas con <2 años de entrenamiento",
        "Mayor timing de proteína alrededor del entrenamiento",
        "El proceso más lento pero más sostenible a largo plazo",
      ],
    },
  },
  {
    id:       "surplus",
    emoji:    "💪",
    label:    "Ganar músculo",
    sublabel: "Superávit calórico · +200 a +400 kcal/día",
    icon:     "trendingUp",
    color:    T.teal,
    expand: {
      headline:  "Superávit limpio",
      points: [
        "Superávit de +200 a +400 kcal según tu somatotipo",
        "Enfoque en maximizar síntesis proteica",
        "Incluye ingredientes calóricamente densos: frutos secos, avena, plátano",
        "Plan de entrenamiento con progresión de carga semanal",
      ],
    },
  },
];

const OnboardGoal = ({ onNext }) => {
  const { state, dispatch } = useApp();
  const { userData } = state;
  const set = (payload) => dispatch({ type: "UPDATE_USER_DATA", payload });
  const [expanded, setExpanded] = useState(null);

  const select = (id) => {
    set({ goal: id });
    setExpanded(id);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:T.bg }}>
      <ProgressBar step={1} total={3} completedSteps={[]} onStepClick={() => {}} />

      <div style={{ flex:1, maxWidth:520, margin:"0 auto", padding:"24px 20px 110px", width:"100%" }}>
        {/* Mascota + badge */}
        <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <img
            src={MASCOT.logo}
            alt="NutrIA"
            onError={e => { e.target.src = "https://i.postimg.cc/FsNKHJ22/1776015778388.png"; }}
            style={{ width:44, height:44, borderRadius:12, objectFit:"cover", boxShadow:`0 2px 12px rgba(43,188,185,0.2)`, animation:"float 4s ease-in-out infinite" }}
          />
          <div>
            <span className="tag" style={{ background:T.tealLight, color:T.teal, border:`1.5px solid ${T.border}` }}>
              PASO 1 DE 3 · TU OBJETIVO
            </span>
          </div>
        </div>

        <h2 className="fade-up fade-up-1" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:24, marginBottom:6, color:T.textPrimary }}>
          ¿Cuál es tu objetivo?
        </h2>
        <p className="fade-up fade-up-2" style={{ color:T.textSecondary, fontSize:13.5, marginBottom:24, lineHeight:1.65 }}>
          Tu ancla motivacional. Todo el plan girará en torno a esto.
        </p>

        <div className="fade-up fade-up-2" style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {GOALS.map(g => {
            const sel  = userData.goal === g.id;
            const open = expanded === g.id;
            return (
              <div key={g.id} id={`goal-${g.id}`}>
                {/* Card principal */}
                <div
                  onClick={() => select(g.id)}
                  style={{
                    padding:"16px 18px",
                    background: sel ? `${g.color}10` : T.surface,
                    border: `2px solid ${sel ? g.color : T.border}`,
                    borderRadius: open ? "14px 14px 0 0" : 14,
                    cursor:"pointer", transition:"all .2s", boxShadow: T.shadow,
                    display:"flex", alignItems:"center", gap:14,
                  }}
                >
                  <span style={{ fontSize:28 }}>{g.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:16, color: sel ? g.color : T.textPrimary }}>{g.label}</div>
                    <div style={{ fontSize:12, color:T.textMuted, marginTop:2 }}>{g.sublabel}</div>
                  </div>
                  {sel && (
                    <div style={{ width:22, height:22, borderRadius:"50%", background:g.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <Icon name="check" size={12} color="#fff" />
                    </div>
                  )}
                  <div style={{ color:T.textMuted, fontSize:16, transform: open ? "rotate(180deg)" : "rotate(0)", transition:"transform .2s" }}>
                    ▾
                  </div>
                </div>

                {/* Expansión */}
                {open && (
                  <div style={{
                    padding:"14px 18px 16px",
                    background: `${g.color}08`,
                    border: `2px solid ${g.color}`,
                    borderTop: "none",
                    borderRadius: "0 0 14px 14px",
                    animation: "fadeUp .2s ease both",
                  }}>
                    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:13.5, color:g.color, marginBottom:10 }}>
                      {g.expand.headline}
                    </div>
                    <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:6 }}>
                      {g.expand.points.map((pt, i) => (
                        <li key={i} style={{ display:"flex", gap:8, alignItems:"flex-start", fontSize:12.5, color:T.textSecondary, lineHeight:1.55 }}>
                          <span style={{ color:g.color, marginTop:1, flexShrink:0 }}>✓</span>
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Campo: nombre */}
        <div className="fade-up fade-up-3" style={{ marginTop:18 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:7 }}>
            ¿Cómo te llama NutrIA?
          </label>
          <input
            type="text"
            placeholder="Tu nombre o apodo"
            value={userData.name}
            onChange={e => set({ name: e.target.value })}
            style={{
              width:"100%", padding:"11px 14px", fontSize:14,
              fontFamily:"'Nunito Sans', sans-serif",
              background:T.surface, border:`1.5px solid ${T.border}`,
              borderRadius:12, color:T.textPrimary, boxShadow:T.shadow,
              transition:"border-color .18s",
            }}
            onFocus={e => (e.target.style.borderColor = T.teal)}
            onBlur={e => (e.target.style.borderColor = T.border)}
          />
        </div>
      </div>

      {/* Footer fijo */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"14px 22px 24px", background:`linear-gradient(transparent, ${T.bg} 45%)` }}>
        <button
          id="btn-goal-next"
          className="btn-primary"
          onClick={onNext}
          disabled={!userData.goal}
          style={{ width:"100%", justifyContent:"center", padding:"14px" }}
        >
          Siguiente — Biometría <Icon name="arrowRight" size={15} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default OnboardGoal;
