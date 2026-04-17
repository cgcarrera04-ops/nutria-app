import { useState } from "react";
import ProgressBar from "../../components/ui/ProgressBar";
import Icon from "../../components/ui/Icon";
import TagSelector from "../../components/ui/TagSelector";
import { useApp } from "../../context/AppContext";
import MASCOT from "../../constants/mascotImages";
import T from "../../tokens/T";

// ── Opciones ──────────────────────────────────────────────────────────────────
const COOK_MODES = [
  { id:"cook",  emoji:"🍳", label:"Cocino en casa",    sub:"Recetas completas a tu presupuesto" },
  { id:"buy",   emoji:"🛒", label:"Compro preparado",  sub:"Solo opciones listas para comer" },
  { id:"mixed", emoji:"⚡", label:"Mitad y mitad",     sub:"Cocino algunos días, compro otros" },
];
const COOK_TIMES = [
  { val:"15min", emoji:"⚡", label:"15 min",  sub:"Muy poco" },
  { val:"30min", emoji:"🍳", label:"30 min",  sub:"Moderado" },
  { val:"60min", emoji:"👨‍🍳", label:"60 min",  sub:"Cómodo"   },
];
const EXERCISE_TIMES = [
  { val:"20min",  emoji:"⚡", label:"20-30 min",  sub:"HIIT / Circuitos" },
  { val:"45min",  emoji:"🏋️", label:"45-60 min",  sub:"Fuerza estándar"   },
  { val:"60min",  emoji:"💪", label:"60-90 min",  sub:"Sesión completa"   },
  { val:"90min+", emoji:"🏆", label:"+90 min",    sub:"Atleta / Doble"    },
];
const EQUIPMENT_OPTS = [
  { val:"gym",     emoji:"🏟️",  label:"Gym completo",   sub:"Máquinas, poleas, barra olímpica" },
  { val:"home",    emoji:"🏠",  label:"Casa / mínimo",  sub:"Mancuernas, bandas, peso corporal" },
  { val:"outdoor", emoji:"🌳",  label:"Al aire libre",  sub:"Parque, calistenia, escaleras" },
];
const ACTIVITY_OPTS = [
  { val:"sedentary", emoji:"💺", label:"Sedentario",          sub:"Escritorio, <5k pasos/día" },
  { val:"light",     emoji:"🚶", label:"Levemente activo",    sub:"Caminatas, trabajo de pie" },
  { val:"moderate",  emoji:"🏃", label:"Moderadamente activo",sub:"Ejercicio 3-4 días/sem" },
  { val:"very",      emoji:"⚡", label:"Muy activo",          sub:"Trabajo físico, >12k pasos/día" },
];
const ALLERGY_SUGGESTIONS = ["Mariscos","Lácteos","Gluten","Huevos","Frutos secos","Soya","Cerdo","Maní","Picante"];
const INJURY_SUGGESTIONS  = ["Rodillas","Hombros","Lumbar","Cervical","Muñecas","Codos","Cadera","Tobillo"];

// ── Helper de selector de grilla ─────────────────────────────────────────────
const GridSelect = ({ options, value, onChange, cols = 3 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols}, 1fr)`, gap:8 }}>
    {options.map(o => {
      const sel = value === o.val || value === o.id;
      const id  = o.val || o.id;
      return (
        <div key={id} onClick={() => onChange(id)} style={{
          padding:"12px 8px",
          background: sel ? T.tealMid : T.surface,
          border:`1.5px solid ${sel ? T.teal : T.border}`,
          borderRadius:12, cursor:"pointer", textAlign:"center",
          transition:"all .18s", boxShadow:T.shadow,
        }}>
          <div style={{ fontSize:20, marginBottom:4 }}>{o.emoji}</div>
          <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:11.5, fontWeight:500, color: sel ? T.teal : T.textPrimary }}>{o.label}</div>
          {o.sub && <div style={{ fontSize:10, color:T.textMuted, marginTop:2, lineHeight:1.3 }}>{o.sub}</div>}
        </div>
      );
    })}
  </div>
);

// ── Componente principal ──────────────────────────────────────────────────────
const OnboardContext = ({ onNext, onBack }) => {
  const { state, dispatch } = useApp();
  const { userData } = state;
  const set     = (payload) => dispatch({ type: "UPDATE_USER_DATA", payload });
  const addTag  = (field, val) => dispatch({ type: "ADD_TAG", field, payload: val });
  const remTag  = (field, val) => dispatch({ type: "REMOVE_TAG", field, payload: val });

  const [budget, setBudget] = useState(userData.budget || 150);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const canProceed = userData.cookMode && userData.exerciseTime && userData.equipment && userData.activity;

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:T.bg }}>
      <ProgressBar step={3} total={3} completedSteps={[1,2]} onStepClick={n => { if(n <= 2) onBack(); }} />

      <div style={{ flex:1, maxWidth:520, margin:"0 auto", padding:"24px 20px 110px", width:"100%" }}>

        <div className="fade-up">
          <span className="tag" style={{ background:T.brownLight, color:T.brown, border:`1.5px solid ${T.border}` }}>
            PASO 3 DE 3 · LOGÍSTICA + FRICCIÓN
          </span>
        </div>
        <h2 className="fade-up fade-up-1" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:24, marginBottom:6, marginTop:12, color:T.textPrimary }}>
          Tu mundo real
        </h2>
        <p className="fade-up fade-up-2" style={{ color:T.textSecondary, fontSize:13.5, marginBottom:22, lineHeight:1.65 }}>
          El plan existirá dentro de tus restricciones reales, no las de un influencer.
        </p>

        {/* ── ¿Cocinas o compras? ── */}
        <div className="fade-up fade-up-2" style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>
            ¿Cómo te alimentas normalmente?
          </label>
          <GridSelect options={COOK_MODES} value={userData.cookMode} onChange={v => set({ cookMode:v })} cols={3} />
        </div>

        {/* ── Tiempo de cocina (solo si no es "buy") ── */}
        {userData.cookMode && userData.cookMode !== "buy" && (
          <div className="fade-up" style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>
              Tiempo disponible para cocinar por día
            </label>
            <GridSelect options={COOK_TIMES} value={userData.cookTime} onChange={v => set({ cookTime:v })} cols={3} />
          </div>
        )}

        {/* ── Tiempo para ejercicio ── */}
        <div className="fade-up fade-up-2" style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>
            Tiempo disponible para ejercitarte
          </label>
          <GridSelect options={EXERCISE_TIMES} value={userData.exerciseTime} onChange={v => set({ exerciseTime:v })} cols={2} />
        </div>

        {/* ── Equipamiento ── */}
        <div className="fade-up fade-up-3" style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>
            Equipamiento de entrenamiento
          </label>
          {userData.equipment && (
            <div style={{ display:"flex", justifyContent:"center", marginBottom:14 }}>
              <img
                src={MASCOT.training[userData.equipment] || MASCOT.training.gym}
                alt={`Equipamiento: ${userData.equipment}`}
                style={{
                  width:140, height:140, objectFit:"cover", borderRadius:24,
                  background:`${T.teal}15`, border:`1.5px solid ${T.border}`,
                  boxShadow:`0 6px 24px rgba(43,188,185,0.14)`,
                  transition:"all .3s ease",
                }}
              />
            </div>
          )}
          <GridSelect options={EQUIPMENT_OPTS} value={userData.equipment} onChange={v => set({ equipment:v })} cols={3} />
          <p style={{ fontSize:11, color:T.textMuted, marginTop:7, lineHeight:1.5 }}>
            El plan de entrenamiento se adapta completamente al equipo que indiques. Sin excúsas.
          </p>
        </div>

        {/* ── Presupuesto ── */}
        <div className="fade-up fade-up-3" style={{ background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:14, padding:18, marginBottom:16, boxShadow:T.shadow }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:13, color:T.textSecondary, fontWeight:600 }}>Presupuesto semanal (solo tú)</span>
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:18, color:T.teal, fontWeight:500 }}>S/ {budget}</span>
          </div>
          <input type="range" min={30} max={500} value={budget} onChange={e => { setBudget(+e.target.value); set({ budget: +e.target.value }); }} style={{ width:"100%" }} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:7 }}>
            <span style={{ fontSize:11, color:T.textMuted }}>S/ 30 · Ajustado</span>
            <span style={{ fontSize:11, color:T.textMuted }}>S/ 500 · Premium</span>
          </div>
          <p style={{ fontSize:11.5, color:T.textMuted, marginTop:8, lineHeight:1.5 }}>
            Sé honesto. Un plan aspiracional que no puedes costear es peor que ningún plan.
          </p>
        </div>

        {/* ── Actividad ── */}
        <div className="fade-up fade-up-3" style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>
            Nivel de actividad fuera del gym
          </label>
          <GridSelect options={ACTIVITY_OPTS} value={userData.activity} onChange={v => set({ activity:v })} cols={2} />
        </div>

        {/* ── BOTÓN OPCIONES AVANZADAS ── */}
        <div className="fade-up fade-up-4" style={{ marginBottom:16 }}>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            style={{ 
              width:"100%", padding:"14px", background:T.surface, border:`1.5px solid ${T.border}`, 
              borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center",
              cursor:"pointer", boxShadow:T.shadow, transition:"all .2s"
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Icon name="layers" size={18} color={T.teal} />
              <span style={{ fontSize:13.5, fontWeight:600, color:T.textPrimary }}>Opciones Avanzadas</span>
            </div>
            <Icon name={showAdvanced ? "arrowLeft" : "arrowRight"} size={16} color={T.textMuted} />
          </button>
        </div>

        {showAdvanced && (
          <div style={{ animation:"fadeUp .3s ease both" }}>
            <p style={{ fontSize:12, color:T.textMuted, marginBottom:16, lineHeight:1.5 }}>
              Detalles clínicos, alérgenos y logística específica.
            </p>

            {/* ── Sueño ── */}
            <div style={{ background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:14, padding:18, marginBottom:16, boxShadow:T.shadow }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                  <span style={{ fontSize:16 }}>🌙</span>
                  <span style={{ fontSize:13, fontWeight:600, color:T.textSecondary }}>Horas de sueño promedio</span>
                </div>
                <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:18, color:T.brown, fontWeight:500 }}>{userData.sleep || 7}h</span>
              </div>
              <input type="range" min={4} max={10} value={userData.sleep || 7} onChange={e => set({ sleep: +e.target.value })} style={{ width:"100%" }} />
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:7 }}>
                <span style={{ fontSize:11, color:T.textMuted }}>4h · Crítico</span>
                <span style={{ fontSize:11, color:T.textMuted }}>10h · Óptimo</span>
              </div>
            </div>

            {/* ── Estrés ── */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>Nivel de estrés actual</label>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:7 }}>
                {[1,2,3,4,5].map(n => (
                  <div key={n} onClick={() => set({ stress:n })} style={{
                    padding:"11px 6px",
                    background: userData.stress===n ? T.tealMid : T.surface,
                    border:`1.5px solid ${userData.stress===n ? T.teal : T.border}`,
                    borderRadius:11, cursor:"pointer", textAlign:"center", transition:"all .18s", boxShadow:T.shadow,
                  }}>
                    <div style={{ fontSize:18 }}>{["😌","🙂","😐","😰","🤯"][n-1]}</div>
                    <div style={{ fontSize:9.5, color:T.textMuted, marginTop:3 }}>
                      {["Calmado","Normal","Moderado","Alto","Extremo"][n-1]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Alergias ── */}
            <div style={{ background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:14, padding:16, marginBottom:14, boxShadow:T.shadow }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:11 }}>
                <span style={{ fontSize:18 }}>🚫</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:T.textSecondary }}>Alergias y exclusiones</div>
                  <div style={{ fontSize:11.5, color:T.textMuted }}>Jamás aparecerán en tu plan, incluidos los sustitutos</div>
                </div>
              </div>
              <TagSelector
                tags={userData.allergies}
                onAdd={v => addTag("allergies", v)}
                onRemove={v => remTag("allergies", v)}
                suggestions={ALLERGY_SUGGESTIONS}
                placeholder="ej: cilantro, ají amarillo, hígado…"
                color={T.amber}
              />
            </div>

            {/* ── Lesiones ── */}
            <div style={{ background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:14, padding:16, marginBottom:14, boxShadow:T.shadow }}>
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:11 }}>
                <span style={{ fontSize:18 }}>🦴</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:T.textSecondary }}>Lesiones biomecánicas</div>
                  <div style={{ fontSize:11.5, color:T.textMuted }}>El entrenamiento evitará esas zonas completamente</div>
                </div>
              </div>
              <TagSelector
                tags={userData.injuries}
                onAdd={v => addTag("injuries", v)}
                onRemove={v => remTag("injuries", v)}
                suggestions={INJURY_SUGGESTIONS}
                placeholder="ej: tendinitis de codo, fascitis…"
                color={T.brown}
              />
            </div>

            {/* ── Caja de Pandora ── */}
            <div style={{ marginBottom:14 }}>
              <div style={{ display:"flex", gap:9, alignItems:"center", marginBottom:9 }}>
                <span style={{ fontSize:22 }}>🗝️</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:T.textSecondary }}>La Caja de Pandora</div>
                  <div style={{ fontSize:11.5, color:T.textMuted }}>Lo que los sliders no pueden capturar — en tus palabras</div>
                </div>
              </div>
              <textarea
                value={userData.pandoraText || ""}
                onChange={e => set({ pandoraText: e.target.value })}
                placeholder={"Ejemplos:\n• Trabajo de noche de 11pm a 6am\n• Los miércoles no puedo cocinar nada\n• Tengo gastritis, evitar ácidos y café\n• Soy vegano"}
                rows={4}
                maxLength={500}
                style={{
                  width:"100%", padding:"13px 15px", fontSize:13, fontFamily:"'Nunito Sans', sans-serif",
                  background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:12,
                  resize:"none", lineHeight:1.7, color:T.textPrimary, boxShadow:T.shadow, transition:"border-color .2s",
                }}
                onFocus={e => (e.target.style.borderColor = T.teal)}
                onBlur={e => (e.target.style.borderColor = T.border)}
              />
              <div style={{ fontSize:11, color:T.textMuted, marginTop:5, textAlign:"right" }}>
                {(userData.pandoraText||"").length}/500
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer fijo */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"14px 22px 24px", background:`linear-gradient(transparent, ${T.bg} 45%)`, display:"flex", justifyContent:"space-between" }}>
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="arrowLeft" size={15} color={T.textSecondary} /> Volver
        </button>
        <button id="btn-generate" className="btn-primary" onClick={onNext} disabled={!canProceed} style={{ padding:"13px 30px" }}>
          Que NutrIA piense <Icon name="zap" size={15} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default OnboardContext;
