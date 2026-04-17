import { useState } from "react";
import MacroBar from "../components/ui/MacroBar";
import EmpatheticFooter from "../components/EmpatheticFooter";
import FrictionScore from "../components/domain/FrictionScore";
import FoodSearchModal from "../components/ui/FoodSearchModal";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";

import { getMealsForUser } from "./NutritionScreen";

const QUICK_ACTIONS = [
  { label:"Nutrición",      sub:"Plan del día",   screen:"nutrition", emoji:"🥗",  color:T.amber },
  { label:"Entrenamiento",  sub:"Rutina de hoy",  screen:"training",  emoji:"💪",  color:T.blue  },
  { label:"Micro-hábitos",  sub:"Agua · Pasos",   screen:"habits",    emoji:"💧",  color:T.teal  },
  { label:"Buscador",       sub:"Macros de platos", screen:"foodsearch", emoji:"🔍",  color:T.brown },
];

const DashboardScreen = ({ onNav }) => {
  const { state, dispatch } = useApp();
  const [showSearch, setShowSearch] = useState(false);
  const name = state.userData.name || "tú";
  const completed = state.mealsCompleted || [];
  
  const MEALS = getMealsForUser(state.userData, state.plan);
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
    <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 16px 110px", background:T.bg, minHeight:"100vh" }}>

      {/* ── Header ── */}
      <div className="fade-up" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <img src={MASCOT.logo} alt="NutrIA"
            onError={e => { e.target.src="https://i.postimg.cc/qgfvHSZ8/image.png"; }}
            style={{ width:44, height:44, borderRadius:13, objectFit:"cover", boxShadow:`0 2px 12px rgba(43,188,185,0.22)` }} />
          <div>
            <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>SEMANA 1 · DÍA 1</p>
            <h1 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:19, marginTop:1, color:T.textPrimary }}>
              ¡Hola, {name}! 👋
            </h1>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <div onClick={() => dispatch({ type:"UPDATE_USER_DATA", payload: { theme: state.userData.theme === 'dark' ? 'light' : 'dark' } })} style={{ width:40, height:40, borderRadius:12, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:T.shadow, cursor:"pointer" }}>
            <Icon name={state.userData.theme === 'dark' ? 'sun' : 'moon'} size={18} color={T.textSecondary} />
          </div>
          <div onClick={() => onNav("profiles")} style={{ width:40, height:40, borderRadius:12, background:state.userData.avatarEmoji ? T.tealLight : T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:T.shadow, cursor:"pointer", fontSize: state.userData.avatarEmoji ? 22 : 17 }}>
            {state.userData.avatarEmoji ? state.userData.avatarEmoji : <Icon name="users" size={17} color={T.textSecondary} />}
          </div>
        </div>
      </div>

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

      {/* ── Quick Actions ── */}
      <div className="fade-up fade-up-4" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
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
    </div>
  );
};

export default DashboardScreen;
