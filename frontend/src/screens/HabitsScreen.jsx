import { useState } from "react";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";

const HABITS = [
  { label:"Despertar sin snooze",                    done:true,  emoji:"⏰" },
  { label:"10 min de luz solar al despertar",         done:true,  emoji:"☀️" },
  { label:"Suplemento de vitamina D",                 done:false, emoji:"💊" },
  { label:"Apagar pantallas 30 min antes de dormir",  done:false, emoji:"🌙" },
  { label:"Check de estrés nocturno (1-5)",           done:false, emoji:"🧠" },
];

const HabitsScreen = ({ onBack }) => {
  const { state, dispatch } = useApp();
  const water    = state.todayHabits.water;
  const waterGoal = 8;
  const steps    = 7240;
  const stepsGoal = 9000;

  const setWater = (n) => dispatch({ type:"UPDATE_HABITS", payload:{ water:n } });

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

      {/* ── Agua — empty state o tracker ── */}
      <div className="fade-up fade-up-1 card" style={{ marginBottom:10 }}>
        {/* Header agua */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Icon name="droplets" size={20} color={T.teal} />
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>Hidratación</div>
              <div style={{ fontSize:12, color:T.textMuted }}>Meta: {waterGoal} vasos · 2L</div>
            </div>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:24, fontWeight:500, color:T.teal }}>
            {water}<span style={{ fontSize:13, color:T.textMuted }}>/{waterGoal}</span>
          </div>
        </div>

        {/* Empty state — NutrIA seca */}
        {noWater && (
          <div style={{ textAlign:"center", padding:"10px 0 16px", animation:"fadeUp .3s ease both" }}>
            <img
              src={MASCOT.emptyState.noWater}
              alt="NutrIA necesita agua"
              onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}
              style={{ width:80, height:80, borderRadius:18, objectFit:"cover", margin:"0 auto 10px" }}
            />
            <div style={{ display:"none", fontSize:48, marginBottom:8 }}>🦦💧</div>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:14, color:T.teal, marginBottom:4 }}>
              ¡NutrIA necesita agua!
            </div>
            <div style={{ fontSize:12.5, color:T.textSecondary }}>Aún no has registrado ningún vaso hoy.</div>
          </div>
        )}

        {/* Celebración 100% */}
        {allWaterDone && (
          <div style={{ textAlign:"center", padding:"10px 0 14px", animation:"fadeUp .3s ease both" }}>
            <img
              src={MASCOT.emptyState.celebration}
              alt="¡Meta de agua lograda!"
              onError={e => { e.target.style.display="none"; }}
              style={{ width:72, height:72, borderRadius:16, objectFit:"cover", margin:"0 auto 10px" }}
            />
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:14, color:T.teal, marginBottom:2 }}>
              ¡Meta de hidratación lograda! 🎉
            </div>
            <div style={{ fontSize:12, color:T.textSecondary }}>NutrIA celebra contigo</div>
          </div>
        )}

        {/* Vasos visuales */}
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

      {/* ── Pasos ── */}
      <div className="fade-up fade-up-2 card" style={{ marginBottom:10 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:13 }}>
          <div style={{ display:"flex", gap:10, alignItems:"center" }}>
            <Icon name="footprints" size={20} color={T.blue} />
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>Pasos diarios</div>
              <div style={{ fontSize:12, color:T.textMuted }}>Meta: {stepsGoal.toLocaleString()} pasos</div>
            </div>
          </div>
          <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:20, fontWeight:500, color:T.blue }}>
            {steps.toLocaleString()}
          </div>
        </div>
        <div style={{ height:5, background:T.border, borderRadius:3, marginBottom:7 }}>
          <div style={{ height:"100%", width:`${Math.min((steps/stepsGoal)*100,100)}%`, background:T.blue, borderRadius:3, transition:"width .6s ease" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <span style={{ fontSize:12, color:T.textMuted }}>{Math.round((steps/stepsGoal)*100)}% completado</span>
          <span style={{ fontSize:12, color:T.blue }}>Faltan {Math.max(stepsGoal-steps,0).toLocaleString()}</span>
        </div>
      </div>

      {/* ── Hábitos del día ── */}
      <div className="fade-up fade-up-3 card">
        <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, marginBottom:14, color:T.textPrimary }}>Hábitos del día</div>
        {HABITS.map((h,i) => (
          <div key={i} style={{ display:"flex", gap:13, alignItems:"center", padding:"10px 0", borderBottom: i<HABITS.length-1 ? `1px solid ${T.border}` : "none" }}>
            <div style={{ width:22, height:22, borderRadius:7, background:h.done?T.tealLight:T.card, border:`1.5px solid ${h.done?T.teal:T.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {h.done && <Icon name="check" size={12} color={T.teal} />}
            </div>
            <span style={{ fontSize:20 }}>{h.emoji}</span>
            <span style={{ fontSize:13.5, color:h.done?T.textPrimary:T.textSecondary }}>{h.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitsScreen;
