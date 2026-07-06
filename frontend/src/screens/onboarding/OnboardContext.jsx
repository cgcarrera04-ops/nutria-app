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
const DIET_TYPES = [
  { val: "balanced", emoji: "🍛", label: "Balanceada", sub: "Come de todo (Óptima)" },
  { val: "vegetarian", emoji: "🥗", label: "Vegetariana", sub: "Lácteos/huevos permitidos" },
  { val: "vegan", emoji: "🌱", label: "Vegana", sub: "100% plantas" },
  { val: "keto", emoji: "🥑", label: "Keto / Low Carb", sub: "Pronto: Por ahora se adapta a balanceado" }
];
const COOK_TIMES = [
  { val:"15min", emoji:"⚡", label:"15 min",  sub:"Muy poco" },
  { val:"30min", emoji:"🍳", label:"30 min",  sub:"Moderado" },
  { val:"60min", emoji:"👨‍🍳", label:"60 min",  sub:"Cómodo"   },
];
const EXERCISE_TIMES = [
  { val:"0min",   emoji:"🚫", label:"No entreno",     sub:"Solo nutrición" },
  { val:"20min",  emoji:"⚡", label:"20-30 min",    sub:"HIIT / Circuitos" },
  { val:"45min",  emoji:"🏋️", label:"45-60 min",    sub:"Fuerza estándar"   },
  { val:"60min+", emoji:"💪", label:"+60 min",      sub:"Sesión completa"   },
];
const EQUIPMENT_OPTS = [
  { val:"gym",     emoji:"🏟️",  label:"Gym completo",   sub:"Máquinas, poleas" },
  { val:"home",    emoji:"🏠",  label:"Casa / mínimo",  sub:"Mancuernas, bandas" },
  { val:"outdoor", emoji:"🌳",  label:"Al aire libre",  sub:"Se adaptará a rutina en Casa" },
];
const MEAL_COUNTS = [
  { val:2, emoji:"☕", label:"2 comidas", sub:"Ayuno intermitente" },
  { val:3, emoji:"🍽️", label:"3 comidas", sub:"Desayuno, almuerzo, cena" },
  { val:4, emoji:"🍱", label:"4 comidas", sub:"Estándar + merienda" },
  { val:5, emoji:"💪", label:"5 comidas", sub:"Para volumen / atletas" },
];
const CHEAT_MEAL_OPTS = [
  { val:"none",   emoji:"🥗", label:"100% limpio",   sub:"Régimen estricto" },
  { val:"weekly", emoji:"🍔", label:"1-2 por semana",sub:"Equilibrio (Cheat meal)" },
  { val:"daily",  emoji:"🍫", label:"Algo diario",   sub:"Flexibilidad (IIFYM)" },
];
const ACTIVITY_OPTS = [
  { val:"sedentary", emoji:"💺", label:"Sedentario",          sub:"Escritorio, <5k pasos/día" },
  { val:"light",     emoji:"🚶", label:"Levemente activo",    sub:"Caminatas, trabajo de pie" },
  { val:"moderate",  emoji:"🏃", label:"Moderadamente activo",sub:"Ejercicio 3-4 días/sem" },
  { val:"very",      emoji:"⚡", label:"Muy activo",          sub:"Trabajo físico, >12k pasos/día" },
];
const ALLERGY_SUGGESTIONS = ["Mariscos","Lácteos","Gluten","Huevos","Frutos secos","Soya","Cerdo","Maní","Picante"];
const INJURY_SUGGESTIONS  = ["Rodilla","Hombro","Lumbar","Cervical","Muñeca","Codo","Cadera","Tobillo"];

const SUPPLEMENT_OPTS = [
  { val: "none", emoji: "🚫", label: "Solo comida", sub: "100% natural" },
  { val: "basic", emoji: "💊", label: "Básico", sub: "Ej: Creatina, Vitaminas" },
  { val: "premium", emoji: "🥤", label: "Premium", sub: "Ej: Whey Protein" }
];
const MENSTRUAL_OPTS = [
  { val: "follicular", emoji: "🌸", label: "Folicular", sub: "Días 1-14 (Fuerza)" },
  { val: "ovulatory", emoji: "✨", label: "Ovulatoria", sub: "Pico energía" },
  { val: "luteal", emoji: "🍂", label: "Lútea", sub: "Días 16-28 (Antojos)" },
  { val: "menstrual", emoji: "🩸", label: "Menstruación", sub: "Descanso" },
  { val: "none", emoji: "⚪", label: "No aplica", sub: "Menopausia / Irregular" }
];
const FATIGUE_OPTS = [
  { val: "low", emoji: "🔋", label: "Alta", sub: "Despierto al 100%" },
  { val: "moderate", emoji: "🥱", label: "Moderada", sub: "Tardo en arrancar" },
  { val: "high", emoji: "🧟", label: "Extrema", sub: "Necesito café / Agotado" }
];

// ── Motor de recomendaciones de entrenamiento (goal × somatotype) ─────────────
const TRAINING_RECS = {
  // surplus = Ganar músculo
  "surplus_slim":    { urgency:"critical", color:"#e53935", emoji:"🚨",
    headline: "Fundamental para tu objetivo",
    body: "Con tu biotipo ectomorfo, sin estímulo muscular las calorías extra se convierten en grasa, no en músculo. El entrenamiento de fuerza es tu herramienta #1.",
    suggestedTime: "45min", suggestedEquip: "gym",
    cta: "Empezar con 45 min de fuerza" },
  "surplus_athletic":{ urgency:"high",     color:T.amber,   emoji:"💪",
    headline: "Muy recomendado para ganar músculo",
    body: "Tienes una genética envidiable para el músculo, pero el superávit sin entrenamiento solo acumula grasa. Aprovecha tu ventaja mesoforfa.",
    suggestedTime: "60min+", suggestedEquip: "gym",
    cta: "Entrenar 60+ min para maximizar ganancias" },
  "surplus_robust":  { urgency:"high",     color:T.amber,   emoji:"🏋️",
    headline: "Muy recomendado — cuida la calidad del superávit",
    body: "Tu metabolismo endomorfo acumula grasa fácil. Combinar el superávit con fuerza asegura que las calorías extra construyan músculo, no reservas de grasa.",
    suggestedTime: "45min", suggestedEquip: "gym",
    cta: "Combinar fuerza + nutrición" },

  // maintain = Recomposición
  "maintain_slim":   { urgency:"high",     color:T.amber,   emoji:"⚡",
    headline: "El ejercicio acelera tu recomposición",
    body: "Cambiar grasa por músculo siendo ectomorfo requiere estímulo de fuerza sí o sí. Sin él, el proceso es tan lento que puede ser frustrante.",
    suggestedTime: "45min", suggestedEquip: "home",
    cta: "Agregar 45 min de fuerza" },
  "maintain_athletic":{ urgency:"moderate", color:T.blue,   emoji:"🏃",
    headline: "Recomendado para acelerar resultados",
    body: "La recomposición funciona mejor con ejercicio. Con tu genética atlética, verás resultados rápidos con solo 3 sesiones semanales.",
    suggestedTime: "45min", suggestedEquip: "gym",
    cta: "Agregar entrenamiento" },
  "maintain_robust": { urgency:"high",     color:T.amber,   emoji:"🔥",
    headline: "El cardio es tu mayor aliado",
    body: "La recomposición corporal para tu biotipo endomorfo sin ejercicio es extremadamente lenta. El cardio + fuerza es lo que realmente cambia el cuerpo.",
    suggestedTime: "45min", suggestedEquip: "outdoor",
    cta: "Activar plan de entrenamiento" },

  // deficit = Perder grasa
  "deficit_slim":    { urgency:"moderate", color:T.blue,    emoji:"🛡️",
    headline: "El ejercicio preserva tu músculo",
    body: "Al perder grasa siendo ectomorfo, el riesgo de perder músculo también es alto. El entrenamiento de fuerza es tu escudo protetor.",
    suggestedTime: "20min", suggestedEquip: "home",
    cta: "Agregar rutina de fuerza corta" },
  "deficit_athletic":{ urgency:"moderate", color:T.blue,    emoji:"⚡",
    headline: "Recomendado para acelerar el proceso",
    body: "Un pequeño déficit calórico + ejercicio es la combinación más efectiva para perder grasa conservando músculo con tu biotipo atlético.",
    suggestedTime: "45min", suggestedEquip: "gym",
    cta: "Combinar déficit + entrenamiento" },
  "deficit_robust":  { urgency:"high",     color:T.amber,   emoji:"🔥",
    headline: "El cardio multiplica tu resultado",
    body: "Para tu metabolismo endomorfo, el ejercicio no es opcional si quieres ver cambios reales. El cardio es tu palanca más potente para quemar grasa.",
    suggestedTime: "45min", suggestedEquip: "outdoor",
    cta: "Activar plan de cardio + fuerza" },
};

const UNDERWEIGHT_DEFICIT_REC = {
  urgency: "critical", color: "#e53935", emoji: "🚨",
  headline: "Precaución: Déficit calórico + Bajo peso",
  body: "Como mencionamos, lo ideal sería comer más y entrenar fuerza para construir músculo. Sin embargo, como has decidido mantener el objetivo de 'Perder Grasa' (déficit calórico), entrenar duro en este estado consumirá el poco músculo que tienes. Limítate a rutinas muy cortas y suaves para no desgastarte.",
  suggestedTime: "20min", suggestedEquip: "home",
  cta: "Proteger músculo con 20 min suave"
};

const OBESE_SURPLUS_REC = {
  urgency: "critical", color: "#e53935", emoji: "🚨",
  headline: "Precaución: Superávit calórico + Sobrepeso",
  body: "Lo óptimo para ti sería recomposición o déficit. Como has elegido 'Ganar Músculo' (comer más calorías de las que gastas) teniendo un IMC elevado, es probable que ganes más grasa que músculo. Es ABSOLUTAMENTE VITAL que entrenes fuerza pesado e incluyas cardio para mitigar la ganancia de grasa.",
  suggestedTime: "60min+", suggestedEquip: "gym",
  cta: "Entrenar 60+ min obligatoriamente"
};

const getTrainingRec = (userData) => {
  const w = Number(userData.weight);
  const h = Number(userData.height) / 100;
  const bmi = (w && h && h > 0) ? (w / (h * h)) : null;
  
  // Si tiene bajo peso y quiere perder grasa
  if (userData.goal === "deficit" && bmi && bmi < 18.5) {
    return UNDERWEIGHT_DEFICIT_REC;
  }
  
  // Si tiene sobrepeso/obesidad y quiere ganar masa (superávit)
  if (userData.goal === "surplus" && bmi && bmi >= 28) {
    return OBESE_SURPLUS_REC;
  }

  const key = `${userData.goal}_${userData.somatotype}`;
  return TRAINING_RECS[key] || null;
};

// ── Componente: Banner de recomendación de entrenamiento ──────────────────────
const TrainingHint = ({ userData, exerciseTime, onAccept }) => {
  const rec = getTrainingRec(userData);
  if (!rec) return null;

  const isNoTraining = exerciseTime === "0min";
  const showWarning  = isNoTraining && (rec.urgency === "critical" || rec.urgency === "high");

  // Si ya eligió entrenar, mostramos solo el chip de validación positiva
  if (exerciseTime && exerciseTime !== "0min") {
    return (
      <div style={{
        display:"flex", alignItems:"center", gap:8, padding:"9px 12px",
        background:`${T.teal}10`, border:`1.5px solid ${T.teal}40`,
        borderRadius:10, marginBottom:10,
      }}>
        <span style={{ fontSize:16 }}>✅</span>
        <span style={{ fontSize:12, color:T.teal, fontWeight:600 }}>
          Excelente elección para tu objetivo de {userData.goal === "surplus" ? "ganar músculo" : userData.goal === "deficit" ? "perder grasa" : "recomposición"}
        </span>
      </div>
    );
  }

  const bgColor   = rec.urgency === "critical" ? "#fff5f5" : rec.urgency === "high" ? `${T.amber}08` : `${T.blue}08`;
  const borderClr = rec.urgency === "critical" ? "#e5393540" : rec.urgency === "high" ? `${T.amber}50` : `${T.blue}40`;

  return (
    <div style={{
      background: bgColor, border:`1.5px solid ${borderClr}`,
      borderRadius:12, padding:"13px 14px", marginBottom:12,
      animation:"fadeUp .25s ease both",
    }}>
      {/* Header */}
      <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom: showWarning ? 10 : 0 }}>
        <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>{rec.emoji}</span>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13, color:rec.color, marginBottom:3 }}>
            {rec.headline}
          </div>
          <p style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, margin:0 }}>{rec.body}</p>
        </div>
      </div>

      {/* CTA: solo si está en "No entreno" y urgencia es alta/crítica */}
      {showWarning && (
        <button
          onClick={() => onAccept(rec.suggestedTime, rec.suggestedEquip)}
          style={{
            width:"100%", padding:"9px 14px",
            background: rec.urgency === "critical" ? "#e53935" : T.amber,
            color:"#fff", border:"none", borderRadius:10, cursor:"pointer",
            fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:12.5,
            display:"flex", alignItems:"center", justifyContent:"center", gap:6,
          }}
        >
          💡 {rec.cta}
        </button>
      )}
    </div>
  );
};

// ── Componente: Banner de recomendación de Alimentación ──────────────────────
const DietHint = ({ userData, dietType }) => {
  if (!dietType || dietType === "balanced") return null;
  const isSlim = userData.somatotype === "slim";
  const isSurplus = userData.goal === "surplus";

  // Advertencia 1: Keto/Vegan para Ectomorfos
  if (isSlim && (dietType === "keto" || dietType === "vegan")) {
    const isKeto = dietType === "keto";
    return (
      <div style={{ background: "#fff5f5", border:`1.5px solid #e5393540`, borderRadius:12, padding:"13px 14px", marginBottom:12, animation:"fadeUp .25s ease both" }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
          <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>🚨</span>
          <div>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13, color:"#e53935", marginBottom:3 }}>
              Cuidado: Ectomorfo + {isKeto ? "Keto" : "Vegano"}
            </div>
            <p style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
              {isKeto 
                ? "Keto elimina carbohidratos (tu fuente de energía principal para ganar peso). Siendo de contextura delgada, hacer keto hará casi imposible que llegues a un superávit calórico y ganes masa muscular. Te recomendamos fuertemente una alimentación Balanceada."
                : "La alimentación vegana tiene mucho volumen pero baja densidad calórica (te llenas rápido). Siendo de contextura delgada, te costará comer la inmensa cantidad de comida vegana necesaria para ganar masa muscular. Evita desnutrirte e incluye batidos hipercalóricos."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Advertencia 2: Keto + Objetivo de Ganar Músculo
  if (isSurplus && dietType === "keto" && !isSlim) {
    return (
      <div style={{ background: `${T.amber}08`, border:`1.5px solid ${T.amber}50`, borderRadius:12, padding:"13px 14px", marginBottom:12, animation:"fadeUp .25s ease both" }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
          <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>⚠️</span>
          <div>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13, color:T.amber, marginBottom:3 }}>
              Poco eficiente: Volumen en Keto
            </div>
            <p style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
              Ganar músculo (superávit) sin carbohidratos es extremadamente difícil. Los carbohidratos disparan la insulina, nuestra principal hormona anabólica. Considera una alimentación balanceada si tu objetivo primordial es crecer muscularmente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Advertencia 3: Vegana + Objetivo de Ganar Músculo (No delgados, los delgados tienen alerta roja arriba)
  if (isSurplus && dietType === "vegan" && !isSlim) {
    return (
      <div style={{ background: `${T.amber}08`, border:`1.5px solid ${T.amber}50`, borderRadius:12, padding:"13px 14px", marginBottom:12, animation:"fadeUp .25s ease both" }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
          <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>⚠️</span>
          <div>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13, color:T.amber, marginBottom:3 }}>
              Reto digestivo: Volumen de comida Vegana
            </div>
            <p style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
              Ganar masa muscular requiere mucha proteína. Las fuentes de proteína vegetal (menestras, cereales) tienen baja densidad calórica y altísima fibra, lo que saturará tu digestión rápidamente. Tendrás que combinar fuentes (arroz + menestras) para obtener aminoácidos completos y considerar proteína en polvo vegana.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// ── Componente: Banner de recomendación de Suplementos ─────────────────────────────
const SupplementsHint = ({ userData }) => {
  if (userData.supplements === "premium" && userData.exerciseTime === "0min") {
    return (
      <div style={{ background: `${T.amber}08`, border:`1.5px solid ${T.amber}50`, borderRadius:12, padding:"13px 14px", marginBottom:12, animation:"fadeUp .25s ease both" }}>
        <div style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
          <span style={{ fontSize:20, flexShrink:0, marginTop:1 }}>💸</span>
          <div>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13, color:T.amber, marginBottom:3 }}>
              Gasto Innecesario: Suplementos sin estímulo
            </div>
            <p style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, margin:0 }}>
              Has indicado no querer entrenar, pero estás dispuesto a comprar suplementos premium (Whey/Creatina). Sin entrenamiento de fuerza que rompa fibras musculares, esos suplementos son un gasto innecesario. ¡Mejor invierte ese dinero en mejor comida real!
            </p>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

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

  const canProceed = userData.cookMode && userData.exerciseTime && (userData.exerciseTime === "0min" ? true : userData.equipment) && userData.activity;

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

        {/* ── Banner inteligente de Recomendación de Ejercicio ── */}
        <TrainingHint 
          userData={userData} 
          exerciseTime={userData.exerciseTime}
          onAccept={(time, equip) => {
            set({ exerciseTime: time, equipment: equip });
          }}
        />

        {/* ── Tiempo para ejercicio ── */}
        <div className="fade-up fade-up-2" style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>
            Tiempo disponible para ejercitarte
          </label>
          <GridSelect 
            options={EXERCISE_TIMES} 
            value={userData.exerciseTime} 
            onChange={v => {
              set({ exerciseTime:v });
              if (v === "0min") set({ equipment: "none" }); // Limpiar equipamiento si no entrena
            }} 
            cols={2} 
          />
        </div>

        {/* ── Equipamiento (Se oculta si elige "No entreno") ── */}
        {userData.exerciseTime !== "0min" && (
          <div className="fade-up fade-up-3" style={{ marginBottom:16 }}>
            <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>
              Equipamiento de entrenamiento
            </label>
            {userData.equipment && userData.equipment !== "none" && (
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
              El plan de entrenamiento se adapta completamente al equipo que indiques. Sin excusas.
            </p>
          </div>
        )}

        {/* ── Presupuesto ── */}
        <div className="fade-up fade-up-3" style={{ background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:14, padding:18, marginBottom:16, boxShadow:T.shadow }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
            <span style={{ fontSize:13, color:T.textSecondary, fontWeight:600 }}>Presupuesto semanal (solo tú)</span>
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:18, color:T.teal, fontWeight:500 }}>S/ {budget}</span>
          </div>
          <input type="range" min={100} max={500} value={budget} onChange={e => { setBudget(+e.target.value); set({ budget: +e.target.value }); }} style={{ width:"100%" }} />
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:7 }}>
            <span style={{ fontSize:11, color:T.textMuted }}>S/ 100 · Ajustado</span>
            <span style={{ fontSize:11, color:T.textMuted }}>S/ 500 · Premium</span>
          </div>
          <p style={{ fontSize:11.5, color:T.textMuted, marginTop:8, lineHeight:1.5 }}>
            Sé honesto. Un plan aspiracional que no puedes costear es peor que ningún plan.
          </p>
        </div>

        {/* Alerta Presupuesto Bajo */}
        {budget <= 100 && (
          <div className="fade-up" style={{
            background:`${T.teal}10`, border:`1.5px solid ${T.teal}40`, borderRadius:14, padding:"12px 14px",
            display:"flex", gap:10, alignItems:"flex-start", marginBottom:16, animation:"fadeUp .3s ease both"
          }}>
            <img src={MASCOT.logo} alt="NutrIA Ahorradora" style={{ width:40, height:40, borderRadius:10, objectFit:"cover", flexShrink:0, border:`1.5px solid ${T.teal}40` }} onError={e => { e.target.style.display="none"; }} />
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:T.teal, marginBottom:2 }}>NutrIA Ahorradora 💰</div>
              <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.5 }}>
                ¡S/ {budget} es un gran presupuesto si compramos con sabiduría! NutrIA te guiará para priorizar compras en mercados y sacarle el máximo provecho a ingredientes nutritivos y económicos de nuestra tierra.
              </div>
            </div>
          </div>
        )}

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
              width:"100%", padding:"15px 18px",
              background: showAdvanced ? T.tealMid : `${T.teal}08`,
              border:`2px dashed ${T.teal}`,
              borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center",
              cursor:"pointer", boxShadow:`0 2px 12px rgba(43,188,185,0.18)`, transition:"all .22s"
            }}
          >
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Icon name="layers" size={20} color={T.teal} />
              <div style={{ textAlign:"left" }}>
                <div style={{ fontSize:14, fontWeight:700, color:T.teal, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
                  Opciones Avanzadas
                </div>
                <div style={{ fontSize:11, color:T.textMuted, marginTop:1 }}>
                  Alergias, sueño, estrés, lesiones y más
                </div>
              </div>
              <span style={{ fontSize:10, fontWeight:700, background:T.teal, color:"#fff", padding:"2px 7px", borderRadius:20, marginLeft:4 }}>
                +DETALLE
              </span>
            </div>
            <Icon name={showAdvanced ? "arrowLeft" : "arrowRight"} size={16} color={T.teal} />
          </button>
        </div>

        {showAdvanced && (
          <div style={{ animation:"fadeUp .3s ease both" }}>
            <p style={{ fontSize:12, color:T.textMuted, marginBottom:16, lineHeight:1.5 }}>
              Detalles clínicos, alérgenos y logística específica.
            </p>

            {/* ── Tipo de Alimentación ── */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>Tipo de Alimentación / Preferencia</label>
              <DietHint userData={userData} dietType={userData.dietType} />
              <GridSelect options={DIET_TYPES} value={userData.dietType || "balanced"} onChange={v => set({ dietType:v })} cols={2} />
            </div>

            {/* ── Frecuencia de Comidas ── */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>Frecuencia de comidas por día</label>
              <GridSelect options={MEAL_COUNTS} value={userData.mealCount || 3} onChange={v => set({ mealCount:v })} cols={2} />
            </div>

            {/* ── Flexibilidad / Comida Chatarra ── */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>Inclusión de "Gustitos" (Chatarra / Dulces)</label>
              <GridSelect options={CHEAT_MEAL_OPTS} value={userData.cravings || "weekly"} onChange={v => set({ cravings:v })} cols={3} />
            </div>

            {/* ── Suplementación ── */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>Presupuesto / Disposición a Suplementos</label>
              <SupplementsHint userData={userData} />
              <GridSelect options={SUPPLEMENT_OPTS} value={userData.supplements || "none"} onChange={v => set({ supplements:v })} cols={3} />
            </div>

            {/* ── Fatiga al Despertar (Salud Adrenal) ── */}
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, fontWeight:600, color:T.textSecondary, display:"block", marginBottom:9 }}>Energía al despertar (Salud Adrenal)</label>
              <GridSelect options={FATIGUE_OPTS} value={userData.fatigue || "low"} onChange={v => set({ fatigue:v })} cols={3} />
            </div>

            {/* ── Sincronizador Hormonal NutrIA (Solo Mujeres) ── */}
            {(userData.sex === "Female" || userData.sex === "Femenino" || userData.sex === "female") && (() => {
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

              return (
                <div style={{ background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:14, padding:16, marginBottom:16, boxShadow:T.shadow }}>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:12 }}>
                    <span style={{ fontSize:18 }}>🌸</span>
                    <div>
                      <div style={{ fontWeight:600, fontSize:13, color:T.textSecondary }}>Sincronizador Hormonal NutrIA</div>
                      <div style={{ fontSize:11, color:T.textMuted }}>Configuración médica de tu ciclo actual</div>
                    </div>
                  </div>

                  {/* Slider 1: Cuándo inició */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:12, color:T.textSecondary }}>¿Hace cuántos días inició tu última regla?</span>
                      <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:13, color:T.teal, fontWeight:600 }}>Hace {daysAgo} días</span>
                    </div>
                    <input type="range" min={0} max={30} value={daysAgo} onChange={e => handleCycleChange({ lastPeriodDaysAgo: +e.target.value })} style={{ width:"100%" }} />
                  </div>

                  {/* Slider 2: Duración del ciclo */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:12, color:T.textSecondary }}>Duración de tu ciclo habitual</span>
                      <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:13, color:T.teal, fontWeight:600 }}>{cLength} días</span>
                    </div>
                    <input type="range" min={21} max={35} value={cLength} onChange={e => handleCycleChange({ cycleLength: +e.target.value })} style={{ width:"100%" }} />
                  </div>

                  {/* Slider 3: Duración del sangrado */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:12, color:T.textSecondary }}>Duración del sangrado (regla)</span>
                      <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:13, color:T.teal, fontWeight:600 }}>{pDuration} días</span>
                    </div>
                    <input type="range" min={3} max={10} value={pDuration} onChange={e => handleCycleChange({ periodDuration: +e.target.value })} style={{ width:"100%" }} />
                  </div>

                  {/* Banner reactivo de fase actual computed */}
                  <div style={{
                    background:`${T.teal}08`, border:`1.5px solid ${T.teal}40`,
                    borderRadius:10, padding:"10px 12px", display:"flex", justifyContent:"space-between", alignItems:"center",
                  }}>
                    <span style={{ fontSize:11.5, color:T.textSecondary, fontWeight:600 }}>Fase Calculada Hoy:</span>
                    <span style={{ fontSize:12, color:T.teal, fontWeight:700 }}>{phaseNames[phase]}</span>
                  </div>
                  
                  <p style={{ fontSize:11, color:T.textMuted, marginTop:9, lineHeight:1.5, margin:0 }}>
                    La IA calculará los cambios exactos de carbohidratos y descarga de ejercicio para los días específicos de tu semana actual.
                  </p>
                </div>
              );
            })()}

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
                maxLength={200}
                style={{
                  width:"100%", padding:"13px 15px", fontSize:13, fontFamily:"'Nunito Sans', sans-serif",
                  background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:12,
                  resize:"none", lineHeight:1.7, color:T.textPrimary, boxShadow:T.shadow, transition:"border-color .2s",
                }}
                onFocus={e => (e.target.style.borderColor = T.teal)}
                onBlur={e => (e.target.style.borderColor = T.border)}
              />
              <div style={{ fontSize:11, color:T.textMuted, marginTop:5, textAlign:"right" }}>
                {(userData.pandoraText||"").length}/200
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
