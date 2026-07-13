import { useState, useEffect } from "react";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";

const HABITS_INITIAL = [
  { id:"snooze",  label:"Despertar sin snooze",                    emoji:"⏰" },
  { id:"sun",     label:"10 min de luz solar al despertar",         emoji:"☀️" },
  { id:"vitd",    label:"Suplemento de vitamina D",                 emoji:"💊" },
  { id:"screens", label:"Apagar pantallas 30 min antes de dormir",  emoji:"🌙" },
  { id:"stress",  label:"Check de estrés nocturno (1-5)",           emoji:"🧠" },
];

const HabitsScreen = ({ onBack }) => {
  const { state, dispatch } = useApp();
  const water    = state.todayHabits.water;
  const weight   = Number(state.userData.weight || 70);
  const waterGoal = Math.max(6, Math.ceil((weight * 35) / 250));
  const steps    = state.todayHabits.steps || 0;

  // Calculo de meta de pasos dinamico segun somatotipo, objetivo y actividad actual
  let baseSteps = 8000;
  const act = state.userData.activity || "moderate";
  if (act === "sedentary") baseSteps = 6000;
  else if (act === "light") baseSteps = 8000;
  else if (act === "moderate") baseSteps = 10000;
  else if (act === "very") baseSteps = 12000;

  const som = state.userData.somatotype || "athletic";
  if (som === "slim") baseSteps -= 1000;
  else if (som === "robust") baseSteps += 1000;

  const goal = state.userData.goal || "deficit";
  if (goal === "deficit") baseSteps += 1500;
  else if (goal === "surplus") baseSteps -= 1500;

  const stepsGoal = Math.max(5000, Math.min(15000, baseSteps));

  const pct = Math.min(100, Math.round((water / waterGoal) * 100));

  const IMG_THIRSTY = "https://i.postimg.cc/Jn4kCQjM/image.png";
  const IMG_FLOATIE = "https://i.postimg.cc/RFFNDZz0/image.png";
  const IMG_COCO    = "https://i.postimg.cc/8Cs7yCSn/image.png";
  const IMG_LOGO    = MASCOT.logo;

  let mascotImg = IMG_THIRSTY;
  let mascotText = "Un vasito me caería genial...";
  let floatAnim = "none";

  if (pct >= 100) {
    mascotImg = IMG_COCO;
    mascotText = "Meta de hidratación cumplida, ¡metabolismo al 100%!";
    floatAnim = "float 2.5s ease-in-out infinite";
  } else if (pct >= 50) {
    mascotImg = IMG_FLOATIE;
    mascotText = "¡Ya casi llegas a la meta! El agua está deliciosa hoy.";
    floatAnim = "float 3s ease-in-out infinite";
  }

  const [habits, setHabits] = useState(HABITS_INITIAL.map(h => ({ ...h, done: false })));
  const [isTracking, setIsTracking] = useState(false);

  const toggleHabit = (id) => setHabits(prev => prev.map(h => h.id === id ? { ...h, done: !h.done } : h));

  const setWater  = (n) => {
    dispatch({ type:"UPDATE_HABITS", payload:{ water: n } });
    dispatch({ type:"SAVE_PROFILE" });
  };

  const handleManualStepsChange = (val) => {
    const num = Math.max(0, Math.min(40000, Number(val) || 0));
    dispatch({ type:"UPDATE_HABITS", payload:{ steps: num } });
    dispatch({ type:"SAVE_PROFILE" });
  };

  // Podometro Automatico via Acelerometro del Navegador
  const toggleAutomaticPedometer = () => {
    if (isTracking) {
      if (window.__nutriaMotionListener) {
        window.removeEventListener("devicemotion", window.__nutriaMotionListener);
        delete window.__nutriaMotionListener;
      }
      setIsTracking(false);
    } else {
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === "granted") {
              startMotionListener();
            } else {
              alert("Necesitamos accesibilidad de sensores para contar pasos.");
            }
          })
          .catch(console.error);
      } else {
        startMotionListener();
      }
    }
  };

  const startMotionListener = () => {
    setIsTracking(true);
    let lastTime = Date.now();
    let lastAcc = 0;
    let localSteps = steps;

    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const now = Date.now();
      if (now - lastTime > 350) {
        const delta = Math.abs(mag - lastAcc);
        if (delta > 3.2) {
          localSteps += 1;
          dispatch({ type: "UPDATE_HABITS", payload: { steps: localSteps } });
          lastTime = now;
        }
      }
      lastAcc = mag;
    };

    window.__nutriaMotionListener = handleMotion;
    window.addEventListener("devicemotion", handleMotion);
  };

  useEffect(() => {
    return () => {
      if (window.__nutriaMotionListener) {
        window.removeEventListener("devicemotion", window.__nutriaMotionListener);
        delete window.__nutriaMotionListener;
      }
    };
  }, []);

  const allWaterDone = water >= waterGoal;
  const noWater      = water === 0;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 16px 110px", background:T.bg, minHeight:"100vh" }}>
      {/* Header */}
      <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:T.shadow }}>
          <Icon name="arrowLeft" size={17} color={T.textSecondary} />
        </button>
        <div>
          <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>MÓDULO 03</div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:19, color:T.textPrimary }}>Micro-Hábitos</h2>
        </div>
      </div>

      {/* Hidratacion */}
      <div className="fade-up fade-up-1 card" style={{ marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Icon name="droplets" size={20} color={T.teal} />
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>Hidratación</div>
              <div style={{ fontSize:12, color:T.textMuted }}>Meta: {waterGoal} vasos · {(waterGoal * 250 / 1000).toFixed(1)}L</div>
            </div>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:24, fontWeight:500, color:T.teal }}>
            {water}<span style={{ fontSize:13, color:T.textMuted }}>/{waterGoal}</span>
          </div>
        </div>

        {/* Mascota y Estado de Hidratación Dinámico */}
        <div style={{
          display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between",
          background: `linear-gradient(135deg, ${T.tealLight} 0%, rgba(2,132,199,0.02) 100%)`,
          border: `1.5px solid ${T.border}`, borderRadius: 14, padding: "12px 14px", marginBottom: 14,
          animation: "fadeUp .3s ease both"
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.teal, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>
              {pct >= 100 ? "¡Felicidades!" : pct >= 50 ? "¡Excelente avance!" : "¡A hidratarse!"}
            </div>
            <div style={{ fontSize: 13, color: T.textSecondary, fontStyle: "italic", lineHeight: 1.4 }}>
              "{mascotText}"
            </div>
          </div>
          <img 
            src={mascotImg} 
            alt="NutrIA Hidratación" 
            style={{ width: 56, height: 56, objectFit: "contain", animation: floatAnim, borderRadius: 8 }} 
            onError={(e) => { 
              if (e.target.src !== IMG_LOGO) { 
                e.target.src = IMG_LOGO; 
              } else { 
                e.target.style.display = "none"; 
              } 
            }} 
          />
        </div>

        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:12, justifyContent:"center" }}>
          {[...Array(waterGoal)].map((_,i) => (
            <div key={i} onClick={() => setWater(i+1)} style={{
              width:38, height:50, borderRadius:10, cursor:"pointer",
              background: i<water ? T.tealLight : T.card,
              border:`1.5px solid ${i<water ? T.teal : T.border}`,
              display:"flex", alignItems:"flex-end", justifyContent:"center",
              paddingBottom:5, transition:"all .18s", position:"relative", overflow:"hidden", boxShadow:T.shadow,
            }}>
              {i<water && <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"65%", background:`${T.teal}22`, borderRadius:"0 0 8px 8px" }} />}
              <span style={{ fontSize:9.5, color:i<water?T.teal:T.textMuted, position:"relative", fontFamily:"'IBM Plex Mono', monospace" }}>
                {i+1}
              </span>
            </div>
          ))}
        </div>

        <button onClick={() => setWater(Math.min(water+1, waterGoal))} className="btn-ghost" style={{ width:"100%", justifyContent:"center", padding:"9px", fontSize:13 }}>
          💧 Registrar vaso de agua
        </button>
      </div>

      {/* Pasos */}
      <div className="fade-up fade-up-2 card" style={{ marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Icon name="footprints" size={20} color={T.blue} />
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>Pasos diarios</div>
              <div style={{ fontSize:12, color:T.textMuted }}>Meta: {stepsGoal.toLocaleString()} pasos</div>
            </div>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:20, fontWeight:700, color: steps >= stepsGoal ? T.teal : T.blue }}>
            {steps.toLocaleString()}
          </div>
        </div>
        
        {/* Barra de Progreso con soporte de excedido (glowing gradient) */}
        <div style={{ height:6, background:T.border, borderRadius:3, marginBottom:7, overflow:"hidden" }}>
          <div style={{ 
            height:"100%", 
            width:`${Math.min((steps/stepsGoal)*100, 100)}%`, 
            background: steps >= stepsGoal ? "linear-gradient(90deg, #F59E0B 0%, #2BBCB9 100%)" : T.blue, 
            borderRadius:3, 
            transition:"width .6s ease, background .4s ease" 
          }} />
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", marginBottom: 12 }}>
          <span style={{ fontSize:12, color: steps >= stepsGoal ? T.teal : T.textMuted, fontWeight: steps >= stepsGoal ? 600 : 400 }}>
            {Math.round((steps/stepsGoal)*100)}% completado
          </span>
          <span style={{ fontSize:12, color: steps >= stepsGoal ? T.teal : T.blue, fontWeight: 600 }}>
            {steps >= stepsGoal 
              ? `¡Superaste tu meta por ${(steps - stepsGoal).toLocaleString()} pasos! 🌟` 
              : `Faltan ${Math.max(stepsGoal-steps,0).toLocaleString()} pasos`
            }
          </span>
        </div>

        {/* Inputs Interactivos Avanzados de 1,000 en 1,000 */}
        <div style={{ display:"flex", flexDirection:"column", gap:10, borderTop:`1.5px solid ${T.border}`, paddingTop:12, marginTop:8 }}>
          
          {/* Botones táctiles de 1,000 en 1,000 */}
          <div style={{ display:"flex", gap:8, width:"100%" }}>
            <button 
              onClick={() => {
                const current = steps || 0;
                const next = Math.max(0, Math.round((current - 1000) / 1000) * 1000);
                handleManualStepsChange(next);
              }}
              style={{
                flex: 1, padding: "8px 12px", background: T.surface, border: `1.5px solid ${T.border}`,
                borderRadius: 12, fontSize: 13, fontWeight: 700, color: T.textSecondary, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.blue}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
            >
              ➖ 1,000 pasos
            </button>
            <button 
              onClick={() => {
                const current = steps || 0;
                const next = Math.round((current + 1000) / 1000) * 1000;
                handleManualStepsChange(next);
              }}
              style={{
                flex: 1, padding: "8px 12px", background: `${T.blue}12`, border: `1.5px solid ${T.blue}30`,
                borderRadius: 12, fontSize: 13, fontWeight: 700, color: T.blue, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s ease"
              }}
              onMouseEnter={e => e.currentTarget.style.background = `${T.blue}1C`}
              onMouseLeave={e => e.currentTarget.style.background = `${T.blue}12`}
            >
              ➕ 1,000 pasos
            </button>
          </div>

          {/* Ingreso manual directo (redondeado automáticamente a múltiplos de 1,000) */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:13, color:T.textSecondary, fontWeight:500 }}>Ajustar valor exacto:</span>
            <input 
              type="number" 
              step="1000"
              value={steps || 0} 
              placeholder="Ej. 8000"
              onChange={(e) => {
                const rawVal = Number(e.target.value) || 0;
                // Redondeamos inmediatamente al múltiplo de 1,000 más cercano
                const roundedVal = Math.round(rawVal / 1000) * 1000;
                handleManualStepsChange(roundedVal);
              }} 
              style={{ width:110, padding:"6px 12px", border:`1.5px solid ${T.border}`, borderRadius:10, background:T.surface, color:T.textPrimary, fontFamily:"'IBM Plex Mono', monospace", fontWeight:600, textAlign:"center" }}
            />
          </div>

          {/* Podometro en tiempo real */}
          <button 
            onClick={toggleAutomaticPedometer} 
            className="btn-ghost" 
            style={{ 
              width:"100%", 
              justifyContent:"center", 
              padding:"9px", 
              fontSize:13, 
              background: isTracking ? `${T.teal}18` : "transparent",
              color: isTracking ? T.teal : T.textSecondary,
              border: isTracking ? `1.5px solid ${T.teal}` : `1.5px solid ${T.border}`
            }}
          >
            {isTracking ? "🧵 Podómetro activo... (Camina con tu cel!)" : "🧵 Activar podómetro automático"}
          </button>
        </div>

        {steps >= stepsGoal && (
          <div style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 0", marginTop:8, animation:"fadeUp .3s ease both" }}>
            <img src={MASCOT.emptyState.celebration} alt="Meta de pasos" style={{ width:44, height:44, borderRadius:12, objectFit:"cover", animation:"float 2.5s ease-in-out infinite" }} onError={e => { e.target.style.display="none"; }} />
            <div style={{ fontSize:12.5, color:T.teal, fontWeight:600 }}>¡NutrIA está orgullosa de tu movimiento! 🎉🦦</div>
          </div>
        )}
      </div>

      {/* Habitos interactivos */}
      <div className="fade-up fade-up-3 card">
        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
          <img src={MASCOT.logo} alt="NutrIA" style={{ width:36, height:36, borderRadius:10, objectFit:"cover", animation:"float 4s ease-in-out infinite" }} onError={e => { e.target.style.display="none"; }} />
          <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>Hábitos del día</div>
        </div>
        {habits.map((h,i) => (
          <div key={h.id} onClick={() => toggleHabit(h.id)} style={{ display:"flex", gap:13, alignItems:"center", padding:"10px 0", borderBottom: i<habits.length-1 ? `1px solid ${T.border}` : "none", cursor:"pointer", transition:"opacity .18s", opacity: h.done ? 1 : 0.8 }}>
            <div style={{ width:22, height:22, borderRadius:7, background:h.done?T.tealLight:T.card, border:`1.5px solid ${h.done?T.teal:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .18s" }}>
              {h.done && <Icon name="check" size={12} color={T.teal} />}
            </div>
            <span style={{ fontSize:20 }}>{h.emoji}</span>
            <span style={{ fontSize:13.5, color:h.done?T.textPrimary:T.textSecondary, textDecoration:h.done?"line-through":"none", transition:"all .2s" }}>{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitsScreen;
