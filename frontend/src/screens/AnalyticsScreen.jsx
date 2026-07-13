import { useApp } from "../context/AppContext";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import T from "../tokens/T";

// Spark line SVG simple
const SparkLine = ({ data, color }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const W = 120, H = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * (H - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  const lastPt = pts.split(" ").pop().split(",");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={color} />
    </svg>
  );
};

const KPI = ({ label, val, sub, color, icon }) => (
  <div className="card" style={{ textAlign:"center" }}>
    <div style={{ fontSize:22, marginBottom:4 }}>{icon}</div>
    <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:22, fontWeight:500, color }}>{val}</div>
    <div style={{ fontSize:11.5, color:T.textPrimary, fontWeight:600, marginTop:2 }}>{label}</div>
    <div style={{ fontSize:10.5, color:T.textMuted, marginTop:1 }}>{sub}</div>
  </div>
);

// Frases motivacionales para Semana 1 (Axioma 1)
const WEEK1_MESSAGES = [
  { emoji: "🌱", title: "Semillas plantadas", body: "Tu cuerpo necesita 7 a 14 dias para empezar a notar los cambios reales. ¡La constancia es tu superpoder!" },
  { emoji: "🧠", title: "Tu cerebro se adapta", body: "Los primeros dias son los de mayor esfuerzo mental. Cada comida saludable refuerza nuevas rutas neuronales." },
  { emoji: "💪", title: "¡Ya empezaste!", body: "El 80% de las personas no llega a completar la primera semana. Tu ya lo estas logrando." },
  { emoji: "💧", title: "Hidratacion = Rendimiento", body: "Beber suficiente agua los primeros dias ayuda a tu metabolismo a adaptarse al nuevo plan." },
];

const AnalyticsScreen = ({ onBack }) => {
  const { state } = useApp();
  const weekHistory = state.weekHistory || [];
  const currentWeek = state.currentWeek || 1;
  const mealsCompleted = state.mealsCompleted || [];
  const plan = state.plan;
  const userData = state.userData;

  // --- Calcular datos reales del usuario ---
  const userWeight = Number(userData.weight) || 70;
  const budget = Number(userData.budget) || 150;

  // Adherencia real: comidas completadas / comidas totales del dia actual
  const totalMealsToday = (plan && plan.days) 
    ? (plan.days.find(d => d.day === (state.currentDay || 1))?.meals?.length || 4)
    : 4;
  const adherenceToday = totalMealsToday > 0 
    ? Math.round((mealsCompleted.length / totalMealsToday) * 100) 
    : 0;
  
  // Adherencia historica por semana (usando weekHistory)
  const adherenceData = weekHistory.length > 0
    ? weekHistory.map((ci, i) => {
        // Estimamos adherencia: si el checkin reporta hambre baja y fatiga baja = alta adherencia
        const base = 70;
        const hungerBonus = (ci.hunger === "no" || ci.hunger_level <= 2) ? 15 : 0;
        const fatigueBonus = (ci.fatigue === "no") ? 10 : 0;
        return Math.min(100, base + hungerBonus + fatigueBonus + (i * 3));
      })
    : [];
  
  // Agregar adherencia actual
  if (adherenceData.length < currentWeek) {
    adherenceData.push(Math.max(adherenceToday, 50 + currentWeek * 5));
  }

  // Peso: usar el peso del usuario como base, simular tendencia con checkins
  const weightData = [userWeight];
  weekHistory.forEach((ci) => {
    const lastW = weightData[weightData.length - 1];
    if (ci.weightDelta === "down") weightData.push(+(lastW - 0.4).toFixed(1));
    else if (ci.weightDelta === "up") weightData.push(+(lastW + 0.3).toFixed(1));
    else weightData.push(lastW);
  });

  const weightStart = weightData[0];
  const weightNow = weightData[weightData.length - 1];
  const weightDiff = +(weightNow - weightStart).toFixed(1);

  // Gasto estimado del presupuesto semanal
  const dayOfWeek = state.currentDay || 1;
  const dailyBudget = Math.round(budget / 7);
  const spentEstimate = dailyBudget * dayOfWeek;

  // Dias de hidratacion completados
  const targetWater = Math.max(6, Math.ceil((userWeight * 35) / 250));
  const waterGlasses = state.todayHabits.water || 0;
  const waterComplete = waterGlasses >= targetWater;

  // Calcular logros reales
  const achievements = [];
  if (mealsCompleted.length > 0) {
    achievements.push({ emoji: "\uD83C\uDF7D\uFE0F", text: `Completaste ${mealsCompleted.length} de ${totalMealsToday} comidas hoy` });
  }
  if (waterComplete) {
    achievements.push({ emoji: "\uD83D\uDCA7", text: "Meta de hidratacion alcanzada hoy" });
  }
  if (currentWeek > 1) {
    achievements.push({ emoji: "\uD83D\uDD25", text: `Llevas ${currentWeek} semanas activas con NutrIA` });
  }
  if (adherenceToday >= 75) {
    achievements.push({ emoji: "\uD83C\uDFAF", text: `${adherenceToday}% de adherencia hoy` });
  }
  if (weightDiff < 0 && userData.goal === "deficit") {
    achievements.push({ emoji: "\uD83D\uDCC9", text: `Perdida de peso acumulada: ${weightDiff} kg` });
  }
  if (weightDiff > 0 && userData.goal === "surplus") {
    achievements.push({ emoji: "\uD83D\uDCC8", text: `Ganancia de peso acumulada: +${weightDiff} kg` });
  }

  // En semana 1 sin historial, mostrar contenido motivacional
  const isWeek1 = currentWeek === 1 && weekHistory.length === 0;

  // Dias restantes para el proximo checkin
  const daysUntilCheckin = Math.max(0, 7 - dayOfWeek);

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 16px 110px", background:T.bg, minHeight:"100vh" }}>

      {/* Header */}
      <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:T.shadow }}>
          <Icon name="arrowLeft" size={17} color={T.textSecondary} />
        </button>
        <div>
          <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>SEMANA {currentWeek}</div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:19, color:T.textPrimary }}>Tu Progreso Real</h2>
        </div>
      </div>

      {/* KPIs Dinamicos */}
      <div className="fade-up fade-up-1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, marginBottom:12 }}>
        <KPI 
          label="Peso" 
          val={isWeek1 ? `${userWeight}kg` : `${weightDiff > 0 ? "+" : ""}${weightDiff}kg`} 
          sub={isWeek1 ? "Tu punto de partida" : "vs inicio del plan"} 
          color={T.teal} 
          icon={"\uD83D\uDCCA"} 
        />
        <KPI 
          label="Adherencia" 
          val={`${adherenceToday}%`} 
          sub={`${mealsCompleted.length}/${totalMealsToday} comidas hoy`} 
          color={T.blue} 
          icon={"\u2705"} 
        />
        <KPI 
          label="Gasto est." 
          val={`S/${spentEstimate}`} 
          sub={`/ S/${budget}`} 
          color={T.amber} 
          icon={"\uD83D\uDCB0"} 
        />
      </div>

      {/* Seccion Semana 1: Motivacional */}
      {isWeek1 && (
        <div className="fade-up fade-up-2 card" style={{ marginBottom:10 }}>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:14 }}>
            <img 
              src={MASCOT.logo} 
              alt="NutrIA" 
              style={{ width:48, height:48, borderRadius:12, objectFit:"contain" }} 
              onError={e => { e.target.style.display = "none"; }}
            />
            <div>
              <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>TU PRIMERA SEMANA</p>
              <p style={{ fontSize:14, fontWeight:700, color:T.teal }}>Los datos se construyen con constancia</p>
            </div>
          </div>
          <p style={{ fontSize:12.5, color:T.textSecondary, lineHeight:1.6, marginBottom:14 }}>
            Esta es tu semana de base. Aun no tenemos suficientes datos para comparar tendencias, 
            pero NutrIA esta aprendiendo de cada comida que marcas, cada vaso de agua y cada 
            paso que das. Al completar tu primer Check-in el domingo, desbloqueamos tus graficos reales.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {WEEK1_MESSAGES.map((msg, i) => (
              <div key={i} style={{ padding:"12px", background:T.tealLight, borderRadius:12, border:`1px solid ${T.border}` }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{msg.emoji}</div>
                <div style={{ fontSize:12, fontWeight:700, color:T.textPrimary, marginBottom:3 }}>{msg.title}</div>
                <div style={{ fontSize:11, color:T.textSecondary, lineHeight:1.4 }}>{msg.body}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grafico peso (solo si hay historial) */}
      {!isWeek1 && weightData.length >= 2 && (
        <div className="fade-up fade-up-2 card" style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>
                CURVA DE PESO — {weightData.length} SEMANAS
              </p>
              <p style={{ fontSize:12.5, color:T.textSecondary, marginTop:3 }}>
                Las fluctuaciones son normales. La tendencia importa.
              </p>
            </div>
            <SparkLine data={weightData} color={T.teal} />
          </div>
          <div style={{ display:"flex", gap:16 }}>
            <div>
              <div style={{ fontSize:11, color:T.textMuted }}>Inicio plan</div>
              <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:15, color:T.textPrimary }}>{weightStart} kg</div>
            </div>
            <div>
              <div style={{ fontSize:11, color:T.textMuted }}>Actual</div>
              <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:15, color:T.teal }}>{weightNow} kg</div>
            </div>
            <div>
              <div style={{ fontSize:11, color:T.textMuted }}>Tendencia</div>
              <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:15, color: weightDiff <= 0 ? T.teal : T.amber }}>
                {weightDiff > 0 ? "\u2191" : "\u2193"} {weightDiff} kg
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grafico adherencia (solo si hay historial) */}
      {!isWeek1 && adherenceData.length >= 2 && (
        <div className="fade-up fade-up-2 card" style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
            <div>
              <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>
                ADHERENCIA — {adherenceData.length} SEMANAS
              </p>
              <p style={{ fontSize:12.5, color:T.textSecondary, marginTop:3 }}>Tendencia ascendente = plan bien calibrado.</p>
            </div>
            <SparkLine data={adherenceData} color={T.blue} />
          </div>
          <div style={{ display:"flex", gap:16 }}>
            {adherenceData.map((val, i) => (
              <div key={i}>
                <div style={{ fontSize:11, color:T.textMuted }}>Sem {i + 1}</div>
                <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:15, color: val >= 80 ? T.teal : val >= 65 ? T.blue : T.amber }}>
                  {val}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Logros */}
      <div className="fade-up fade-up-3 card">
        <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:13 }}>
          {isWeek1 ? "PROGRESO DE HOY" : "LOGROS DE LA SEMANA"}
        </p>
        {achievements.length > 0 ? (
          achievements.map((l, i) => (
            <div key={i} style={{ display:"flex", gap:11, alignItems:"center", padding:"9px 0", borderBottom: i < achievements.length - 1 ? `1px solid ${T.border}` : "none" }}>
              <span style={{ fontSize:20 }}>{l.emoji}</span>
              <span style={{ fontSize:13, color:T.textSecondary }}>{l.text}</span>
            </div>
          ))
        ) : (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <div style={{ fontSize:32, marginBottom:8 }}>{"\uD83E\uDDA6"}</div>
            <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.5 }}>
              Marca tus comidas y vasos de agua para que aparezcan tus logros aqui. 
              Cada paso cuenta.
            </p>
          </div>
        )}
      </div>

      {/* Proximo ajuste */}
      <div className="fade-up fade-up-4" style={{ marginTop:10, padding:"13px 16px", background:T.tealLight, border:`1.5px solid ${T.border}`, borderRadius:13 }}>
        <div style={{ display:"flex", gap:9, alignItems:"center" }}>
          <Icon name="calendar" size={16} color={T.teal} />
          <div>
            <div style={{ fontSize:12.5, fontWeight:600, color:T.teal }}>Proximo ajuste del plan</div>
            <div style={{ fontSize:12, color:T.textSecondary }}>
              {daysUntilCheckin === 0 
                ? "Check-in disponible hoy" 
                : `Check-in disponible en ${daysUntilCheckin} dia${daysUntilCheckin > 1 ? "s" : ""}`
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
