import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import MASCOT from "../../constants/mascotImages";
import T from "../../tokens/T";

// ─── Etapas de carga (lenguaje lúdico, sin menciones técnicas) ───────────────
const STAGES = [
  { text: "NutrIA está leyendo tu perfil…",              emoji: "📖" },
  { text: "Buscando tu combinación perfecta...",          emoji: "🔍" },
  { text: "Calculando el plan más inteligente...",        emoji: "🧠" },
  { text: "Preparando tus comidas de la semana...",       emoji: "🥗" },
  { text: "¡Tu plan está casi listo!",                    emoji: "🎉" },
];

// ─── Componente de frame de mascota ──────────────────────────────────────────
const MascotFrame = () => {
  const [frameIdx, setFrameIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const frames = [MASCOT.loading.frame1, MASCOT.loading.frame2];

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setFrameIdx(i => (i + 1) % 2);
        setFade(true);
      }, 250);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position:"relative", marginBottom:28 }}>
      {/* Anillos de respiración */}
      {[0,1].map(i => (
        <div key={i} style={{
          position:"absolute", inset:-(i+1)*16, borderRadius:"34%",
          border:`1.5px solid ${T.teal}`, opacity:.12,
          animation:`breatheRing ${1.8 + i*.5}s ease-in-out infinite`,
          animationDelay:`${i*.25}s`,
        }} />
      ))}
      <img
        src={frames[frameIdx]}
        alt="NutrIA calculando tu plan"
        onError={e => { e.target.src = MASCOT.logo; }}
        style={{
          width:140, height:140, borderRadius:32, objectFit:"cover",
          position:"relative", zIndex:1,
          boxShadow:`0 8px 36px rgba(43,188,185,0.3)`,
          opacity: fade ? 1 : 0,
          transition:"opacity .25s ease",
        }}
      />
    </div>
  );
};

// ─── LoadingOverlay ───────────────────────────────────────────────────────────
const LoadingOverlay = () => {
  const { state, dispatch } = useApp();
  const [progress, setProgress] = useState(0);
  const [stage,    setStage]    = useState(0);

  useEffect(() => {
    if (!state.isGeneratingPlan) return;
    setProgress(0);
    setStage(0);

    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + 1.2;
        setStage(Math.min(Math.floor(next / 20), STAGES.length - 1));
        if (next >= 100) clearInterval(interval);
        return Math.min(next, 100);
      });
    }, 42);
    return () => clearInterval(interval);
  }, [state.isGeneratingPlan]);

  if (!state.isGeneratingPlan && !state.planError) return null;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(255,255,255,0.97)", backdropFilter:"blur(8px)",
      display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      padding:28, animation:"fadeIn .3s ease both",
    }}>
      {/* Mascota animada — alterna tecleando ↔ eureka cada 1.2s */}
      <MascotFrame />

      {/* Título */}
      <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:22, marginBottom:6, textAlign:"center", color:T.textPrimary }}>
        NutrIA está pensando en tu plan
      </h2>
      <p style={{ color:T.textSecondary, fontSize:13.5, marginBottom:28, textAlign:"center" }}>
        Combinando todo lo que nos contaste...
      </p>

      {/* Stages */}
      <div style={{ width:"100%", maxWidth:400, marginBottom:28 }}>
        {STAGES.map((s, i) => (
          <div key={i} style={{ display:"flex", gap:11, alignItems:"center", padding:"7px 0", opacity: i <= stage ? 1 : .28, transition:"opacity .4s" }}>
            <div style={{
              width:28, height:28, borderRadius:9, flexShrink:0,
              background: i < stage ? T.tealLight : i === stage ? `${T.teal}20` : T.surface,
              border:`1.5px solid ${i < stage ? T.teal : i === stage ? T.teal : T.border}`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, transition:"all .4s",
            }}>
              {i < stage ? "✓" : s.emoji}
            </div>
            <span style={{ fontSize:13, color: i === stage ? T.textPrimary : T.textSecondary }}>{s.text}</span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ height:5, background:T.border, borderRadius:3, overflow:"hidden" }}>
          <div style={{
            height:"100%", width:`${progress}%`,
            background:`linear-gradient(90deg, ${T.teal}, ${T.tealDark})`,
            borderRadius:3, transition:"width .12s linear",
          }} />
        </div>
        <p style={{ fontSize:11, color:T.textMuted, textAlign:"center", marginTop:8, fontFamily:"'IBM Plex Mono', monospace" }}>
          {Math.round(progress)}% completado
        </p>
      </div>

      {/* Error state */}
      {state.planError && (
        <div style={{ marginTop:22, textAlign:"center" }}>
          <p style={{ color:T.amber, fontSize:13, marginBottom:12 }}>⚠️ {state.planError}</p>
          <button className="btn-ghost" onClick={() => dispatch({ type:"SET_GENERATING", payload:false })}>
            Cancelar y reintentar
          </button>
        </div>
      )}
    </div>
  );
};

export default LoadingOverlay;
