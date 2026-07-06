import { useState } from "react";
import MacroBar from "../components/ui/MacroBar";
import EmpatheticFooter from "../components/EmpatheticFooter";
import FrictionScore from "../components/domain/FrictionScore";
import FoodSearchModal from "../components/ui/FoodSearchModal";
import StreakBadge from "../components/domain/StreakBadge";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";
import { startBgMusic, stopBgMusic, playClick, playChime, setMusicMode } from "../services/audioEngine";

import { getMealsForUser } from "./NutritionScreen";

const QUICK_ACTIONS = [
  { label:"Nutrición",      sub:"Plan del día",   screen:"nutrition", emoji:"🥗",  color:T.amber },
  { label:"Entrenamiento",  sub:"Rutina de hoy",  screen:"training",  emoji:"💪",  color:T.blue  },
  { label:"Micro-hábitos",  sub:"Agua · Pasos",   screen:"habits",    emoji:"💧",  color:T.teal  },
  { label:"Buscador",       sub:"Macros de platos", screen:"foodsearch", emoji:"🔍",  color:T.brown },
];

const ProgressCalendar = ({ state }) => {
  const diffTime = Date.now() - (state.planStartDate || Date.now());
  const daysPassed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const totalDays = Math.max(14, daysPassed + (7 - (daysPassed % 7))); 
  
  return (
    <div className="fade-up fade-up-3 card" style={{ marginBottom: 10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 14 }}>
        <h4 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, margin: 0, color:T.textPrimary }}>Mapa del Éxito</h4>
        <span style={{ fontSize:11, color:T.teal, fontWeight:600, fontFamily:"'IBM Plex Mono', monospace" }}>DÍA {daysPassed + 1}</span>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7, 1fr)", gap: 6 }}>
        {["L","M","M","J","V","S","D"].map((d,i)=>(
           <div key={i} style={{textAlign:"center", fontSize:10, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace"}}>{d}</div>
        ))}
        {Array.from({ length: totalDays }).map((_, i) => {
          const isPast = i < daysPassed;
          const isToday = i === daysPassed;
          // Deterministic status to avoid random flickering on every render
          const daySeed = (state.planStartDate || 987654) + i;
          const valSeed = Math.sin(daySeed) * 10000;
          const randVal = valSeed - Math.floor(valSeed);
          const status = isPast ? (randVal > 0.18 ? '🟢' : '🟡') : '⚪'; 
          
          let bg = T.surface;
          let border = `1px solid ${T.border}`;
          if (isToday) { bg = T.tealLight; border = `1.5px solid ${T.teal}`; }
          
          return (
            <div key={i} style={{
              aspectRatio: "1/1", borderRadius: 8, background: bg, border: border,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:14
            }}>
              {isToday ? '🦦' : (isPast ? status : '')}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WaterTracker = ({ state, dispatch, sfxActive }) => {
  // Cálculo dinámico inteligente basado en peso real
  const targetWater = Math.max(6, Math.ceil(((Number(state.userData.weight) || 70) * 35) / 250));
  const water = state.userData.waterGlasses || 0;
  
  const handleAdd = () => {
    if (sfxActive) playChime();
    const newWater = water + 1;
    dispatch({ type: "UPDATE_USER_DATA", payload: { waterGlasses: newWater } });
  };
  
  const pct = Math.min(100, Math.round((water / targetWater) * 100));
  
  // Axioma 3: Mascota dinámica e imágenes
  let mascotImg = MASCOT.water.thirsty;
  let mascotText = "¡Qué calor! Un vasito me caería genial... 🏜️";
  let floatAnim = "none";
  
  if (pct >= 100) {
    mascotImg = MASCOT.water.coco;
    mascotText = "¡Salud! Meta cumplida, metabolismo al 100%. 🥥";
    floatAnim = "float 2.5s ease-in-out infinite";
  } else if (pct >= 50) {
    mascotImg = MASCOT.water.floatie;
    mascotText = "¡Ya casi! El agua está deliciosa hoy. 🛟";
    floatAnim = "float 3s ease-in-out infinite";
  }

  return (
    <div className="fade-up fade-up-4 card" style={{ marginBottom:10, background: `linear-gradient(180deg, ${T.surface} 0%, rgba(2,132,199,0.06) 100%)`, border:`1.5px solid rgba(2,132,199,0.2)` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 12 }}>
        <div>
          <h4 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, margin: 0, color:"#0284c7" }}>Piscina de NutrIA</h4>
          <span style={{ fontSize:11, color:T.textSecondary }}>Meta diaria: {targetWater} vasos</span>
        </div>
        <img src={mascotImg} alt="NutrIA Agua" style={{ width: 56, height: 56, objectFit: "contain", animation: floatAnim }} onError={(e) => { e.target.src = MASCOT.logo; }} />
      </div>
      
      <div style={{ fontSize: 11, fontStyle: "italic", color: T.textSecondary, marginBottom: 10, textAlign: "right" }}>
        "{mascotText}"
      </div>
      
      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
        <div style={{ flex:1, height:12, background:"rgba(2,132,199,0.15)", borderRadius:6, overflow:"hidden", position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:0, bottom:0, width:`${pct}%`, background:"#0284c7", transition:"width 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }} />
        </div>
        <span style={{ fontSize:12, fontWeight:700, color:"#0284c7", width:35, textAlign:"right", fontFamily:"'IBM Plex Mono', monospace" }}>{water}/{targetWater}</span>
      </div>
      
      <button onClick={handleAdd} style={{ marginTop:14, width:"100%", padding:"10px", background:"#0284c7", color:"#fff", border:"none", borderRadius:12, fontWeight:700, cursor:"pointer", display:"flex", justifyContent:"center", alignItems:"center", gap:8, boxShadow:"0 4px 12px rgba(2,132,199,0.25)" }}>
        <span style={{fontSize:15}}>💧</span> Añadir Vaso (250ml)
      </button>
    </div>
  );
};

const DashboardScreen = ({ onNav }) => {
  const { state, dispatch } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bgMusicActive, setBgMusicActive] = useState(localStorage.getItem("nutria_bgmusic") === "true");
  const [sfxActive, setSfxActive] = useState(localStorage.getItem("nutria_sfx") !== "false");
  const [musicMode, setMusicModeState] = useState(localStorage.getItem("nutria_musicmode") || "active");

  const handleMusicModeChange = (mode) => {
    setMusicModeState(mode);
    localStorage.setItem("nutria_musicmode", mode);
    setMusicMode(mode);
  };

  // Sincronizador Hormonal Calculations
  const isFemale = state.userData.sex === "Female" || state.userData.sex === "Femenino" || state.userData.sex === "female";
  const daysAgo = Number(state.userData.lastPeriodDaysAgo !== undefined ? state.userData.lastPeriodDaysAgo : 5);
  const cLength = Number(state.userData.cycleLength || 28);
  const pDuration = Number(state.userData.periodDuration || 5);

  const cycleDay = (daysAgo % cLength) + 1;

  let currentPhase = "follicular";
  if (cycleDay <= pDuration) currentPhase = "menstrual";
  else if (cycleDay < 14) currentPhase = "follicular";
  else if (cycleDay <= 16) currentPhase = "ovulatory";
  else currentPhase = "luteal";

  const phaseDetails = {
    menstrual: { emoji: "🩸", label: "Menstruación", desc: "Fuerza reducida, prioridad en descanso activo y alimentos altos en hierro.", color: "#e53935", bg: "rgba(229,57,53,0.06)" },
    follicular: { emoji: "🌸", label: "Fase Folicular", desc: "Fuerza y energía elevadas. Momento óptimo para entrenar pesado e intenso.", color: "#e91e63", bg: "rgba(233,30,150,0.06)" },
    ovulatory: { emoji: "✨", label: "Fase Ovulatoria", desc: "Pico de energía y fuerza anabólica. Excelente para superar marcas personales.", color: T.amber, bg: "rgba(245,158,11,0.06)" },
    luteal: { emoji: "🍂", label: "Fase Lútea", desc: "Energía moderada a baja, propensa a antojos. Entrena suave y prioriza carbohidratos complejos.", color: T.brown, bg: "rgba(139,92,26,0.06)" }
  };

  const currentPhaseDetail = phaseDetails[currentPhase];

  const name = state.userData.name || "tú";
  const completed = state.mealsCompleted || [];
  
  // ─── Calendario y Sincronización de Tiempo Inteligente (Axioma 1) ───────────
  const getCalendarInfo = () => {
    if (!state.planStartDate) {
      return {
        dayIndex: state.currentDay || 1,
        week: state.currentWeek || 1,
        weekdayName: `Día ${state.currentDay || 1}`,
        isFutureStart: false
      };
    }
    const diffTime = Date.now() - state.planStartDate;
    const daysPassed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const calculatedWeek = Math.floor(daysPassed / 7) + 1;
    const calculatedDay = (daysPassed % 7) + 1; // 1 a 7

    const targetDate = new Date(state.planStartDate + daysPassed * 24 * 60 * 60 * 1000);
    const weekdays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const weekdayName = weekdays[targetDate.getDay()];

    return {
      dayIndex: Math.min(7, calculatedDay),
      week: calculatedWeek,
      weekdayName,
      isFutureStart: state.planStartDate > Date.now()
    };
  };

  const calendar = getCalendarInfo();
  const MEALS = getMealsForUser(state.userData, state.plan, calendar.dayIndex);

  // Calcular totales sumando los platos completados
  const cConsumed = completed.reduce((acc, i) => {
    const m = MEALS[i];
    return acc + (m ? m.kcal : 0);
  }, 0);
  const cTotal = MEALS.reduce((acc, m) => acc + m.kcal, 0);
  
  const mP = completed.reduce((acc, i) => { const m = MEALS[i]; return acc + (m ? m.macros.p : 0); }, 0);
  const mC = completed.reduce((acc, i) => { const m = MEALS[i]; return acc + (m ? m.macros.c : 0); }, 0);
  const mG = completed.reduce((acc, i) => { const m = MEALS[i]; return acc + (m ? m.macros.g : 0); }, 0);

  const tP = MEALS.reduce((acc, m) => acc + m.macros.p, 0);
  const tC = MEALS.reduce((acc, m) => acc + m.macros.c, 0);
  const tG = MEALS.reduce((acc, m) => acc + m.macros.g, 0);

  const MACROS = [
    { label:"Proteína",      val:mP, max:tP, color:T.blue  },
    { label:"Carbohidratos", val:mC, max:tC, color:T.teal  },
    { label:"Grasas",        val:mG, max:tG, color:T.brown },
  ];
  
  const pct  = Math.min(100, Math.round((cConsumed / cTotal) * 100));
  const circ = 2 * Math.PI * 32;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 16px 110px", background:T.bg, minHeight:"100vh", position: "relative" }}>

      {/* ── Bloqueo Empático de Check-in Obligatorio (Axioma 3) ── */}
      {calendar.week > state.currentWeek && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(10, 25, 25, 0.85)", backdropFilter: "blur(12px)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, animation: "fadeIn 0.5s ease forwards"
        }}>
          <div style={{
            background: T.surface, border: `2px solid ${T.teal}40`,
            borderRadius: 28, padding: 30, maxWidth: 420, width: "100%",
            textAlign: "center", boxShadow: "0 12px 40px rgba(0,0,0,0.3)"
          }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🦦⏳</div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, color: T.textPrimary, marginBottom: 12 }}>
              ¡Momento de calibración!
            </h2>
            <p style={{ fontSize: 13.5, color: T.textSecondary, lineHeight: 1.6, marginBottom: 24 }}>
              Completamos con éxito la **Semana {state.currentWeek}** de tu plan. Tu **NutrIA** 🦦 necesita ajustar tus metas, porciones y recetas para la **Semana {calendar.week}** basándose en cómo te has sentido físicamente.
            </p>
            <button
              onClick={() => { if (sfxActive) playClick(); onNav("checkin"); }}
              style={{
                width: "100%", padding: "16px 20px", background: T.teal, color: "#fff",
                border: "none", borderRadius: 16, fontWeight: 700, fontSize: 14,
                cursor: "pointer", boxShadow: `0 4px 14px ${T.teal}40`,
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all .2s ease"
              }}
            >
              Comenzar mi Calibración Semanal ⚡
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="fade-up" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <img src={MASCOT.logo} alt="NutrIA"
            onError={e => { e.target.src="https://i.postimg.cc/qgfvHSZ8/image.png"; }}
            style={{ width:44, height:44, borderRadius:13, objectFit:"cover", boxShadow:`0 2px 12px rgba(43,188,185,0.22)` }} />
          <div>
            <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>
              SEMANA {state.currentWeek} · {calendar.weekdayName.toUpperCase()}
            </p>
            <h1 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:19, marginTop:1, color:T.textPrimary }}>
              ¡Hola, {name}! 👋
            </h1>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div onClick={() => { if (sfxActive) playClick(); setShowSettings(true); }} style={{ width:40, height:40, borderRadius:12, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:T.shadow, cursor:"pointer" }}>
            <Icon name="settings" size={20} color={T.textSecondary} />
          </div>
        </div>
      </div>

      {/* ── Alerta de Comienzo Tardío (Regla de la Noche de NutrIA) ── */}
      {calendar.isFutureStart && (
        <div style={{
          padding: "12px 16px", background: `${T.teal}12`, border: `1.5px solid ${T.teal}35`,
          borderRadius: 16, marginBottom: 16, display: "flex", gap: 10, alignItems: "center",
          animation: "pulse-border 2s infinite"
        }}>
          <span style={{ fontSize: 20 }}>🌙</span>
          <p style={{ fontSize: 11.5, color: T.textSecondary, lineHeight: 1.5, margin: 0 }}>
            **Regla de la Noche:** Al registrarte tarde, tu plan se activará oficialmente **mañana por la mañana**. ¡Duerme bien y recupera energías hoy! 🦦
          </p>
        </div>
      )}

      {/* ── Racha Diaria ── */}
      <StreakBadge />

      {/* ── Hero Mascot ── */}
      <div className="fade-up fade-up-1" style={{ display:"flex", justifyContent:"center", marginBottom:20 }}>
        <div style={{
          position:"relative", width:"100%", maxWidth:300,
          background:`linear-gradient(160deg, ${T.tealLight} 0%, ${T.bg} 100%)`,
          borderRadius:28, padding:"16px 16px 8px",
          border:`1.5px solid ${T.border}`,
          boxShadow:`0 6px 28px rgba(43,188,185,0.12)`,
        }}>
          <img
            src={MASCOT.fullBody}
            alt="NutrIA"
            style={{ width:"100%", height:"auto", objectFit:"contain", maxHeight:220, borderRadius:18, filter:`drop-shadow(0 6px 16px rgba(43,188,185,0.2))`, animation:"float 4s ease-in-out infinite" }}
            onError={e => { e.target.src = MASCOT.logo; }}
          />
          <div style={{ textAlign:"center", paddingBottom:6 }}>
            <span style={{ fontSize:11, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>Tu NutrIA te acompaña hoy 🦦</span>
          </div>
        </div>
      </div>

      {/* ── Diario de NutrIA Card ── */}
      <div className="fade-up fade-up-1 diary-card" onClick={() => onNav("diary")}>
        <div style={{ fontSize: 28 }}>📖</div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>Diario de NutrIA 🦦</h4>
          <p style={{ fontSize: 12, lineHeight: 1.5, margin: 0 }}>Lee mis notas de progreso, sugerencias sobre tu cuerpo y fundamentos de tu plan.</p>
        </div>
        <Icon name="arrowRight" size={16} color={state.userData.theme === "dark" ? T.teal : "#ffffff"} />
      </div>

      {/* ── Banner de Check-in Semanal — solo cuando currentDay >= 7 ── */}
      {state.currentDay >= 7 && (
        <div
          className="fade-up fade-up-2"
          onClick={() => onNav("checkin")}
          style={{
            display:"flex", alignItems:"center", gap:14,
            padding:"16px 18px", marginBottom:10, borderRadius:16, cursor:"pointer",
            background:`linear-gradient(135deg, ${T.teal}18 0%, ${T.amber}12 100%)`,
            border:`2px solid ${T.teal}55`,
            boxShadow:`0 4px 20px ${T.teal}15`,
            animation:"pulse-border 2.5s ease-in-out infinite",
          }}
        >
          <div style={{
            width:48, height:48, borderRadius:14,
            background:`${T.teal}22`, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:26, flexShrink:0,
          }}>
            📋
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:14, color:T.textPrimary, marginBottom:3 }}>
              ¡Es momento de tu Check-in Semanal!
            </div>
            <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.5 }}>
              NutrIA 🦦 necesita saber cómo te fue esta semana para ajustar tu plan. Solo toma 30 segundos.
            </div>
          </div>
          <div style={{
            width:32, height:32, borderRadius:8,
            background:T.teal, display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, boxShadow:`0 2px 8px ${T.teal}40`,
          }}>
            <Icon name="arrowRight" size={14} color="#fff" />
          </div>
        </div>
      )}

      {/* Hint de scroll */}
      <div style={{ textAlign:"center", marginBottom:10 }}>
        <span style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", letterSpacing:".5px" }}>DESLIZA HACIA ABAJO PARA VER TU PLAN ↓</span>
      </div>

      {/* ── Anillo calórico ── */}
      <div className="fade-up fade-up-2 card" style={{ marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:5 }}>CALORÍAS HOY</p>
            <div style={{ display:"flex", alignItems:"baseline", gap:7 }}>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:36, fontWeight:500, color:T.teal }}>{cConsumed}</span>
              <span style={{ fontSize:13, color:T.textMuted }}>/ {cTotal} kcal</span>
            </div>
            <div style={{ marginTop:9, display:"flex", gap:7, flexWrap:"wrap" }}>
              <span className="tag" style={{ background:T.tealLight, color:T.teal, border:`1.5px solid ${T.border}` }}>
                {state.userData.goal === "deficit" ? "↓ Déficit calórico" : state.userData.goal === "surplus" ? "↑ Superávit calórico" : "↔ Mantenimiento"}
              </span>
              <span className="tag" style={{ background:T.card, color:T.textMuted, border:`1.5px solid ${T.border}` }}>{pct}% completado</span>
            </div>
          </div>
          <svg width={80} height={80} viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke={T.border} strokeWidth="5" />
            <circle cx="40" cy="40" r="32" fill="none" stroke={T.teal} strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)}
              transform="rotate(-90 40 40)" style={{ transition:"stroke-dashoffset 1.2s cubic-bezier(.22,.68,0,1.15)" }} />
            <text x="40" y="44" textAnchor="middle" fill={T.textPrimary} fontSize="12" fontFamily="IBM Plex Mono" fontWeight="500">{pct}%</text>
          </svg>
        </div>
      </div>

      {/* ── Sincronizador Hormonal NutrIA (Solo Mujeres) ── */}
      {isFemale && (
        <div className="fade-up fade-up-3 card" style={{ marginBottom:10, position:"relative", overflow:"hidden" }}>
          {/* Fondo sutil degradado rosa/teja */}
          <div style={{
            position:"absolute", top:0, right:0, bottom:0, left:0,
            background:`linear-gradient(135deg, rgba(233,30,99,0.03) 0%, rgba(43,188,185,0.01) 100%)`,
            zIndex:0, pointerEvents:"none"
          }} />

          <div style={{ position:"relative", zIndex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ fontSize:18 }}>🌸</span>
                <div>
                  <p style={{ fontSize:10, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", margin:0 }}>SINCRONIZADOR HORMONAL</p>
                  <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:14.5, color:T.textPrimary, margin:0 }}>
                    Fase {currentPhaseDetail.label} {currentPhaseDetail.emoji}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowCycleModal(true)}
                style={{
                  background:`${T.teal}12`, border:`1px solid ${T.teal}35`, color:T.teal,
                  borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600, cursor:"pointer",
                  fontFamily:"'Plus Jakarta Sans', sans-serif", display:"flex", alignItems:"center", gap:4,
                  transition:"all .2s ease"
                }}
              >
                ⚙️ Recalibrar
              </button>
            </div>

            {/* Ciclo Día Info */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:12 }}>
              <span style={{ fontSize:12, color:T.textSecondary }}>Día actual de tu ciclo:</span>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:16, fontWeight:600, color:T.teal }}>
                Día {cycleDay} <span style={{ fontSize:11, color:T.textMuted, fontWeight:400 }}>de {cLength}</span>
              </span>
            </div>

            {/* Roadmap del Ciclo (Barra de Progreso Segmentada) */}
            <div style={{ position:"relative", height:10, borderRadius:5, background:T.border, marginBottom:16, display:"flex", overflow:"hidden" }}>
              {/* Menstrual segment */}
              <div style={{ width:`${(pDuration / cLength) * 100}%`, background:"#e53935", height:"100%" }} />
              {/* Follicular segment */}
              <div style={{ width:`${((13 - pDuration) / cLength) * 100}%`, background:"#e91e63", height:"100%" }} />
              {/* Ovulatory segment */}
              <div style={{ width:`${(3 / cLength) * 100}%`, background:T.amber, height:"100%" }} />
              {/* Luteal segment */}
              <div style={{ width:`${((cLength - 16) / cLength) * 100}%`, background:T.brown, height:"100%" }} />

              {/* Pin Indicador */}
              <div style={{
                position:"absolute",
                left:`${Math.min(98, Math.max(0, ((cycleDay - 0.5) / cLength) * 100))}%`,
                top:-3, width:14, height:16,
                background:"#fff", border:`2.5px solid ${T.teal}`, borderRadius:"50%",
                boxShadow:"0 2px 6px rgba(0,0,0,0.22)",
                transition:"left .6s cubic-bezier(.22,.68,0,1.15)",
                display:"flex", alignItems:"center", justifyContent:"center"
              }} />
            </div>

            {/* Labels de referencia rápida */}
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:9.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:14 }}>
              <span style={{ color:"#e53935" }}>🩸 Regla</span>
              <span style={{ color:"#e91e63" }}>🌸 Folicular</span>
              <span style={{ color:T.amber }}>✨ Ovulación</span>
              <span style={{ color:T.brown }}>🍂 Lútea</span>
            </div>

            {/* Banner empático de recomendación */}
            <div style={{
              background: currentPhaseDetail.bg,
              border:`1.2px solid ${currentPhaseDetail.color}35`,
              borderRadius:12, padding:"12px 14px"
            }}>
              <p style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
                {currentPhaseDetail.desc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Macros ── */}
      <div className="fade-up fade-up-3 card" style={{ marginBottom:10 }}>
        <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:14 }}>MACRONUTRIENTES DEL DÍA</p>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {MACROS.map(m => <MacroBar key={m.label} {...m} />)}
        </div>
      </div>

      {/* ── FrictionScore ── */}
      <div className="fade-up fade-up-4" style={{ marginBottom:10 }}>
        <FrictionScore />
      </div>

      {/* ── Progress Calendar ── */}
      <ProgressCalendar state={state} />

      {/* ── Gamificación del Agua ── */}
      <WaterTracker state={state} dispatch={dispatch} sfxActive={sfxActive} />

      {/* ── Quick Actions ── */}
      <div className="fade-up fade-up-5" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
        {QUICK_ACTIONS.map(a => (
          <div key={a.screen} id={`card-${a.screen}`} onClick={() => a.screen === "foodsearch" ? setShowSearch(true) : onNav(a.screen)} className="card" style={{ cursor:"pointer", padding:16 }}>
            <div style={{ width:40, height:40, borderRadius:11, background:`${a.color}15`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:11, fontSize:22 }}>
              {a.emoji}
            </div>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:13.5, marginBottom:2, color:T.textPrimary }}>{a.label}</div>
            <div style={{ fontSize:11.5, color:T.textMuted }}>{a.sub}</div>
          </div>
        ))}
      </div>

      {/* ── EmpatheticFooter ── */}
      <div className="fade-up fade-up-5">
        <EmpatheticFooter />
      </div>

      {showSearch && <FoodSearchModal onClose={() => setShowSearch(false)} />}
      {showCycleModal && <CycleRecalibratorModal state={state} dispatch={dispatch} onClose={() => setShowCycleModal(false)} />}

      {/* ── Settings Drawer Modal ── */}
      {showSettings && (
        <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(13,41,41,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={() => { if (sfxActive) playClick(); setShowSettings(false); }}>
          <div style={{ background:T.bg, borderTopLeftRadius:28, borderTopRightRadius:28, padding:"24px 20px 40px", width:"100%", maxWidth:520, animation:"fadeUp .24s ease both" }} onClick={e => e.stopPropagation()}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 20px" }} />
            
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:`${T.teal}15`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Icon name="settings" size={20} color={T.teal} />
                </div>
                <div>
                  <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:17.5, color:T.textPrimary, margin:0 }}>Ajustes de NutrIA 🦦</h3>
                  <p style={{ fontSize:11.5, color:T.textMuted, margin:0 }}>Personaliza tu espacio y sonido</p>
                </div>
              </div>
              <button onClick={() => { if (sfxActive) playClick(); setShowSettings(false); }} style={{ width:32, height:32, borderRadius:"50%", background:T.surface, border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <Icon name="x" size={14} color={T.textSecondary} />
              </button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:24 }}>
              {/* Opción: Cambiar Perfil */}
              <div onClick={() => { if (sfxActive) playChime(); onNav("profiles"); setShowSettings(false); }} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:T.surface, padding:"14px 16px", borderRadius:16, border:`1.5px solid ${T.border}`, cursor:"pointer", transition:"all .2s" }} onMouseEnter={e => e.currentTarget.style.borderColor=T.teal} onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:22 }}>👥</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:T.textPrimary }}>Cambiar de Perfil</div>
                    <div style={{ fontSize:11.5, color:T.textMuted }}>Elige o crea otro perfil de NutrIA</div>
                  </div>
                </div>
                <Icon name="arrowRight" size={16} color={T.textMuted} />
              </div>

              {/* Opción: Libro de Anotaciones / Diario */}
              <div onClick={() => { if (sfxActive) playChime(); onNav("diary"); setShowSettings(false); }} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:T.surface, padding:"14px 16px", borderRadius:16, border:`1.5px solid ${T.border}`, cursor:"pointer", transition:"all .2s" }} onMouseEnter={e => e.currentTarget.style.borderColor=T.teal} onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:22 }}>📖</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:T.textPrimary }}>Diario de Anotaciones</div>
                    <div style={{ fontSize:11.5, color:T.textMuted }}>Ver fundamentos y sugerencias físicas</div>
                  </div>
                </div>
                <Icon name="arrowRight" size={16} color={T.textMuted} />
              </div>

              {/* Opción: Modo Nocturno */}
              <div onClick={() => { 
                if (sfxActive) playClick(); 
                dispatch({ type:"UPDATE_USER_DATA", payload: { theme: state.userData.theme === 'dark' ? 'light' : 'dark' } });
              }} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:T.surface, padding:"14px 16px", borderRadius:16, border:`1.5px solid ${T.border}`, cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:22 }}>🌗</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:T.textPrimary }}>Modo Oscuro</div>
                    <div style={{ fontSize:11.5, color:T.textMuted }}>Alternar tema de la aplicación</div>
                  </div>
                </div>
                <div style={{ width:40, height:24, borderRadius:12, background: state.userData.theme === "dark" ? T.teal : T.border, padding:2, display:"flex", alignItems:"center", justifyContent: state.userData.theme === "dark" ? "flex-end" : "flex-start", transition:"all .2s" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:T.shadow }} />
                </div>
              </div>

              {/* Opción: Música de Fondo */}
              <div style={{ background:T.surface, padding:"14px 16px", borderRadius:16, border:`1.5px solid ${T.border}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }} onClick={() => {
                  if (bgMusicActive) {
                    stopBgMusic();
                    setBgMusicActive(false);
                    localStorage.setItem("nutria_bgmusic", "false");
                  } else {
                    startBgMusic();
                    setBgMusicActive(true);
                    localStorage.setItem("nutria_bgmusic", "true");
                    if (sfxActive) playChime();
                  }
                }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ fontSize:22 }}>🎵</div>
                    <div>
                      <div style={{ fontWeight:600, fontSize:14, color:T.textPrimary }}>Música de Acompañamiento</div>
                      <div style={{ fontSize:11.5, color:T.textMuted }}>Melodías interactivas 100% sintetizadas</div>
                    </div>
                  </div>
                  <div style={{ width:40, height:24, borderRadius:12, background: bgMusicActive ? T.teal : T.border, padding:2, display:"flex", alignItems:"center", justifyContent: bgMusicActive ? "flex-end" : "flex-start", transition:"all .2s" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:T.shadow }} />
                  </div>
                </div>
                
                {/* Rhythm / Mode Selector Pills (rendered beautifully only when music is active) */}
                {bgMusicActive && (
                  <div className="fade-up" style={{ display:"flex", background:`${T.border}45`, borderRadius:10, padding:3, marginTop:12, gap:3 }}>
                    {[
                      { mode: "active",   label: "⚡ Activa",    icon: "🦦" },
                      { mode: "relaxing", label: "🍃 Relajante", icon: "🎵" },
                      { mode: "none",     label: "🔇 Sin música", icon: "" },
                    ].map(m => (
                      <button
                        key={m.mode}
                        onClick={() => {
                          if (m.mode === "none") {
                            stopBgMusic();
                            setBgMusicActive(false);
                            localStorage.setItem("nutria_bgmusic", "false");
                          } else {
                            handleMusicModeChange(m.mode);
                          }
                        }}
                        style={{
                          flex:1, padding:"8px 4px", borderRadius:8, border:"none", fontSize:10.5, fontWeight:700,
                          cursor:"pointer", transition:"all .2s",
                          background: musicMode === m.mode ? T.teal : "transparent",
                          color: musicMode === m.mode ? "#fff" : T.textSecondary
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Opción: Efectos de Sonido */}
              <div onClick={() => {
                const nextSfx = !sfxActive;
                setSfxActive(nextSfx);
                localStorage.setItem("nutria_sfx", nextSfx ? "true" : "false");
                if (nextSfx) playChime();
              }} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:T.surface, padding:"14px 16px", borderRadius:16, border:`1.5px solid ${T.border}`, cursor:"pointer" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontSize:22 }}>🔊</div>
                  <div>
                    <div style={{ fontWeight:600, fontSize:14, color:T.textPrimary }}>Efectos de Sonido</div>
                    <div style={{ fontSize:11.5, color:T.textMuted }}>Respuesta acústica interactiva</div>
                  </div>
                </div>
                <div style={{ width:40, height:24, borderRadius:12, background: sfxActive ? T.teal : T.border, padding:2, display:"flex", alignItems:"center", justifyContent: sfxActive ? "flex-end" : "flex-start", transition:"all .2s" }}>
                  <div style={{ width:20, height:20, borderRadius:"50%", background:"#fff", boxShadow:T.shadow }} />
                </div>
              </div>
            </div>

            {/* 📈 INDICADORES EN TIEMPO REAL (Analytics Panel) */}
            <div style={{
              background: state.userData.theme === "dark" ? "rgba(43,188,185,0.06)" : "rgba(43,188,185,0.04)",
              border: `1.5px solid ${T.teal}33`,
              borderRadius: 20,
              padding: "16px 18px",
              marginBottom: 20,
              boxShadow: "inset 0 1px 1px rgba(255,255,255,0.1)",
              animation: "fadeUp .3s ease both"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Icon name="zap" size={16} color={T.teal} />
                <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: T.textPrimary }}>
                  Indicadores de Rendimiento (Tiempo Real)
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {/* Racha Actual y Máxima */}
                <div style={{ background: T.surface, padding: 10, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10.5, color: T.textMuted }}>RACHA DE INGRESOS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.teal, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                    {state.currentStreak || 0} <span style={{ fontSize: 10, color: T.textSecondary, fontWeight: 400 }}>días</span>
                  </div>
                  <div style={{ fontSize: 9.5, color: T.textMuted, marginTop: 2 }}>
                    Máx: {localStorage.getItem("nutria_streak_max") || state.currentStreak || 0} d
                  </div>
                </div>

                {/* Sesiones Nuevas Totales */}
                <div style={{ background: T.surface, padding: 10, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10.5, color: T.textMuted }}>SESIONES INICIADAS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.blue, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                    {localStorage.getItem("nutria_session_count") || 1} <span style={{ fontSize: 10, color: T.textSecondary, fontWeight: 400 }}>veces</span>
                  </div>
                  <div style={{ fontSize: 9.5, color: T.textMuted, marginTop: 2 }}>
                    Monitoreado en vivo 🟢
                  </div>
                </div>

                {/* Semanas Completadas */}
                <div style={{ background: T.surface, padding: 10, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10.5, color: T.textMuted }}>SEMANAS COMPLETADAS</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.amber, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                    {state.weekHistory ? state.weekHistory.length : 0} <span style={{ fontSize: 10, color: T.textSecondary, fontWeight: 400 }}>semanas</span>
                  </div>
                  <div style={{ fontSize: 9.5, color: T.textMuted, marginTop: 2 }}>
                    Progreso histórico total
                  </div>
                </div>

                {/* Adherencia diaria */}
                <div style={{ background: T.surface, padding: 10, borderRadius: 12, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 10.5, color: T.textMuted }}>ADHERENCIA DIARIA</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.teal, fontFamily: "'IBM Plex Mono', monospace", marginTop: 2 }}>
                    {(() => {
                      const todayHabits = state.todayHabits || {};
                      const waterGoal = state.userData.waterGoal || 8;
                      const stepsGoal = state.userData.stepsGoal || 8000;
                      const waterDone = (todayHabits.water || 0) >= waterGoal;
                      const stepsDone = (todayHabits.steps || 0) >= stepsGoal;
                      const activeHabits = todayHabits.habits || [];
                      const completedCustom = activeHabits.filter(h => h.done).length;
                      const totalCustom = activeHabits.length;
                      
                      const total = 2 + totalCustom;
                      const done = (waterDone ? 1 : 0) + (stepsDone ? 1 : 0) + completedCustom;
                      return Math.round((done / total) * 100) || 0;
                    })()}% <span style={{ fontSize: 10, color: T.textSecondary, fontWeight: 400 }}>hoy</span>
                  </div>
                  <div style={{ fontSize: 9.5, color: T.textMuted, marginTop: 2 }}>
                    Hábitos completados
                  </div>
                </div>
              </div>
            </div>
            
            <p style={{ fontSize:11, color:T.textMuted, textAlign:"center", margin:0, fontFamily:"'IBM Plex Mono', monospace" }}>
              NUTRIA SOUND ENGINE v1.2 · 100% SINTETIZADO
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ── SUB-COMPONENTE: Modal de Recalibración del Ciclo Hormonal Pulido ─────────────────
const CycleRecalibratorModal = ({ state, dispatch, onClose }) => {
  const userData = state.userData;
  const set = (payload) => dispatch({ type: "UPDATE_USER_DATA", payload });

  const daysAgo = Number(userData.lastPeriodDaysAgo !== undefined ? userData.lastPeriodDaysAgo : 5);
  const cLength = Number(userData.cycleLength || 28);
  const pDuration = Number(userData.periodDuration || 5);

  const computePhase = (ago, len, dur) => {
    const day = (ago % len) + 1;
    if (day <= dur) return "menstrual";
    if (day < 14) return "follicular";
    if (day <= 16) return "ovulatory";
    return "luteal";
  };

  const phase = computePhase(daysAgo, cLength, pDuration);
  const phaseNames = {
    menstrual: "Fase Menstrual (🩸)",
    follicular: "Fase Folicular (🌸)",
    ovulatory: "Fase Ovulatoria (✨)",
    luteal: "Fase Lútea (🍂)"
  };

  const phaseColors = {
    menstrual: "#e53935",
    follicular: "#e91e63",
    ovulatory: T.amber,
    luteal: T.brown
  };

  const mascotQuotes = {
    menstrual: "🦦 NutrIA dice: 'Acurrucarse con una mantita tibia y té de manzanilla es de valientes hoy. ¡Tómalo con calma, te cuido!'",
    follicular: "🦦 NutrIA dice: '¡Me puse las zapatillas! Tu energía sube como espuma, hoy es un gran día para entrenar con fuerza.'",
    ovulatory: "🦦 NutrIA dice: '¡Estás radiante! Tu fuerza y vitalidad están en su pico absoluto. ¡Disfrútalo al máximo!'",
    luteal: "🦦 NutrIA dice: '¡Cero culpas por esos antojos! Tu cuerpo te pide carbohidratos complejos para producir serotonina. ¡Te apoyamos!'",
  };

  const handleCycleChange = (updates) => {
    const newDays = updates.lastPeriodDaysAgo !== undefined ? updates.lastPeriodDaysAgo : daysAgo;
    const newLen = updates.cycleLength || cLength;
    const newDur = updates.periodDuration || pDuration;
    const newPhase = computePhase(newDays, newLen, newDur);
    set({
      ...updates,
      lastPeriodDaysAgo: newDays,
      cycleLength: newLen,
      periodDuration: newDur,
      menstrualPhase: newPhase
    });
  };

  const cycleDay = (daysAgo % cLength) + 1;
  const angle = ((cycleDay - 0.5) / cLength) * 360;

  return (
    <div style={{
      position:"fixed", top:0, left:0, right:0, bottom:0,
      background:"rgba(15,23,42,0.45)", backdropFilter:"blur(8px)",
      zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", padding:16
    }}>
      <div style={{
        background:T.surface, border:`1.5px solid ${T.border}`,
        borderRadius:28, padding:"24px 20px 20px", width:"100%", maxWidth:400,
        boxShadow:"0 20px 40px rgba(0,0,0,0.32)",
        animation:"fadeUp .28s cubic-bezier(0.16, 1, 0.3, 1) both",
        position:"relative"
      }}>
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          style={{
            position:"absolute", top:18, right:18, border:"none", background:`${T.border}30`,
            width:30, height:30, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:14, cursor:"pointer", color:T.textSecondary, transition:"all .2s"
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${T.border}60`}
          onMouseLeave={e => e.currentTarget.style.background = `${T.border}30`}
        >
          ✕
        </button>

        {/* Encabezado */}
        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
          <span style={{ fontSize:22 }}>🌸</span>
          <div>
            <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:15.5, color:T.textPrimary, margin:0 }}>
              Sincronizador Hormonal
            </h3>
            <p style={{ fontSize:11.5, color:T.textMuted, margin:0, marginTop:1 }}>
              Calibra tus parámetros clínicos reales.
            </p>
          </div>
        </div>

        {/* ── RUEDA SVG DIAL VISUAL (Polish principal) ── */}
        <div style={{ position:"relative", width:114, height:114, margin:"10px auto 14px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <svg width="114" height="114" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke={T.border} strokeWidth="5" />
            
            {/* Segmento Menstrual */}
            <circle cx="60" cy="60" r="48" fill="none" stroke="#e53935" strokeWidth="8"
              strokeDasharray={`${(pDuration / cLength) * 301.6} 301.6`}
              transform="rotate(-90 60 60)" strokeLinecap="round" />
              
            {/* Segmento Folicular */}
            <circle cx="60" cy="60" r="48" fill="none" stroke="#e91e63" strokeWidth="8"
              strokeDasharray={`${((13 - pDuration) / cLength) * 301.6} 301.6`}
              transform={`rotate(${-90 + (pDuration / cLength) * 360} 60 60)`} strokeLinecap="round" />
              
            {/* Segmento Ovulatorio */}
            <circle cx="60" cy="60" r="48" fill="none" stroke={T.amber} strokeWidth="8"
              strokeDasharray={`${(3 / cLength) * 301.6} 301.6`}
              transform={`rotate(${-90 + (13 / cLength) * 360} 60 60)`} strokeLinecap="round" />
              
            {/* Segmento Lúteo */}
            <circle cx="60" cy="60" r="48" fill="none" stroke={T.brown} strokeWidth="8"
              strokeDasharray={`${((cLength - 16) / cLength) * 301.6} 301.6`}
              transform={`rotate(${-90 + (16 / cLength) * 360} 60 60)`} strokeLinecap="round" />
              
            {/* Pin indicador brillante rotatorio */}
            <circle cx={60 + 48 * Math.cos((angle - 90) * Math.PI / 180)} cy={60 + 48 * Math.sin((angle - 90) * Math.PI / 180)} r="7" fill={T.teal} stroke="#fff" strokeWidth="2.5" style={{ filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
          </svg>
          <div style={{ position:"absolute", display:"flex", flexDirection:"column", alignItems:"center" }}>
            <span style={{ fontSize:9, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", fontWeight:600 }}>DÍA</span>
            <span style={{ fontSize:22, fontWeight:800, color:T.textPrimary, fontFamily:"'Plus Jakarta Sans', sans-serif", marginTop:-1 }}>{cycleDay}</span>
          </div>
        </div>

        {/* Sliders */}
        <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:16 }}>
          {/* Slider 1 */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:T.textSecondary, fontWeight:500 }}>¿Hace cuántos días inició tu última regla?</span>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:12.5, color:T.teal, fontWeight:700 }}>{daysAgo} d</span>
            </div>
            <input type="range" min={0} max={30} value={daysAgo} onChange={e => handleCycleChange({ lastPeriodDaysAgo: +e.target.value })} style={{ width:"100%" }} />
          </div>

          {/* Slider 2 */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:T.textSecondary, fontWeight:500 }}>Duración promedio de tu ciclo</span>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:12.5, color:T.teal, fontWeight:700 }}>{cLength} d</span>
            </div>
            <input type="range" min={21} max={35} value={cLength} onChange={e => handleCycleChange({ cycleLength: +e.target.value })} style={{ width:"100%" }} />
          </div>

          {/* Slider 3 */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontSize:12, color:T.textSecondary, fontWeight:500 }}>Duración del sangrado (regla)</span>
              <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:12.5, color:T.teal, fontWeight:700 }}>{pDuration} d</span>
            </div>
            <input type="range" min={3} max={10} value={pDuration} onChange={e => handleCycleChange({ periodDuration: +e.target.value })} style={{ width:"100%" }} />
          </div>
        </div>

        {/* Globo de diálogo empático de NutrIA (Axiomas 1 y 3) */}
        <div style={{
          background:`${phaseColors[phase]}09`, border:`1px solid ${phaseColors[phase]}25`,
          borderRadius:16, padding:"12px 14px", display:"flex", gap:10, alignItems:"flex-start",
          marginBottom:16
        }}>
          <p style={{ fontSize:11.8, color:T.textSecondary, lineHeight:1.55, margin:0, fontStyle:"italic" }}>
            {mascotQuotes[phase]}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            width:"100%", padding:"14px 20px", background:T.teal, color:"#fff",
            border:"none", borderRadius:16, fontWeight:700, fontSize:13.5,
            cursor:"pointer", boxShadow:`0 4px 14px rgba(43,188,185,0.25)`,
            fontFamily:"'Plus Jakarta Sans', sans-serif", transition:"all .2s ease"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "none"}
        >
          Guardar y Sincronizar
        </button>
      </div>
    </div>
  );
};

export default DashboardScreen;
