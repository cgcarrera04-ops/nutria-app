import { useState } from "react";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";

const WORKOUT = {
  name:"Fuerza · Tren Superior A", duration:"45 min", intensity:"Moderada",
  exercises:[
    { id:0, name:"Press de Banca",    sets:4, reps:"8-10",  rest:"90s", muscle:"Pecho",   equipment:"Barra",      substitute:"Press con mancuernas en banco plano", technique:"Baja la barra lentamente (2s) hasta rozar la parte media del pecho y empuja fuerte hacia arriba.", tip:"Mantén los omóplatos juntos y los pies empujando el suelo (leg drive)." },
    { id:1, name:"Jalón al pecho",    sets:3, reps:"10-12", rest:"75s", muscle:"Espalda", equipment:"Máquina",    substitute:"Remo con mancuerna", technique:"Tira de la barra hacia la clavícula sacando pecho y juntando las escápulas.", tip:"Piensa en tirar con los codos hacia abajo, no con las manos." },
    { id:2, name:"Press militar",     sets:3, reps:"8-10",  rest:"90s", muscle:"Hombros", equipment:"Mancuernas", substitute:"Elevaciones laterales (−40% peso)", technique:"Empuja las mancuernas sobre la cabeza hasta bloquear los codos sin arquear en exceso la espalda baja.", tip:"Contrae el abdomen y los glúteos para mantener la estabilidad." },
    { id:3, name:"Curl con barra",    sets:3, reps:"10-12", rest:"60s", muscle:"Bíceps",  equipment:"Barra",      substitute:"Curl alternado con mancuernas", technique:"Flexiona los codos subiendo el peso sin balancear el torso.", tip:"Mantén los codos fijos a los lados del cuerpo durante todo el recorrido." },
    { id:4, name:"Extensión tríceps", sets:3, reps:"12-15", rest:"60s", muscle:"Tríceps", equipment:"Polea",      substitute:"Fondos en banco (peso corporal)", technique:"Extiende los brazos por completo hacia abajo empujando la cuerda y separando los extremos al final.", tip:"No dejes que los codos se muevan hacia adelante al subir el peso." },
  ],
};

const equipmentMap = { gym:"gym", home:"home", outdoor:"outdoor" };

const TrainingScreen = ({ onBack }) => {
  const { state }          = useApp();
  const { userData }       = state;
  const equipKey           = equipmentMap[userData.equipment] || "gym";
  const hasInjuries        = (userData.injuries || []).length > 0;

  const [expanded, setExpanded] = useState(null);
  const [done, setDone]         = useState({});

  // 1. Normalizar lesiones del usuario (ej: "Rodillas" -> "rodilla")
  const normInjuries = (userData.injuries || []).map(i => i.toLowerCase().replace(/s$/, ""));
  const bankTraining = state.plan?.training;

  const WORKOUT_DATA = (() => {
    if (!bankTraining || !bankTraining.days || bankTraining.days.length === 0) return WORKOUT;

    // Tomamos el primer día del banco (podría expandirse para multi-día)
    const day = bankTraining.days[0];
    const exercises = (day.exercises || []).filter(ex => {
      // Filtrar si el ejercicio está contraindicado por alguna lesión del usuario
      if (ex.avoid_if_injury && Array.isArray(ex.avoid_if_injury)) {
        const contra = ex.avoid_if_injury.some(inj => normInjuries.includes(inj.toLowerCase()));
        if (contra) return false;
      }
      return true;
    }).map((ex, i) => ({
      id: i,
      name: ex.name,
      sets: ex.sets || 3,
      reps: ex.reps || "10",
      rest: ex.rest_sec ? `${ex.rest_sec}s` : "60s",
      muscle: ex.muscle || "General",
      equipment: ex.equipment || "Libre",
      substitute: ex.substitute || "Variante libre",
      technique: ex.technique || "Mantén la técnica estricta y controla la fase excéntrica.",
      tip: ex.tip || "Concéntrate en la contracción muscular."
    }));

    return {
      name: day.name || "Sesión de Entrenamiento",
      duration: bankTraining.sessions_per_week ? `${bankTraining.sessions_per_week} sesiones/sem` : "3 sesiones/sem",
      intensity: bankTraining.split || "Rutina",
      exercises,
      note: exercises.length < (day.exercises || []).length ? "Se omitieron ejercicios contraindicados por tus lesiones reportadas." : null
    };
  })();

  const totalSets    = WORKOUT_DATA.exercises.reduce((a,e) => a + e.sets, 0);
  const completedCnt = Object.values(done).filter(Boolean).length;
  const allDone      = completedCnt === totalSets && totalSets > 0;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 16px 110px", background:T.bg, minHeight:"100vh" }}>
      {/* Header */}
      <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:T.shadow }}>
          <Icon name="arrowLeft" size={17} color={T.textSecondary} />
        </button>
        <div>
          <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>MÓDULO 02</div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:19, color:T.textPrimary }}>Entrenamiento Táctico</h2>
        </div>
      </div>

      {/* Mascota según equipamiento */}
      <div className="fade-up fade-up-1 card" style={{ display:"flex", gap:14, alignItems:"center", marginBottom:10, padding:"14px 16px" }}>
        <img
          src={MASCOT.training[equipKey]}
          alt={`NutrIA - ${equipKey}`}
          onError={e => { e.target.src = MASCOT.logo; }}
          style={{ width:72, height:72, borderRadius:14, objectFit:"cover", flexShrink:0, boxShadow:`0 2px 12px rgba(43,188,185,0.18)` }}
        />
        <div>
          <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:15, marginBottom:4, color:T.textPrimary }}>
            {WORKOUT_DATA.name}
          </div>
          <div style={{ display:"flex", gap:7 }}>
            <span className="tag" style={{ background:T.tealLight, color:T.teal, border:`1.5px solid ${T.border}` }}>⏱ {WORKOUT_DATA.duration}</span>
            <span className="tag" style={{ background:T.card, color:T.textMuted, border:`1.5px solid ${T.border}` }}>↗ {WORKOUT_DATA.intensity}</span>
          </div>
        </div>
      </div>

      {/* Aviso de lesiones */}
      {hasInjuries && (
        <div className="fade-up" style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10, padding:"12px 14px", background:T.amberLight, border:`1.5px solid ${T.amber}50`, borderRadius:13 }}>
          <img
            src={MASCOT.training.injury}
            alt="NutrIA revisando lesión"
            onError={e => { e.target.src = MASCOT.logo; }}
            style={{ width:44, height:44, borderRadius:11, objectFit:"cover", flexShrink:0, animation:"float 3.5s ease-in-out infinite" }}
          />
          <div>
            <div style={{ fontSize:12.5, fontWeight:600, color:T.amber, marginBottom:2 }}>Plan adaptado por lesiones</div>
            <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.5 }}>
              NutrIA eliminó ejercicios de alto impacto en: <strong>{userData.injuries.join(", ")}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Aviso de fatiga */}
      {WORKOUT_DATA.note && (
        <div className="fade-up" style={{ display:"flex", gap:12, alignItems:"center", marginBottom:10, padding:"12px 14px", background:`${T.amber}15`, border:`1.5px solid ${T.amber}60`, borderRadius:13 }}>
          <span style={{ fontSize: 24 }}>🔋</span>
          <div>
            <div style={{ fontSize:12.5, fontWeight:600, color:T.brown, marginBottom:2 }}>Ajuste de Entrenamiento</div>
            <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.5 }}>
              {WORKOUT_DATA.note}
            </div>
          </div>
        </div>
      )}

      {/* Progress bar total */}
      <div className="fade-up fade-up-2" style={{ background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:12, padding:"12px 14px", marginBottom:10, boxShadow:T.shadow }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:7 }}>
          <span style={{ fontSize:12, color:T.textMuted }}>Series completadas</span>
          <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:13, color:T.teal }}>{completedCnt}/{totalSets}</span>
        </div>
        <div style={{ height:4, background:T.border, borderRadius:2, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(completedCnt/totalSets)*100}%`, background:`linear-gradient(90deg,${T.teal},${T.tealDark})`, borderRadius:2, transition:"width .3s ease" }} />
        </div>
      </div>

      {/* Celebración al terminar */}
      {allDone && (
        <div className="fade-up card" style={{ textAlign:"center", padding:20, marginBottom:10, background:T.tealLight, border:`1.5px solid ${T.teal}` }}>
          <img src={MASCOT.emptyState.celebration} alt="¡Completado!" onError={e => { e.target.style.display="none"; }}
            style={{ width:80, height:80, borderRadius:18, objectFit:"cover", margin:"0 auto 12px", animation:"float 2.5s ease-in-out infinite" }} />
          <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:16, color:T.teal, marginBottom:4 }}>
            ¡Completaste el entrenamiento!
          </div>
          <div style={{ fontSize:12.5, color:T.textSecondary }}>NutrIA está orgullosa. ¡Descansa bien! 🦦</div>
        </div>
      )}

      {/* Ejercicios con periodización fisiológica real (mesociclo de 4 semanas) */}
      {(() => {
        const currentWeek = state.currentWeek || 1;
        const cycleWeek = ((currentWeek - 1) % 4) + 1;
        const lastFatigue = state.lastCheckin?.fatigue || "no";
        
        return WORKOUT_DATA.exercises.map((ex, i) => {
          const hasOverload = ex.equipment !== "none" && ex.equipment !== "Libre" && ex.equipment !== "peso corporal";
          
          // Motor de periodización adaptativo basado en encuesta semanal
          let overloadLabel = "";
          let overloadDesc = "";
          let overloadBg = T.amber;
          
          if (lastFatigue === "yes") {
            overloadLabel = `💤 DESCARGA POR FATIGA ALTA (ENCUESTA)`;
            overloadDesc = "Reportaste fatiga alta. Reduce el peso un 15-20% o haz 1 serie menos para facilitar la recuperación.";
            overloadBg = T.blue;
          } else if (lastFatigue === "mild") {
            overloadLabel = `🟢 CONSOLIDACIÓN POR FATIGA (ENCUESTA)`;
            overloadDesc = "Reportaste fatiga moderada. Mantén las cargas constantes sin subir peso esta semana.";
            overloadBg = T.teal;
          } else {
            // Ciclo regular de periodización
            if (cycleWeek === 1) {
              overloadLabel = `🟢 SEMANA 1: BASE DE FUERZA (RPE 7-8)`;
              overloadDesc = "Consolida la técnica. Enfócate en el control y guarda 2 reps en reserva.";
              overloadBg = T.teal;
            } else if (cycleWeek === 2) {
              overloadLabel = `⚡ SEMANA 2: SOBRECARGA VOLUMÉTRICA`;
              overloadDesc = hasOverload 
                ? "Sube +2.5% a 5% de peso respecto a la semana pasada con las mismas reps."
                : "Suma +1 repetición en las últimas dos series.";
            } else if (cycleWeek === 3) {
              overloadLabel = `🔥 SEMANA 3: PICO DE INTENSIDAD (RPE 9)`;
              overloadDesc = hasOverload
                ? "Suma +5% de peso o intenta llegar al fallo técnico controlado en la última serie."
                : "Reduce los descansos entre series en 10-15 segundos.";
            } else if (cycleWeek === 4) {
              overloadLabel = `💤 SEMANA 4: DESCARGA PLANIFICADA (DELOAD)`;
              overloadDesc = "Asimilación nerviosa. Baja el peso un 30-40% para recuperación total.";
              overloadBg = T.blue;
            }
          }

          return (
            <div key={ex.id} className="fade-up" style={{ animationDelay:`${i*.07}s`, marginBottom:10 }}>
              <div className="card" style={{ cursor:"pointer", position: "relative", overflow: "hidden", paddingTop: 20 }} onClick={() => setExpanded(expanded===ex.id ? null : ex.id)}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, background: overloadBg, color: "#fff", fontSize: 9.5, fontWeight: 700, textAlign: "center", padding: "3px 6px", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {overloadLabel}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop: 4 }}>
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <div style={{ width:36, height:36, borderRadius:10, background:T.tealLight, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name="dumbbell" size={16} color={T.teal} />
                </div>
                <div>
                  <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:14.5, color:T.textPrimary }}>{ex.name}</div>
                  <div style={{ fontSize:12, color:T.textMuted }}>{ex.muscle} · {ex.equipment}</div>
                </div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:14, color:T.teal }}>{ex.sets}×{ex.reps}</div>
                <div style={{ fontSize:11, color:T.textMuted }}>↺ {ex.rest}</div>
              </div>
            </div>

            {expanded===ex.id && (
              <div style={{ marginTop:14, paddingTop:14, borderTop:`1px solid ${T.border}` }}>
                <div style={{ fontSize:10.5, color:T.textMuted, marginBottom:8, fontFamily:"'IBM Plex Mono', monospace" }}>MARCAR SERIES</div>
                <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                  {[...Array(ex.sets)].map((_,si) => {
                    const k = `${ex.id}-${si}`, isDone = done[k];
                    return (
                      <div key={si} onClick={e => { e.stopPropagation(); setDone(p => ({...p, [k]:!p[k]})); }}
                        style={{ width:42, height:42, borderRadius:10, background: isDone?T.tealLight:T.card, border:`1.5px solid ${isDone?T.teal:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all .18s", boxShadow:T.shadow }}>
                        {isDone
                          ? <Icon name="check" size={15} color={T.teal} />
                          : <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:12, color:T.textMuted }}>{si+1}</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding:"10px 12px", background:T.tealLight, border:`1.5px solid ${T.border}`, borderRadius:10, display:"flex", gap:9, alignItems:"flex-start", marginBottom:10 }}>
                  <span style={{ fontSize:14 }}>💡</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:T.teal, marginBottom:2 }}>Ejecución técnica</div>
                    <div style={{ fontSize:11.5, color:T.textSecondary, lineHeight:1.4 }}>{ex.technique}</div>
                    <div style={{ fontSize:11, color:T.textMuted, marginTop:4, fontStyle:"italic" }}>Tip de NutrIA: {ex.tip}</div>
                    {overloadDesc && (
                      <div style={{ fontSize:11, color: overloadBg === T.teal ? T.teal : (overloadBg === T.blue ? T.blue : T.amber), fontWeight:700, marginTop:6, display:"flex", gap:4, alignItems:"center" }}>
                        <span>⚡</span>
                        <span>Estrategia: {overloadDesc}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ padding:"9px 12px", background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, display:"flex", gap:9, alignItems:"flex-start" }}>
                  <span style={{ fontSize:14 }}>🔄</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:T.textSecondary, marginBottom:2 }}>Sustituto: {ex.substitute}</div>
                    <div style={{ fontSize:11.5, color:T.textMuted }}>Mismo grupo muscular · Mismo patrón de movimiento</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }); })()}
  </div>
  );
};

export default TrainingScreen;
