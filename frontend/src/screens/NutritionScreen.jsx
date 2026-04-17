import { useState } from "react";
import Icon from "../components/ui/Icon";
import FoodSearchModal from "../components/ui/FoodSearchModal";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";

// ─── Días de la semana ─────────────────────────────────────────────────────────
const DAYS_LABELS = ["Hoy", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// ─── Comidas hardcodeadas de respaldo (cuando no hay plan del banco) ──────────
const FALLBACK_COOK = [
  { time:"07:00", name:"Desayuno",  kcal:480, items:["3 huevos revueltos","2 rebanadas pan integral","1 plátano mediano"],    macros:{p:28,c:52,g:14}, emoji:"☀️", plan_b:["Batido de avena y plátano","1 huevo duro"], tip:"Empieza el día con proteína para energía sostenida." },
  { time:"12:30", name:"Almuerzo",  kcal:620, items:["Arroz integral 1 taza","Pechuga de pollo 150g","Ensalada verde"],        macros:{p:55,c:68,g:16}, emoji:"🍱", plan_b:["Wrap integral de pollo","Agua con limón"],     tip:"La comida más importante. No la saltes aunque estés ocupado." },
  { time:"16:00", name:"Merienda",  kcal:220, items:["Yogurt griego 150g","Almendras 20g"],                                    macros:{p:18,c:14,g:10}, emoji:"🥜", plan_b:["Barra de proteína","1 manzana"],               tip:"Un snack real evita los antojos nocturnos." },
  { time:"20:00", name:"Cena",      kcal:540, items:["Atún en agua 1 lata","Camote mediano asado","Espinaca salteada"],        macros:{p:42,c:58,g:10}, emoji:"🌙", plan_b:["Ensalada de atún sin mayonesa","Pan integral"], tip:"Cena ligera. Tu cuerpo sigue trabajando mientras duermes." },
];
const FALLBACK_BUY = [
  { time:"08:00", name:"Desayuno",       kcal:400, items:["Sándwich integral de pollo","Café negro"],                                   macros:{p:22,c:45,g:12}, emoji:"☀️", plan_b:["Avena instantánea","Fruta"],                         tip:"Elige opciones integrales para energía que dura." },
  { time:"13:00", name:"Almuerzo",       kcal:750, items:["Filete de pollo a la plancha","Media porción de arroz","Ensalada sin aliño"], macros:{p:60,c:75,g:20}, emoji:"🍱", plan_b:["Ensalada grande","Pollo a la parrilla (1/2)"],       tip:"Pide el aliño aparte y usa solo la mitad." },
  { time:"16:30", name:"Snack",          kcal:200, items:["Barra de proteína (baja azúcar)","1 manzana"],                                macros:{p:15,c:25,g:6},  emoji:"⚡", plan_b:["Yogurt natural sin azúcar","Puñado de almendras"], tip:"Ojo con el azúcar de las barras. Busca ≤8g." },
  { time:"20:30", name:"Cena Ligera",    kcal:510, items:["Ensalada César sin crutones","Pollo a la parrilla","Aliño aparte (mitad)"],   macros:{p:45,c:15,g:25}, emoji:"🌙", plan_b:["Sopa de verduras","Pan integral tostado"],          tip:"Cena digestiva. Evita fritos y salsas cremosas en la noche." },
];

/**
 * Convierte las comidas del banco de respuestas al formato que espera la UI.
 * El banco tiene: { name, time, kcal, items, plan_b, macros: {p,c,g} }
 */
const bankMealsToUI = (bankMeals) =>
  bankMeals.map((m, i) => {
    const emojis = ["☀️", "🍱", "🥜", "🌙", "⚡"];
    return {
      time:   m.time  || "",
      name:   m.name  || `Comida ${i + 1}`,
      kcal:   m.kcal  || 0,
      items:  m.items || [],
      plan_b: m.plan_b || m.items || [],
      macros: m.macros || { p: 0, c: 0, g: 0 },
      emoji:  emojis[i % emojis.length],
      tip:    m.tip || "Sigue el plan. Cada comida cuenta.",
    };
  });

/**
 * getMealsForUser — exportada para que DashboardScreen calcule totales.
 * Prioriza los datos reales del banco si el plan está cargado.
 */
export const getMealsForUser = (userData, plan) => {
  // Si hay plan del banco y tiene días, usar el día 1 (o el actual)
  if (plan && plan.days && plan.days.length > 0) {
    const day = plan.days[0]; // día 1 por defecto
    if (day.meals && day.meals.length > 0) {
      const meals = bankMealsToUI(day.meals);
      // Si el usuario compra preparado, usar plan_b como items
      if (userData?.cookMode === "buy") {
        return meals.map(m => ({ ...m, items: m.plan_b.length ? m.plan_b : m.items }));
      }
      return meals;
    }
  }
  // Fallback hardcodeado
  return userData?.cookMode === "buy" ? FALLBACK_BUY : FALLBACK_COOK;
};

// ─── Datos de compras del plan real ──────────────────────────────────────────
const getShoppingList = (plan) => {
  if (plan && plan.shopping && plan.shopping.length > 0) {
    return plan.shopping;
  }
  // Fallback
  return [
    { item:"Pechuga de pollo", qty:"700g",    price:14, cat:"Proteínas"     },
    { item:"Huevos",           qty:"1 docena", price:9,  cat:"Proteínas"     },
    { item:"Atún en agua",     qty:"3 latas",  price:8,  cat:"Proteínas"     },
    { item:"Arroz integral",   qty:"1 kg",     price:5,  cat:"Carbohidratos" },
    { item:"Pan integral",     qty:"1 bolsa",  price:6,  cat:"Carbohidratos" },
    { item:"Camote",           qty:"500g",     price:4,  cat:"Carbohidratos" },
    { item:"Almendras",        qty:"150g",     price:12, cat:"Grasas"        },
    { item:"Aceite de oliva",  qty:"250ml",    price:11, cat:"Grasas"        },
    { item:"Yogurt griego",    qty:"400g",     price:9,  cat:"Lácteos"       },
    { item:"Espinaca",         qty:"200g",     price:4,  cat:"Vegetales"     },
  ];
};

// ─── NutritionScreen ───────────────────────────────────────────────────────────
const NutritionScreen = ({ onBack }) => {
  const { state, dispatch } = useApp();
  const [activeDay,    setActiveDay]    = useState("Hoy");
  const [showPlanB,    setShowPlanB]    = useState(false);
  const [showSearch,   setShowSearch]   = useState(false);
  const [expandedTip,  setExpandedTip]  = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const isBuyMode = state.userData?.cookMode === "buy";
  const plan      = state.plan;
  const MEALS     = getMealsForUser(state.userData, plan);
  const SHOPPING  = getShoppingList(plan);
  const CATS      = [...new Set(SHOPPING.map(s => s.cat))];

  const completed    = state.mealsCompleted || [];
  const handleToggle = (i) => {
    dispatch({ type: "TOGGLE_MEAL",  payload: i });
    dispatch({ type: "SAVE_PROFILE" });
  };

  const totalKcal = MEALS.reduce((a, m) => a + (m.kcal || 0), 0);
  const doneKcal  = completed.reduce((acc, i) => {
    const m = MEALS[i]; return acc + (m ? (m.kcal || 0) : 0);
  }, 0);
  const pct    = totalKcal ? Math.min(100, Math.round((doneKcal / totalKcal) * 100)) : 0;
  const total  = SHOPPING.reduce((a, s) => a + (Number(s.price) || 0), 0);

  // Info del plan del banco
  const planLabel = plan?.label || null;
  const planKcal  = plan?.calories_daily || totalKcal;

  return (
    <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 16px 110px", background:T.bg, minHeight:"100vh" }}>

      {/* ── Header ── */}
      <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
        <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:T.shadow }}>
          <Icon name="arrowLeft" size={17} color={T.textSecondary} />
        </button>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>MÓDULO 01</div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:19, color:T.textPrimary }}>
            Nutrición Modular
          </h2>
        </div>
        <span className="tag" style={{ background:T.amberLight, color:T.amber, border:`1.5px solid ${T.border}` }}>
          {planKcal} kcal/día
        </span>
      </div>

      {/* ── Badge del plan actual ── */}
      {planLabel && (
        <div className="fade-up" style={{ marginBottom:12, padding:"10px 14px", background:T.tealLight, border:`1.5px solid ${T.teal}30`, borderRadius:12, fontSize:12, color:T.teal, fontWeight:600, display:"flex", alignItems:"center", gap:8 }}>
          <span>✨</span>
          <span style={{ color:T.textSecondary, fontWeight:400 }}>Tu plan: </span>
          {planLabel}
        </div>
      )}

      {/* ── Mini progreso diario ── */}
      <div className="fade-up card" style={{ marginBottom:14, padding:"14px 16px" }}>
        <div style={{ fontSize:11.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6 }}>
          PROGRESO DEL DÍA — {pct}% completado
        </div>
        <div style={{ height:6, background:T.border, borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${T.teal}, ${T.tealDark})`, borderRadius:3, transition:"width .5s ease" }} />
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
          <span style={{ fontSize:11, color:T.textMuted }}>{doneKcal} kcal consumidas</span>
          <span style={{ fontSize:11, color:T.teal, fontFamily:"'IBM Plex Mono', monospace" }}>{completed.length}/{MEALS.length} comidas ✓</span>
        </div>
      </div>

      {/* ── Day selector ── */}
      <div style={{ marginBottom:6 }}>
        <div style={{ fontSize:10, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:5, display:"flex", justifyContent:"space-between" }}>
          <span>DÍA DEL PLAN</span>
          <span style={{ fontSize:9.5 }}>← desliza →</span>
        </div>
        <div className="fade-up fade-up-1" style={{ display:"flex", gap:7, overflowX:"auto", paddingBottom:8, marginBottom:4, scrollbarWidth:"none" }}>
          {DAYS_LABELS.map(d => (
            <div key={d} onClick={() => setActiveDay(d)} style={{
              padding:"8px 16px", background: activeDay===d ? T.teal : T.surface,
              border:`1.5px solid ${activeDay===d ? T.teal : T.border}`,
              borderRadius:12, cursor:"pointer", flexShrink:0, transition:"all .18s", boxShadow:T.shadow,
            }}>
              <span style={{ fontSize:13, fontWeight:activeDay===d?700:400, color:activeDay===d?"#fff":T.textSecondary }}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Plan toggle ── */}
      <div className="fade-up fade-up-1" style={{ marginBottom:8 }}>
        <div style={{ fontSize:10, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6 }}>VARIANTE DEL PLAN</div>
        <div style={{ display:"flex", gap:8 }}>
          {[
            { id:false, label:"⭐ Plan Ideal",     sub:"Recetas completas"  },
            { id:true,  label:"⚡ Plan B Express",  sub:"≤10 min de prep"   },
          ].map(p => (
            <button key={String(p.id)} onClick={() => setShowPlanB(p.id)} style={{
              flex:1, padding:"10px 8px", background:showPlanB===p.id ? T.tealMid : T.surface,
              border:`1.5px solid ${showPlanB===p.id ? T.teal : T.border}`,
              borderRadius:12, cursor:"pointer", transition:"all .18s", boxShadow:T.shadow, textAlign:"left",
            }}>
              <div style={{ fontSize:12.5, color:showPlanB===p.id?T.teal:T.textPrimary, fontWeight:showPlanB===p.id?700:500 }}>{p.label}</div>
              <div style={{ fontSize:10.5, color:T.textMuted, marginTop:2 }}>{p.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {showPlanB && (
        <div style={{ padding:"10px 14px", background:T.tealLight, border:`1.5px solid ${T.border}`, borderRadius:11, marginBottom:12, fontSize:13, color:T.textSecondary, lineHeight:1.6 }}>
          <strong style={{ color:T.teal }}>Plan B activado</strong> · Opciones con ≤10 min de preparación. Perfectas para días caóticos.
        </div>
      )}

      {/* ── Comidas ── */}
      <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:18 }}>
        {MEALS.map((m, i) => {
          const isDone   = completed.includes(i);
          const tipOpen  = expandedTip === i;
          const itemList = showPlanB && m.plan_b && m.plan_b.length ? m.plan_b : m.items;
          return (
            <div key={i} className="card" style={{ padding:"15px 18px", opacity:isDone?0.72:1, transition:"all .3s", border:`1.5px solid ${isDone?T.teal+"50":T.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:isDone?T.tealLight:T.card, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0, transition:"all .3s" }}>
                    {m.emoji}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:14.5, color:T.textPrimary, textDecoration:isDone?"line-through":"none", marginBottom:1 }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>
                      {m.time}{m.time ? " · " : ""}{m.kcal} kcal
                    </div>
                  </div>
                </div>
                <div onClick={() => handleToggle(i)} style={{
                  width:32, height:32, borderRadius:"50%", border:`2.5px solid ${isDone?T.teal:T.border}`,
                  background:isDone?T.teal:"transparent", display:"flex", alignItems:"center", justifyContent:"center",
                  cursor:"pointer", transition:"all .25s", boxShadow:isDone?`0 2px 10px ${T.teal}50`:"none", flexShrink:0,
                }}>
                  {isDone && <Icon name="check" size={14} color="#fff" />}
                </div>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:10 }}>
                {itemList.map((item, j) => (
                  <div key={j} style={{ fontSize:12.5, color:T.textSecondary, display:"flex", gap:8, alignItems:"flex-start" }}>
                    <div style={{ width:5, height:5, borderRadius:"50%", background:T.teal, flexShrink:0, marginTop:5 }} />
                    {item}
                  </div>
                ))}
              </div>

              <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:8 }}>
                <span className="tag" style={{ background:T.blueLight,  color:T.blue,  border:`1.5px solid ${T.border}` }}>Prot: {m.macros.p}g</span>
                <span className="tag" style={{ background:T.tealLight,  color:T.teal,  border:`1.5px solid ${T.border}` }}>Carb: {m.macros.c}g</span>
                <span className="tag" style={{ background:T.brownLight, color:T.brown, border:`1.5px solid ${T.border}` }}>Gras: {m.macros.g}g</span>
                <span className="tag" onClick={() => setExpandedTip(tipOpen?null:i)}
                  style={{ background:tipOpen?T.amber+"20":T.card, color:T.amber, border:`1.5px solid ${T.amber}50`, cursor:"pointer" }}>
                  💡 Tip
                </span>
              </div>

              {tipOpen && (
                <div style={{ padding:"10px 12px", background:`${T.amber}10`, border:`1.5px solid ${T.amber}40`, borderRadius:10, fontSize:12.5, color:T.textSecondary, lineHeight:1.6, animation:"fadeUp .2s ease both" }}>
                  {m.tip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Buscador con detective ── */}
      <div className="fade-up fade-up-2 card" onClick={() => setShowSearch(true)}
        style={{ padding:"16px", cursor:"pointer", marginBottom:18, display:"flex", alignItems:"center", gap:14, background:T.surface, border:`1.5px solid ${T.teal}40`, transition:"all .2s" }}
        onMouseEnter={e => e.currentTarget.style.background = T.tealLight}
        onMouseLeave={e => e.currentTarget.style.background = T.surface}
      >
        <img src={MASCOT.detective} alt="Buscar comida" style={{ width:52, height:52, borderRadius:14, objectFit:"cover", flexShrink:0, border:`1.5px solid ${T.border}` }} onError={e => { e.target.style.display="none"; }} />
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:14, color:T.textPrimary, marginBottom:2 }}>¿Comiste algo fuera del plan?</div>
          <div style={{ fontSize:12, color:T.textSecondary }}>NutrIA lo busca y estima sus macros por ti</div>
        </div>
        <Icon name="arrowRight" size={16} color={T.teal} />
      </div>

      {/* ── Sección condicional ── */}
      {isBuyMode ? (
        <div className="fade-up fade-up-3 card" style={{ background:T.tealMid, border:`1.5px solid ${T.teal}40` }}>
          <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14 }}>
            <Icon name="shield" size={17} color={T.teal} />
            <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>
              Reglas de Oro para Delivery
            </span>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { ico:"💧", title:"Cuidado con el sodio oculto",    body:"Los restaurantes usan más sal. Bebe un vaso extra de agua por cada comida pedida." },
              { ico:"🥫", title:"Salsas siempre aparte",          body:"Una salsa puede duplicar las calorías del plato. Pídela separada y usa solo la mitad." },
              { ico:"🔥", title:"Corte inteligente",              body:"Prioriza \"a la plancha\", \"al horno\" o \"a la parrilla\". Evita \"crocante\" o \"frito\"." },
            ].map((r, i) => (
              <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                <span style={{ fontSize:18 }}>{r.ico}</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13, color:T.textPrimary }}>{r.title}</div>
                  <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.4 }}>{r.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="fade-up fade-up-3 card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <Icon name="shoppingCart" size={17} color={T.teal} />
              <span style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>
                Lista de Compras Semanal
              </span>
            </div>
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:14, color:T.teal }}>S/ {total}</span>
          </div>
          <p style={{ fontSize:11.5, color:T.textMuted, marginBottom:14, lineHeight:1.5 }}>
            Cubre exactamente las comidas de tu plan. Compra el lunes para toda la semana.
          </p>
          {CATS.map(cat => {
            const items = SHOPPING.filter(s => s.cat === cat);
            if (!items.length) return null;
            return (
              <div key={cat} style={{ marginBottom:11 }}>
                <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace", marginBottom:6, letterSpacing:".5px" }}>
                  {cat.toUpperCase()}
                </div>
                {items.map((s, i) => (
                  <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${T.border}` }}>
                    <div>
                      <span style={{ fontSize:13.5, color:T.textPrimary }}>{s.item}</span>
                      <span style={{ fontSize:11.5, color:T.textMuted, marginLeft:8 }}>{s.qty}</span>
                    </div>
                    <span style={{ fontSize:12.5, color:T.textSecondary, fontFamily:"'IBM Plex Mono', monospace" }}>S/ {s.price}</span>
                  </div>
                ))}
              </div>
            );
          })}
          <div style={{ display:"flex", justifyContent:"space-between", paddingTop:11, borderTop:`1.5px solid ${T.border}` }}>
            <span style={{ fontWeight:600, color:T.textPrimary }}>Total semanal</span>
            <span style={{ fontFamily:"'IBM Plex Mono', monospace", fontWeight:500, color:T.teal, fontSize:15 }}>
              S/ {total} / S/ {state.userData?.budget || 150}
            </span>
          </div>
        </div>
      )}

      {showSearch && <FoodSearchModal onClose={() => setShowSearch(false)} />}
    </div>
  );
};

export default NutritionScreen;
