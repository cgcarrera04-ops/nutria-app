import { useState } from "react";
import ProgressBar from "../../components/ui/ProgressBar";
import InputField from "../../components/ui/InputField";
import Icon from "../../components/ui/Icon";
import { useApp } from "../../context/AppContext";
import MASCOT from "../../constants/mascotImages";
import T from "../../tokens/T";

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
];

const OnboardBio = ({ onNext, onBack }) => {
  const { state, dispatch } = useApp();
  const { userData } = state;
  const set = (payload) => dispatch({ type: "UPDATE_USER_DATA", payload });
  const [expandedSoma, setExpandedSoma] = useState(null);

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
                        src={MASCOT.somatotype[s.imageKey]}
                        alt={`NutrIA ${s.label}`}
                        onError={e => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                        style={{ width:"100%", height:"100%", objectFit:"cover" }}
                      />
                      {/* Fallback emoji si no carga imagen */}
                      <div style={{ display:"none", fontSize:36, alignItems:"center", justifyContent:"center", width:"100%", height:"100%" }}>
                        {s.id==="slim" ? "🦦" : s.id==="athletic" ? "🦦💪" : "🦦🏋️"}
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
