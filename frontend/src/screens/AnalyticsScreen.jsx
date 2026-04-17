import Icon from "../components/ui/Icon";
import T from "../tokens/T";

// Spark line SVG simple
const SparkLine = ({ data, color }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const W = 120, H = 40;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / (max - min || 1)) * (H - 6) - 3;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts.split(" ").pop().split(",")[0]} cy={pts.split(" ").pop().split(",")[1]} r="3" fill={color} />
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

const AnalyticsScreen = ({ onBack }) => (
  <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 16px 110px", background:T.bg, minHeight:"100vh" }}>

    {/* Header */}
    <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
      <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:T.shadow }}>
        <Icon name="arrowLeft" size={17} color={T.textSecondary} />
      </button>
      <div>
        <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>MÓDULO 05</div>
        <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:19, color:T.textPrimary }}>Analytics y Progreso</h2>
      </div>
    </div>

    {/* KPIs */}
    <div className="fade-up fade-up-1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:9, marginBottom:12 }}>
      <KPI label="Peso" val="−0.8kg" sub="vs semana ant." color={T.teal}  icon="📉" />
      <KPI label="Adherencia" val="87%" sub="6/7 días" color={T.blue}  icon="✅" />
      <KPI label="Gasto real" val="S/138" sub="/ S/150" color={T.amber} icon="💰" />
    </div>

    {/* Gráfico peso */}
    <div className="fade-up fade-up-2 card" style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div>
          <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>CURVA DE PESO — 7 DÍAS</p>
          <p style={{ fontSize:12.5, color:T.textSecondary, marginTop:3 }}>Las fluctuaciones son normales. La tendencia importa.</p>
        </div>
        <SparkLine data={[72.0, 71.8, 72.1, 71.9, 71.6, 71.5, 71.2]} color={T.teal} />
      </div>
      <div style={{ display:"flex", gap:16 }}>
        <div><div style={{ fontSize:11, color:T.textMuted }}>Inicio semana</div><div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:15, color:T.textPrimary }}>72.0 kg</div></div>
        <div><div style={{ fontSize:11, color:T.textMuted }}>Hoy</div><div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:15, color:T.teal }}>71.2 kg</div></div>
        <div><div style={{ fontSize:11, color:T.textMuted }}>Tendencia</div><div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:15, color:T.teal }}>↓ −0.8 kg</div></div>
      </div>
    </div>

    {/* Gráfico adherencia */}
    <div className="fade-up fade-up-2 card" style={{ marginBottom:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <div>
          <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>ADHERENCIA — ÚLTIMAS 4 SEMANAS</p>
          <p style={{ fontSize:12.5, color:T.textSecondary, marginTop:3 }}>Tendencia ascendente = plan bien calibrado.</p>
        </div>
        <SparkLine data={[62, 71, 80, 87]} color={T.blue} />
      </div>
      <div style={{ display:"flex", gap:16 }}>
        {["Sem 1","Sem 2","Sem 3","Sem 4"].map((l, i) => (
          <div key={l}>
            <div style={{ fontSize:11, color:T.textMuted }}>{l}</div>
            <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:15, color:[T.amber,T.amber,T.blue,T.teal][i] }}>
              {[62,71,80,87][i]}%
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Logros de la semana */}
    <div className="fade-up fade-up-3 card">
      <p style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:13 }}>LOGROS DE LA SEMANA</p>
      {[
        { emoji:"💪", text:"Completaste 4 sesiones de entrenamiento" },
        { emoji:"💧", text:"Meta de hidratación alcanzada 5 de 7 días" },
        { emoji:"🎯", text:"87% de adherencia al plan nutricional" },
        { emoji:"📉", text:"Pérdida de peso dentro del rango esperado (−0.8 kg)" },
      ].map((l, i) => (
        <div key={i} style={{ display:"flex", gap:11, alignItems:"center", padding:"9px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none" }}>
          <span style={{ fontSize:20 }}>{l.emoji}</span>
          <span style={{ fontSize:13, color:T.textSecondary }}>{l.text}</span>
        </div>
      ))}
    </div>

    {/* Próximo ajuste */}
    <div className="fade-up fade-up-4" style={{ marginTop:10, padding:"13px 16px", background:T.tealLight, border:`1.5px solid ${T.border}`, borderRadius:13 }}>
      <div style={{ display:"flex", gap:9, alignItems:"center" }}>
        <Icon name="calendar" size={16} color={T.teal} />
        <div>
          <div style={{ fontSize:12.5, fontWeight:600, color:T.teal }}>Próximo ajuste del plan</div>
          <div style={{ fontSize:12, color:T.textSecondary }}>Domingo · Check-in disponible en 2 días</div>
        </div>
      </div>
    </div>
  </div>
);

export default AnalyticsScreen;
