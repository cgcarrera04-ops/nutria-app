import { useState } from "react";
import MASCOT from "../constants/mascotImages";
import Icon from "../components/ui/Icon";
import T from "../tokens/T";

const DEMO_PROFILES = [
  { id: "office",  label: "👨‍💻 Oficinista Sedentario (Perder Grasa)",  data: { name: "Carlos", goal: "deficit",  weight: 82, height: 175, age: 30, sex: "Masculino", somatotype: "robust",   cookMode: "mixed", cookTime: "15min", exerciseTime: "45min",  equipment: "gym",  budget: 180, activity: "sedentary", sleep: 6, stress: 4 } },
  { id: "athlete", label: "🏃‍♀️ Deportista (Ganar Músculo)",            data: { name: "Ana",    goal: "surplus",  weight: 58, height: 165, age: 24, sex: "Femenino",  somatotype: "athletic", cookMode: "cook",  cookTime: "60min", exerciseTime: "90min+", equipment: "gym",  budget: 250, activity: "very",      sleep: 8, stress: 2 } },
  { id: "busy",    label: "⚡ Persona Ocupada (Mantener)",                data: { name: "Luis",   goal: "maintain", weight: 70, height: 172, age: 35, sex: "Masculino", somatotype: "slim",     cookMode: "buy",               exerciseTime: "20min",  equipment: "home", budget: 300, activity: "light",     sleep: 5, stress: 5 } },
];

const STATS = [
  { val: "7 días", label: "Plan semanal completo",   color: T.teal  },
  { val: "3",      label: "Pasos para conocerte",    color: T.blue  },
  { val: "∞",      label: "El plan mejora contigo",  color: T.brown },
  { val: "S/0",    label: "Sin costo extra para ti", color: T.amber },
];

const FEATURES = [
  { emoji: "🧠", title: "IA que te entiende",      desc: "Analiza tu presupuesto, horario y nivel de estrés antes de proponer algo." },
  { emoji: "🍳", title: "Cocinas o compras",        desc: "El plan se adapta: ingredientes de mercado o delivery inteligente." },
  { emoji: "💪", title: "Entrenamiento real",       desc: "Rutinas diseñadas con el equipamiento que tienes, no el que quisieras." },
  { emoji: "📲", title: "Notificaciones empáticas", desc: "Un recordatorio amable, nunca una alarma que te haga sentir culpable." },
];

const WelcomeScreen = ({ onNext, onDemo }) => {
  const [showDemos, setShowDemos] = useState(false);

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: T.bg, position: "relative", overflow: "hidden",
    }}>
      {/* Blobs decorativos */}
      <div style={{ position:"absolute", top:"-8%", right:"-12%", width:420, height:420, borderRadius:"50%", background:T.tealLight, opacity:.7, pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"6%",  left:"-10%", width:300, height:300, borderRadius:"50%", background:`${T.teal}15`, pointerEvents:"none" }} />

      {/* Topbar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px", position:"relative", zIndex:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <img
            src={MASCOT.logo}
            alt="NutrIA"
            style={{ width:40, height:40, borderRadius:12, objectFit:"contain", boxShadow:`0 2px 10px rgba(43,188,185,0.28)`, background:"#fff", animation:"float 4s ease-in-out infinite" }}
            onError={e => e.target.style.display="none"}
          />
          <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:20, color:T.textPrimary, letterSpacing:"-0.5px" }}>
            Nutr<span style={{ color:T.teal }}>IA</span>
          </span>
        </div>
        <span className="tag" style={{ background:T.tealLight, color:T.teal, border:`1.5px solid ${T.border}` }}>
          ● SISTEMA ACTIVO
        </span>
      </div>

      {/* ── Hero: mascota grande + textos ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"16px 24px 8px", position:"relative", zIndex:10, textAlign:"center" }}>

        {/* Mascota GRANDE de cuerpo completo */}
        <div className="fade-up" style={{ marginBottom:20, width:"100%", maxWidth:280 }}>
          <div style={{
            position:"relative", borderRadius:32, overflow:"hidden",
            background:`linear-gradient(160deg, ${T.tealLight} 0%, ${T.bg} 100%)`,
            border:`1.5px solid ${T.border}`,
            boxShadow:`0 12px 48px rgba(43,188,185,0.18), 0 2px 10px rgba(0,0,0,0.06)`,
            padding:16,
          }}>
            <img
              src={MASCOT.wave || MASCOT.fullBody}
              alt="NutrIA — tu compañera de salud"
              onError={e => { e.target.src = MASCOT.logo; }}
              style={{
                width:"100%", height:"auto", objectFit:"contain", maxHeight:280,
                borderRadius:20,
                filter:"drop-shadow(0 6px 20px rgba(43,188,185,0.25))",
                animation:"float 4s ease-in-out infinite",
              }}
            />
            {/* Badge flotante */}
            <div style={{
              position:"absolute", top:14, right:14,
              background:T.teal, color:"#fff", fontSize:10.5,
              fontFamily:"'IBM Plex Mono', monospace", fontWeight:600,
              padding:"4px 9px", borderRadius:20, boxShadow:`0 2px 8px rgba(43,188,185,0.4)`,
            }}>
              NutrIA
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="fade-up fade-up-1" style={{ marginBottom:14 }}>
          <span className="tag" style={{ background:T.blueLight, color:T.blue, border:`1.5px solid ${T.border}`, padding:"5px 14px", fontSize:10.5 }}>
            <Icon name="cpu" size={10} color={T.blue} />
            {" "}NUTRICIÓN · ENTRENAMIENTO · HÁBITOS · VIDA REAL
          </span>
        </div>

        {/* Headline */}
        <h1 className="fade-up fade-up-2" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:"clamp(30px, 7vw, 58px)", lineHeight:1.08, letterSpacing:"-1.5px", marginBottom:12, color:T.textPrimary }}>
          Nutr<span style={{ color:T.teal }}>IA</span>
        </h1>

        <p className="fade-up fade-up-2" style={{ fontSize:17, color:T.teal, fontWeight:600, fontFamily:"'Nunito Sans', sans-serif", marginBottom:14, letterSpacing:"-0.3px" }}>
          Que tu plan no te estrese, que te <em style={{ fontStyle:"normal", color:T.brown }}>NutrIA</em>
        </p>

        <p className="fade-up fade-up-3" style={{ fontSize:14, color:T.textSecondary, maxWidth:400, lineHeight:1.8, marginBottom:28 }}>
          No más planes genéricos. <strong style={{ color:T.textPrimary }}>NutrIA</strong> analiza tu vida real — presupuesto, tiempo, estrés — y diseña el plan de menor fricción hacia tu objetivo.
        </p>

        {/* CTAs */}
        <div className="fade-up fade-up-3" style={{ display:"flex", flexDirection:"column", gap:10, width:"100%", maxWidth:340 }}>
          
          {/* Botón de Google Sign-In */}
          <button 
            onClick={async () => {
              try {
                const { loginWithGoogle } = await import("../services/firebase");
                const user = await loginWithGoogle();
                // Si el logueo es exitoso, actualizamos los datos locales del usuario
                onDemo({
                  name: user.displayName.split(" ")[0],
                  email: user.email,
                  photoURL: user.photoURL,
                  googleUid: user.uid,
                });
              } catch (e) {
                alert("No se pudo iniciar sesión con Google. Inténtalo de nuevo. 🦦");
              }
            }} 
            className="btn-ghost" 
            style={{ 
              width:"100%", 
              padding:"14px", 
              background:"#fff", 
              color:"#333", 
              border:`1.5px solid ${T.border}`, 
              borderRadius:12, 
              display:"flex", 
              alignItems:"center", 
              justifyContent:"center", 
              gap:10,
              boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
              fontWeight: 600
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707a5.416 5.416 0 0 1-.282-1.707c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.32 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.427 0 9 0A8.997 8.997 0 0 0 .957 4.961l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Conectarse con Google
          </button>

          <button id="btn-start" className="btn-primary" onClick={onNext} style={{ padding:"15px 40px", fontSize:16 }}>
            Iniciar plan sin cuenta <Icon name="arrowRight" size={17} color="#fff" />
          </button>

          <div style={{ position:"relative" }}>
            <button onClick={() => setShowDemos(!showDemos)} className="btn-ghost" style={{ width:"100%", padding:"12px", background:`${T.teal}12`, color:T.teal, border:`1.5px solid ${T.teal}40`, borderRadius:12 }}>
              <Icon name="layers" size={15} color={T.teal} /> Probar con perfil de ejemplo
            </button>
            {showDemos && (
              <div style={{ position:"relative", zIndex:150, marginTop:8, backgroundColor:"var(--t-surface)", border:`1.5px solid ${T.border}`, borderRadius:14, padding:8, boxShadow:T.shadowMd, animation:"fadeIn .2s ease both" }}>
                {DEMO_PROFILES.map(p => (
                  <div key={p.id} onClick={() => onDemo(p.data)} style={{ padding:"12px 14px", fontSize:13, fontWeight:600, color:T.textPrimary, borderBottom:`1px solid ${T.border}`, cursor:"pointer", borderRadius:8, textAlign:"left", backgroundColor:"var(--t-surface)" }}>
                    {p.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hint de scroll */}
        <div className="fade-up fade-up-4" style={{ marginTop:24, display:"flex", flexDirection:"column", alignItems:"center", gap:4, color:T.textMuted }}>
          <div style={{ fontSize:11.5, fontFamily:"'IBM Plex Mono', monospace", letterSpacing:".5px" }}>DESLIZA PARA VER MÁS</div>
          <div style={{ fontSize:18, animation:"float 2s ease-in-out infinite" }}>↓</div>
        </div>
      </div>

      {/* ── Sección de funcionalidades ── */}
      <div style={{ padding:"24px 24px 8px", position:"relative", zIndex:10 }}>
        <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", textAlign:"center", marginBottom:16, letterSpacing:".8px" }}>
          ¿QUÉ HACE NutrIA POR TI?
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              padding:"14px 12px",
              background:T.surface,
              border:`1.5px solid ${T.border}`,
              borderRadius:12,
              boxShadow:T.shadow,
            }}>
              <div style={{ fontSize:26, marginBottom:8 }}>{f.emoji}</div>
              <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13, color:T.textPrimary, marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:11.5, color:T.textMuted, lineHeight:1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div className="fade-up fade-up-4" style={{ display:"flex", flexWrap:"wrap", justifyContent:"center", borderTop:`1.5px solid ${T.border}`, background:T.surface, marginTop:20 }}>
        {STATS.map((s, i) => (
          <div key={i} style={{ padding:"17px 20px", borderRight: i < 3 ? `1.5px solid ${T.border}` : "none", textAlign:"center", flex:"1 1 auto", minWidth:80 }}>
            <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontWeight:500, fontSize:20, color:s.color }}>{s.val}</div>
            <div style={{ fontSize:10, color:T.textMuted, marginTop:3, textTransform:"uppercase", letterSpacing:".7px", lineHeight:1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding:"12px 24px", borderTop:`1.5px solid ${T.border}`, display:"flex", gap:7, alignItems:"center", justifyContent:"center", background:T.bg }}>
        <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:10.5, color:T.textMuted }}>
          🇵🇪 Diseñado en Perú · Para la vida real peruana
        </span>
      </div>
    </div>
  );
};

export default WelcomeScreen;
