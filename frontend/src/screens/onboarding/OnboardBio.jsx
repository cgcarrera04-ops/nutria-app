import { useState, useMemo } from "react";
import ProgressBar from "../../components/ui/ProgressBar";
import InputField from "../../components/ui/InputField";
import Icon from "../../components/ui/Icon";
import { useApp } from "../../context/AppContext";
import MASCOT from "../../constants/mascotImages";
import T from "../../tokens/T";

// ─── Detecta si el usuario tiene bajo peso Y eligió bajar grasa ───────────────
const detectLowWeightDeficit = (userData) => {
  if (userData.goal !== "deficit") return false;
  const w = Number(userData.weight);
  const h = Number(userData.height) / 100;
  if (!w || !h || h < 1) return false;
  return (w / (h * h)) < 18.5;
};

// ─── Detecta si el usuario tiene sobrepeso/obesidad Y eligió ganar volumen ───
const detectHighWeightSurplus = (userData) => {
  if (userData.goal !== "surplus") return false;
  const w = Number(userData.weight);
  const h = Number(userData.height) / 100;
  if (!w || !h || h < 1) return false;
  return (w / (h * h)) >= 28; // IMC >= 28 (Pre-obesidad alta/Obesidad)
};

const SOMATOTYPES = [
  {
    id:       "slim",
    label:    "Delgada",
    tag:      "Ectomorfo",
    quote:    '"Me cuesta ganar peso"',
    desc:     "Metabolismo rápido. La IA aplicará +10% al TDEE. Recetas de alta densidad calórica. Plan de entrenamiento enfocado en volumen y progresión de carga.",
    imageKey: "slim",
    color:    T.blue,
  },
  {
    id:       "athletic",
    label:    "Atlética",
    tag:      "Mesomorfo",
    quote:    '"Gano músculo fácilmente"',
    desc:     "Buena respuesta muscular. Factor metabólico estándar. Balance entre volumen de entrenamiento y nutrición. El somatotipo más versátil.",
    imageKey: "athletic",
    color:    T.teal,
  },
  {
    id:       "robust",
    label:    "Ancha",
    tag:      "Endomorfo",
    quote:    '"Gano peso, me cuesta perder grasa"',
    desc:     "Metabolismo más lento. La IA aplicará −5% al TDEE. Énfasis en alimentos de alta saciedad. Cardio integrado como complemento al entrenamiento.",
    imageKey: "robust",
    color:    T.brown,
  },
  {
    id:       "unknown",
    label:    "No estoy seguro",
    tag:      "NutrIA decide",
    quote:    '"Prefiero que NutrIA me evalúe"',
    desc:     "¡No te preocupes! Si seleccionas esta opción, analizaré tu ritmo de vida y tu primer check-in para deducir tu somatotipo óptimo de forma 100% personalizada. ¡Comencemos paso a paso!",
    imageKey: "unknown",
    color:    T.teal,
  },
];

const OnboardBio = ({ onNext, onBack }) => {
  const { state, dispatch } = useApp();
  const { userData } = state;
  const set = (payload) => dispatch({ type: "UPDATE_USER_DATA", payload });
  const [expandedSoma, setExpandedSoma] = useState(null);
  const [lowWeightDismissed, setLowWeightDismissed] = useState(false);
  const [highWeightDismissed, setHighWeightDismissed] = useState(false);

  // Se recalcula cada vez que cambia peso, altura o goal
  const showLowWeightAlert = useMemo(
    () => !lowWeightDismissed && detectLowWeightDeficit(userData),
    [userData.weight, userData.height, userData.goal, lowWeightDismissed] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const showHighWeightAlert = useMemo(
    () => !highWeightDismissed && detectHighWeightSurplus(userData),
    [userData.weight, userData.height, userData.goal, highWeightDismissed] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const canProceed = 
    userData.weight >= 30 && userData.weight <= 250 &&
    userData.height >= 100 && userData.height <= 250 &&
    userData.age >= 14 && userData.age <= 100 &&
    userData.somatotype;

  const selectSoma = (id) => {
    set({ somatotype: id });
    setExpandedSoma(id);
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", background:T.bg }}>
      <ProgressBar
        step={2} total={3} completedSteps={[1]}
        onStepClick={n => { if (n === 1) onBack(); }}
      />

      <div style={{ flex:1, maxWidth:520, margin:"0 auto", padding:"24px 20px 110px", width:"100%" }}>

        <div className="fade-up">
          <span className="tag" style={{ background:T.tealLight, color:T.teal, border:`1.5px solid ${T.border}` }}>
            PASO 2 DE 3 · BIOMETRÍA + BIOTIPO
          </span>
        </div>

        <h2 className="fade-up fade-up-1" style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:24, marginBottom:6, marginTop:12, color:T.textPrimary }}>
          Cuéntanos sobre tu cuerpo
        </h2>
        <p className="fade-up fade-up-2" style={{ color:T.textSecondary, fontSize:13.5, marginBottom:22, lineHeight:1.65 }}>
          La base matemática de tu plan. NutrIA calculará tu TDEE con ecuación de Harris-Benedict.
        </p>

        {/* Grid biometría */}
        <div className="fade-up fade-up-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <InputField label="Peso actual" placeholder="72" type="number" value={userData.weight} onChange={v => set({ weight: v })} unit="kg" />
          <InputField label="Altura"      placeholder="175" type="number" value={userData.height} onChange={v => set({ height: v })} unit="cm" />
        </div>
        <div className="fade-up fade-up-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
          <InputField label="Edad" placeholder="24" type="number" value={userData.age} onChange={v => set({ age: v })} unit="años" />
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:7 }}>Sexo biológico</label>
            <div style={{ display:"flex", gap:7 }}>
              {["Masculino","Femenino"].map(s => (
                <div key={s} onClick={() => set({ sex:s })} style={{
                  flex:1, padding:"12px 8px",
                  background: userData.sex===s ? T.tealMid : T.surface,
                  border:`1.5px solid ${userData.sex===s ? T.teal : T.border}`,
                  borderRadius:12, cursor:"pointer", textAlign:"center",
                  fontSize:13, color: userData.sex===s ? T.teal : T.textSecondary,
                  fontWeight: userData.sex===s ? 600 : 400, transition:"all .18s", boxShadow:T.shadow,
                }}>{s}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Alerta Edad Juvenil */}
        {userData.age && userData.age < 18 && (
          <div className="fade-up" style={{
            background:`${T.teal}10`, border:`1.5px solid ${T.teal}40`, borderRadius:14, padding:"12px 14px",
            display:"flex", gap:10, alignItems:"flex-start", marginBottom:18, animation:"fadeUp .3s ease both"
          }}>
            <img src={MASCOT.logo} alt="NutrIA Protectora" style={{ width:40, height:40, borderRadius:10, objectFit:"cover", flexShrink:0, border:`1.5px solid ${T.teal}40` }} onError={e => { e.target.style.display="none"; }} />
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:T.teal, marginBottom:2 }}>NutrIA te cuida en tu crecimiento 🌱</div>
              <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.5 }}>
                Como aún estás en etapa de desarrollo físico, tus requerimientos se ajustarán cuidadosamente. El enfoque será construir hábitos saludables, sin restricciones energéticas extremas.
              </div>
            </div>
          </div>
        )}

        {/* Nota de honestidad */}
        <div className="fade-up fade-up-2" style={{
          background:`${T.teal}08`, border:`1.2px dashed ${T.teal}40`, borderRadius:14, padding:"12px 14px",
          textAlign:"center", margin:"16px 0", color:T.textSecondary, fontSize:12.5, lineHeight:1.6
        }}>
          🦦 <strong>Promesa de Honestidad:</strong> Para que pueda diseñar tu plan ideal, por favor sé 100% honesto con tus datos. Tu cuerpo es único, valioso y perfecto tal como es hoy. ¡Aquí no hay juicios, solo apoyo incondicional! ❤️
        </div>

        {/* Somatotipos con imagen de mascota */}
        <div className="fade-up fade-up-3">
          <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:12 }}>
            Toca la NutrIA que más se parece a tu metabolismo
          </label>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {SOMATOTYPES.map(s => {
              const sel  = userData.somatotype === s.id;
              const open = expandedSoma === s.id;
              return (
                <div key={s.id}>
                  {/* Card con imagen */}
                  <div
                    id={`somatotype-${s.id}`}
                    onClick={() => selectSoma(s.id)}
                    style={{
                      display:"flex", gap:14, alignItems:"center",
                      padding:"14px 16px",
                      background: sel ? `${s.color}10` : T.surface,
                      border:`2px solid ${sel ? s.color : T.border}`,
                      borderRadius: open ? "14px 14px 0 0" : 14,
                      cursor:"pointer", transition:"all .22s", boxShadow:T.shadow,
                    }}
                  >
                    {/* Imagen mascota */}
                    <div style={{
                      width:104, height:104, borderRadius:18, flexShrink:0, overflow:"hidden",
                      background: sel ? `${s.color}18` : T.card,
                      border:`1.5px solid ${sel ? s.color : T.border}`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all .22s",
                    }}>
                      <img
                        src={MASCOT.somatotype[s.imageKey] || MASCOT.logo}
                        alt={`NutrIA ${s.label}`}
                        onError={e => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                        style={{
                          width:"100%",
                          height:"100%",
                          objectFit:"cover",
                          transition:"all .3s ease",
                          transform: sel ? "scale(1.08)" : "scale(1)",
                          animation: sel ? "float 3s ease-in-out infinite" : "none"
                        }}
                      />
                      {/* Fallback emoji si no carga imagen */}
                      <div style={{ display:"none", fontSize:36, alignItems:"center", justifyContent:"center", width:"100%", height:"100%" }}>
                        {s.id==="slim" ? "🦦" : s.id==="athletic" ? "🦦💪" : s.id==="robust" ? "🦦🏋️" : "🦦❓"}
                      </div>
                    </div>

                    {/* Texto */}
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", gap:7, alignItems:"center", marginBottom:3 }}>
                        <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:15.5, color: sel ? s.color : T.textPrimary }}>{s.label}</span>
                        <span className="tag" style={{ background:`${s.color}15`, color:s.color, border:`1px solid ${s.color}40`, fontSize:10 }}>{s.tag}</span>
                      </div>
                      <div style={{ fontSize:12.5, color:T.textMuted, fontStyle:"italic" }}>{s.quote}</div>
                    </div>

                    {/* Check / flecha */}
                    {sel
                      ? <div style={{ width:22, height:22, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <Icon name="check" size={12} color="#fff" />
                        </div>
                      : <span style={{ color:T.textMuted, fontSize:16, transform: open ? "rotate(180deg)" : "rotate(0)", transition:"transform .2s" }}>▾</span>
                    }
                  </div>

                  {/* Explicación expandida */}
                  {open && (
                    <div style={{
                      padding:"12px 16px", background:`${s.color}08`,
                      border:`2px solid ${s.color}`, borderTop:"none",
                      borderRadius:"0 0 14px 14px", animation:"fadeUp .2s ease both",
                    }}>
                      <p style={{ fontSize:12.5, color:T.textSecondary, lineHeight:1.65, margin:0 }}>
                        {s.desc}
                      </p>
                      <p style={{ fontSize:11, color:T.textMuted, marginTop:6, fontStyle:"italic" }}>
                        Nota: El biotipo es un punto de partida. El check-in semanal ajustará el plan si tu cuerpo responde diferente a lo esperado.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Alerta bajo peso + déficit: aparece en tiempo real ── */}
      {showLowWeightAlert && (
        <div style={{
          position:"fixed", bottom:80, left:0, right:0,
          padding:"0 16px", zIndex:50,
          animation:"fadeUp .3s ease both",
        }}>
          <div style={{
            maxWidth:520, margin:"0 auto",
            background:T.bg,
            border:`2px solid ${T.amber}`,
            borderRadius:16, padding:"14px 16px",
            boxShadow:`0 4px 24px rgba(192,120,40,0.22)`,
          }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
              <span style={{ fontSize:24, flexShrink:0 }}>🦦❤️</span>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13.5, color:T.amber, marginBottom:3 }}>
                  NutrIA se preocupa por ti
                </div>
                <p style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
                  Con tu peso y altura actuales, tu cuerpo probablemente necesita <strong style={{ color:T.textPrimary }}>ganar músculo y energía</strong>, no reducir. Elegir "Perder grasa" podría ser contraproducente ahora.
                </p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => { dispatch({ type:"UPDATE_USER_DATA", payload:{ goal:"maintain" } }); setLowWeightDismissed(true); }}
                style={{ flex:1, padding:"9px 10px", background:T.teal, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:12 }}
              >
                ✨ Cambiar a Recomposición
              </button>
              <button
                onClick={() => setLowWeightDismissed(true)}
                style={{ padding:"9px 12px", background:"transparent", color:T.textMuted, border:`1px solid ${T.border}`, borderRadius:10, cursor:"pointer", fontSize:11 }}
              >
                Continuar igual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Alerta sobrepeso + volumen: aparece en tiempo real ── */}
      {showHighWeightAlert && (
        <div style={{
          position:"fixed", bottom:80, left:0, right:0,
          padding:"0 16px", zIndex:50,
          animation:"fadeUp .3s ease both",
        }}>
          <div style={{
            maxWidth:520, margin:"0 auto",
            background:T.bg,
            border:`2px solid ${T.amber}`,
            borderRadius:16, padding:"14px 16px",
            boxShadow:`0 4px 24px rgba(192,120,40,0.22)`,
          }}>
            <div style={{ display:"flex", gap:10, alignItems:"flex-start", marginBottom:10 }}>
              <span style={{ fontSize:24, flexShrink:0 }}>🦦❤️</span>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13.5, color:T.amber, marginBottom:3 }}>
                  NutrIA sugiere un cambio de enfoque
                </div>
                <p style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
                  Con tu IMC actual, elegir "Ganar músculo" (superávit calórico) probablemente agregue grasa corporal innecesaria. Lo mejor para tu salud y estética ahora es <strong style={{ color:T.textPrimary }}>recomposición o perder grasa</strong> mientras entrenas fuerza.
                </p>
              </div>
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <button
                onClick={() => { dispatch({ type:"UPDATE_USER_DATA", payload:{ goal:"deficit" } }); setHighWeightDismissed(true); }}
                style={{ flex:1, padding:"9px 10px", background:T.teal, color:"#fff", border:"none", borderRadius:10, cursor:"pointer", fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:12 }}
              >
                ✨ Cambiar a Perder Grasa
              </button>
              <button
                onClick={() => setHighWeightDismissed(true)}
                style={{ padding:"9px 12px", background:"transparent", color:T.textMuted, border:`1px solid ${T.border}`, borderRadius:10, cursor:"pointer", fontSize:11 }}
              >
                Continuar igual
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer fijo */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, padding:"14px 22px 24px", background:`linear-gradient(transparent, ${T.bg} 45%)`, display:"flex", justifyContent:"space-between" }}>
        <button className="btn-ghost" onClick={onBack}>
          <Icon name="arrowLeft" size={15} color={T.textSecondary} /> Volver
        </button>
        <button className="btn-primary" onClick={onNext} disabled={!canProceed} style={{ padding:"13px 30px" }}>
          Siguiente <Icon name="arrowRight" size={15} color="#fff" />
        </button>
      </div>
    </div>
  );
};

export default OnboardBio;
