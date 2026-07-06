import { useState, useRef } from "react";
import Icon from "./Icon";
import MASCOT from "../../constants/mascotImages";
import T from "../../tokens/T";
import foodBank from "../../data/foodBank.json";
import { useApp } from "../../context/AppContext";
import { compressImage } from "../../services/imageCompression";
import { API_BASE } from "../../config/api";

const FoodSearchModal = ({ onClose }) => {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState("text"); // 'text' | 'camera'
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const fileInputRef = useRef(null);
  
  // Nuevos estados interactivos para búsqueda inteligente
  const [isEstimating, setIsEstimating] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [estimateError, setEstimateError] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const results = query.trim().length > 1
    ? foodBank.filter(f => 
        f.name.toLowerCase().includes(query.toLowerCase()) || 
        f.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleCapture = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      const origSizeKb = (originalFile.size / 1024).toFixed(1);
      
      setIsScanning(true);
      setScanResults(null);
      
      try {
        // Comprimir de forma local en el navegador
        const compressedFile = await compressImage(originalFile, 1024, 0.75);
        const compSizeKb = (compressedFile.size / 1024).toFixed(1);
        const savingsPct = (((originalFile.size - compressedFile.size) / originalFile.size) * 100).toFixed(1);
        
        console.log(`[NutrIA] Compresión de imagen exitosa:`);
        console.log(`- Tamaño Original: ${origSizeKb} KB`);
        console.log(`- Tamaño Comprimido: ${compSizeKb} KB`);
        console.log(`- Ahorro de red: ${savingsPct}%`);
        
        // Simular llamada a Gemini Vision
        setTimeout(() => {
          setIsScanning(false);
          const suggested = foodBank.filter(f => f.calories < 500).slice(0, 3);
          setScanResults(suggested.length ? suggested : foodBank.slice(0, 3));
        }, 3500);
      } catch (err) {
        console.error("[NutrIA] Error al comprimir la foto:", err);
        // Fallback
        setTimeout(() => {
          setIsScanning(false);
          const suggested = foodBank.filter(f => f.calories < 500).slice(0, 3);
          setScanResults(suggested.length ? suggested : foodBank.slice(0, 3));
        }, 3500);
      }
    }
  };

  // ── Validación del input antes de llamar a la IA ────────────────────────────
  const isValidFoodQuery = (q) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) return { ok: false, msg: "Escribe al menos 2 caracteres. Ejemplo: \"arroz con pollo\"." };
    if (trimmed.length > 120) return { ok: false, msg: "El texto es demasiado largo. Sé más breve, por ejemplo: \"lomo saltado con arroz\"." };
    if (/^\d+$/.test(trimmed)) return { ok: false, msg: "Escribe el nombre de un alimento, no solo números. Ejemplo: \"2 huevos fritos\"." };
    if (/[<>{}\\|]/.test(trimmed)) return { ok: false, msg: "Evita caracteres especiales. Escribe algo como: \"ceviche mixto\"." };
    if (trimmed.split(/\s+/).length > 15) return { ok: false, msg: "Demasiadas palabras. Intenta algo más corto como: \"pollo a la brasa sin piel\"." };
    return { ok: true };
  };

  // ── Validar que la respuesta de IA sea coherente ──────────────────────────
  const isValidAIResponse = (data) => {
    if (!data || typeof data !== "object") return false;
    if (data.calories == null || data.calories < 0 || data.calories > 5000) return false;
    if (data.protein < 0 || data.fat < 0 || data.carbs < 0) return false;
    return true;
  };

  // Llama a la IA para estimar macros de forma dinámica
  const handleAskAI = () => {
    const validation = isValidFoodQuery(query);
    if (!validation.ok) {
      setEstimateError(validation.msg);
      return;
    }

    setIsEstimating(true);
    setEstimateError(null);
    setAiResult(null);

    fetch(`${API_BASE}/api/estimate-food`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ food_name: query.trim() })
    })
    .then(res => {
      if (!res.ok) throw new Error("Fallo al contactar a la IA");
      return res.json();
    })
    .then(data => {
      setIsEstimating(false);
      if (isValidAIResponse(data)) {
        setAiResult(data);
      } else {
        throw new Error("Respuesta incoherente de la IA");
      }
    })
    .catch(err => {
      console.error("[NutrIA] Error de IA:", err);
      setIsEstimating(false);
      setEstimateError("NutrIA 🦦 no pudo reconocer ese alimento. Intenta con algo como: \"arroz con pollo\", \"2 huevos fritos\" o \"ceviche mixto\".");
    });
  };

  // Confirma y guarda el alimento registrado en un hueco de comida
  const handleConfirmAssign = (slotName) => {
    if (!selectedFood) return;
    dispatch({
      type: "ADD_CUSTOM_MEAL",
      payload: {
        mealName: slotName,
        food: selectedFood
      }
    });
    dispatch({ type: "SAVE_PROFILE" });
    setSuccessMsg(`Registramos tu comida "${selectedFood.name}" en el espacio del ${slotName} de forma exitosa.`);
    setSelectedFood(null);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(13,41,41,0.6)", backdropFilter:"blur(4px)", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
      <div style={{ background:T.bg, borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", maxHeight:"85vh", overflowY:"auto", animation:"fadeUp .3s ease both" }}>
        
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <img src={MASCOT.detective} alt="NutrIA detective" style={{ width:44, height:44, borderRadius:12, objectFit:"cover" }} onError={e => { e.target.style.display="none"; }} />
            <div>
              <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:18, color:T.textPrimary }}>Asistente Nutricional</h3>
              <p style={{ fontSize:12, color:T.textMuted }}>{tab === 'text' ? 'Estima macros al instante' : 'Analiza el menú por ti'}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color: T.textPrimary }}>
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", background:T.surface, borderRadius:12, padding:4, marginBottom:20, border:`1px solid ${T.border}` }}>
          <div onClick={() => setTab("text")} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, fontSize:13.5, fontWeight:600, cursor:"pointer", transition:"all .2s", background: tab === "text" ? T.teal : "transparent", color: tab === "text" ? "#fff" : T.textSecondary }}>
            Buscador Texto
          </div>
          <div onClick={() => setTab("camera")} style={{ flex:1, textAlign:"center", padding:"10px 0", borderRadius:10, fontSize:13.5, fontWeight:600, cursor:"pointer", transition:"all .2s", background: tab === "camera" ? T.teal : "transparent", color: tab === "camera" ? "#fff" : T.textSecondary, display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
            <Icon name="camera" size={14} color={tab === "camera" ? "#fff" : T.textSecondary} /> Escanear Menú
          </div>
        </div>

        {tab === "text" ? (
          <>
            {/* Input */}
            <div style={{ position:"relative", marginBottom:16 }}>
              <Icon name="search" size={18} color={T.textMuted} style={{ position:"absolute", left:16, top:16 }} />
              <input
                autoFocus
                type="text"
                placeholder="Ej. Pollo a la brasa, cancha serrana, emoliente..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width:"100%", padding:"16px 16px 16px 44px", fontSize:15, fontFamily:"'Nunito Sans', sans-serif", background:T.surface, border:`2px solid ${query ? T.teal : T.border}`, borderRadius:14, color:T.textPrimary, boxShadow:T.shadow, transition:"all .2s" }}
              />
            </div>

            {/* Smart IA Search CTA card */}
            {query.trim().length >= 2 && (
              <div className="fade-up" style={{ padding:"14px", background:`${T.teal}08`, border:`1.5px solid ${T.teal}35`, borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                <div style={{ flex:1, paddingRight:12 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:T.teal, marginBottom:2 }}>¿No está en la lista estándar?</div>
                  <div style={{ fontSize:11, color:T.textSecondary, lineHeight:1.4 }}>NutrIA IA puede estimar los macros al instante usando Inteligencia Artificial.</div>
                </div>
                <button onClick={handleAskAI} className="btn-primary" disabled={isEstimating} style={{ padding:"8px 14px", fontSize:12, borderRadius:10, flexShrink:0 }}>
                  {isEstimating ? "Consultando..." : "Preguntar a NutrIA 🦦"}
                </button>
              </div>
            )}

            {/* Loading / mascot calculating state (Axioma 3) */}
            {isEstimating && (
              <div style={{ textAlign:"center", padding:"30px 0", animation:"fadeIn .3s ease", border:`1.5px solid ${T.teal}40`, borderRadius:14, background:T.surface, marginBottom:16 }}>
                <img src={MASCOT.logo} alt="NutrIA pensando" style={{ width:60, height:60, borderRadius:16, animation:"float 3s ease-in-out infinite", margin:"0 auto 12px", display:"block", border:`1px solid ${T.teal}40` }} />
                <h4 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:14.5, color:T.teal }}>La mascota NutrIA está estimando...</h4>
                <p style={{ fontSize:12, color:T.textSecondary, marginTop:4 }}>Calculando calorías y macros con lupa de nutricionista. 🦦🕵️</p>
              </div>
            )}

            {/* AI Estimation Result */}
            {aiResult && !isEstimating && (
              <div style={{ marginBottom:20, animation: "fadeIn .3s ease" }}>
                <p style={{ fontSize:10.5, color:T.teal, fontFamily:"'IBM Plex Mono', monospace", marginBottom:8, fontWeight:700 }}>ESTIMACIÓN ENCONTRADA POR NutrIA IA (Clic para registrar):</p>
                <div onClick={() => setSelectedFood(aiResult)} style={{ padding:"16px", background:`${T.teal}08`, border:`2px solid ${T.teal}`, borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:T.shadow, cursor:"pointer", transition:"all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.01)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "none"}
                >
                  <div style={{ flex:1, paddingRight:12 }}>
                    <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:15, color:T.textPrimary, marginBottom:3 }}>{aiResult.name}</div>
                    <p style={{ fontSize:12, color:T.textSecondary, fontStyle:"italic", marginBottom:8, lineHeight:1.4 }}>{aiResult.description}</p>
                    <div style={{ display:"flex", gap:10 }}>
                      <span style={{ fontSize:11.5, color:T.blue, fontWeight:700 }}>P: {aiResult.macros?.p}g</span>
                      <span style={{ fontSize:11.5, color:T.teal, fontWeight:700 }}>C: {aiResult.macros?.c}g</span>
                      <span style={{ fontSize:11.5, color:T.brown, fontWeight:700 }}>G: {aiResult.macros?.g}g</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:20, fontWeight:700, color:T.teal }}>{aiResult.calories}</div>
                    <div style={{ fontSize:10.5, color:T.textMuted }}>kcal</div>
                  </div>
                </div>
              </div>
            )}

            {estimateError && (
              <div style={{
                padding:"14px 16px", background:T.tealLight, border:`1.5px solid ${T.border}`,
                borderRadius:14, marginBottom:16, display:"flex", gap:12, alignItems:"flex-start"
              }}>
                <img src={MASCOT.detective} alt="NutrIA detective"
                  style={{ width:44, height:44, borderRadius:10, objectFit:"cover", flexShrink:0 }}
                  onError={e => { e.target.style.display="none"; }}
                />
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:13, color:T.textPrimary, marginBottom:4 }}>
                    ¡Ups! Algo no salió bien 🦦
                  </div>
                  <div style={{ fontSize:12, color:T.textSecondary, lineHeight:1.6, marginBottom:8 }}>
                    {estimateError}
                  </div>
                  <button onClick={() => { setEstimateError(null); }} style={{
                    padding:"6px 14px", borderRadius:8, border:`1.5px solid ${T.teal}`,
                    background:"transparent", color:T.teal, fontSize:11.5, fontWeight:600,
                    cursor:"pointer", transition:"all .2s",
                  }}>
                    🔄 Reintentar
                  </button>
                </div>
              </div>
            )}

            {/* Results */}
            {query.length > 1 && results.length === 0 && !aiResult && !isEstimating && (
              <div style={{ textAlign:"center", padding:"30px 0" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🦦🔍</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>No encontré ese plato de manera local</div>
                <div style={{ fontSize:13, color:T.textSecondary, marginTop:4 }}>¡Haz clic arriba en "Preguntar a NutrIA" para que la IA lo investigue al instante!</div>
              </div>
            )}

            {results.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <p style={{ fontSize:11, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>BIBLIOTECA ESTÁNDAR ({results.length}) · Haz clic para registrar:</p>
                {results.map(f => (
                  <div key={f.id} onClick={() => setSelectedFood(f)} style={{ padding:"14px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:T.shadow, cursor:"pointer", transition:"all .2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = T.teal}
                    onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
                  >
                    <div>
                      <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:14.5, color:T.textPrimary, marginBottom:3 }}>{f.name}</div>
                      <div style={{ display:"flex", gap:10 }}>
                        <span style={{ fontSize:11.5, color:T.blue }}>P: {f.macros.p}g</span>
                        <span style={{ fontSize:11.5, color:T.teal }}>C: {f.macros.c}g</span>
                        <span style={{ fontSize:11.5, color:T.brown }}>G: {f.macros.g}g</span>
                      </div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:18, fontWeight:600, color:T.teal }}>{f.calories}</div>
                      <div style={{ fontSize:10, color:T.textMuted }}>kcal</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {query.length <= 1 && (
              <div style={{ padding:"16px", background:T.tealLight, border:`1.5px solid ${T.teal}40`, borderRadius:14, display:"flex", gap:12 }}>
                <span style={{ fontSize:24 }}>🍲</span>
                <div>
                  <div style={{ fontWeight:600, fontSize:13.5, color:T.teal }}>Base de datos interactiva</div>
                  <div style={{ fontSize:12.5, color:T.textSecondary, lineHeight:1.5 }}>
                    Escribe un plato típico peruano, snack saludable o bebida. Si no lo encuentras, pídele a NutrIA que lo calcule con IA al instante. 🦦✨
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Tab Cámara */
          <div style={{ textAlign:"center", padding:"10px 0 20px" }}>
            <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleCapture} style={{ display:"none" }} />
            
            {!isScanning && !scanResults && (
              <>
                <img src={MASCOT.detective} alt="NutrIA analizando" style={{ width:80, height:80, borderRadius:20, objectFit:"cover", margin:"0 auto 20px", display:"block", border:`1.5px solid ${T.border}` }} onError={e => { e.target.style.display="none"; }} />
                <h4 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:16, color:T.textPrimary, marginBottom:8 }}>Escáner de Menús</h4>
                <p style={{ fontSize:13.5, color:T.textSecondary, marginBottom:24, maxWidth:260, margin:"0 auto 24px" }}>
                  Toma una foto al menú del restaurante y NutrIA resaltará las opciones que mejor encajan con tu objetivo ({state.userData.goal === "deficit" ? "comer menos calorías" : "maximizar nutrientes"}).
                </p>
                <button onClick={() => fileInputRef.current?.click()} style={{ background:T.teal, color:"#fff", border:"none", padding:"16px 24px", borderRadius:16, fontSize:15, fontWeight:700, width:"100%", boxShadow:T.shadowMd, cursor:"pointer", display:"flex", justifyContent:"center", alignItems:"center", gap:8 }}>
                  <Icon name="camera" size={18} color="#fff" /> Fotografiar el menú
                </button>
              </>
            )}

            {isScanning && (
              <div style={{ padding:"40px 0", animation:"fadeIn .3s ease" }}>
                <div style={{ position:"relative", width:100, height:100, margin:"0 auto 20px" }}>
                  <div style={{ position:"absolute", inset:0, border:`3px solid ${T.tealLight}`, borderRadius:20 }}></div>
                  <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:T.teal, boxShadow:`0 0 10px ${T.teal}`, animation:"scanLine 1.5s ease-in-out infinite alternate" }}></div>
                  <div style={{ fontSize:40, position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>🦦</div>
                </div>
                <h4 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>Leyendo el menú con lupa...</h4>
                <p style={{ fontSize:13, color:T.textMuted, marginTop:4 }}>Analizando ingredientes y preparación.</p>
                <style>{`@keyframes scanLine { from { top:0%; } to { top:100%; } }`}</style>
              </div>
            )}

            {scanResults && !isScanning && (
              <div style={{ animation:"fadeIn .4s ease" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginBottom:20 }}>
                  <span style={{ fontSize:24 }}>✨</span>
                  <h4 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:16, color:T.textPrimary }}>Opciones Recomendadas · Clic para registrar</h4>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
                  {scanResults.map(f => (
                    <div key={f.id} onClick={() => setSelectedFood(f)} style={{ padding:"14px", background:T.surface, border:`2px solid ${T.teal}40`, borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:T.shadow, cursor:"pointer" }}>
                      <div>
                        <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:14.5, color:T.textPrimary, marginBottom:3 }}>{f.name}</div>
                        <div style={{ display:"flex", gap:10 }}>
                          <span style={{ fontSize:11.5, color:T.blue }}>P: {f.macros.p}g</span>
                          <span style={{ fontSize:11.5, color:T.teal }}>C: {f.macros.c}g</span>
                          <span style={{ fontSize:11.5, color:T.brown }}>G: {f.macros.g}g</span>
                        </div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontFamily:"'IBM Plex Mono', monospace", fontSize:18, fontWeight:600, color:T.teal }}>{f.calories}</div>
                        <div style={{ fontSize:10, color:T.textMuted }}>kcal</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setScanResults(null)} style={{ width:"100%", marginTop:20, padding:12, borderRadius:12, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", color: T.textPrimary }}>Escanear otro menú</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Slot Selection overlay ── */}
      {selectedFood && (
        <div style={{ position:"fixed", inset:0, zIndex:2100, background:"rgba(13,41,41,0.7)", backdropFilter:"blur(5px)", display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
          <div className="fade-up" style={{ background:T.bg, borderRadius:"24px 24px 0 0", padding:"24px 20px 40px", animation:"slideUp .28s cubic-bezier(0.16, 1, 0.3, 1) both" }}>
            <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:17.5, color:T.textPrimary, marginBottom:4, display:"flex", alignItems:"center", gap:8 }}>
              <span>🍲</span> Asignar Alimento
            </h3>
            <p style={{ fontSize:13, color:T.textSecondary, marginBottom:18 }}>
              ¿En qué hueco deseas registrar <strong>{selectedFood.name}</strong> ({selectedFood.calories} kcal)?
            </p>
            
            <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>
              {[
                { name: "Desayuno", emoji: "☀️", label: "Desayuno" },
                { name: "Almuerzo", emoji: "🍱", label: "Almuerzo" },
                { name: "Cena", emoji: "🌙", label: "Cena" },
                { name: "Merienda", emoji: "🥜", label: "Merienda" },
                { name: "Extra", emoji: "⚡", label: "Extra" }
              ].map(slot => (
                <button
                  key={slot.name}
                  onClick={() => handleConfirmAssign(slot.name)}
                  style={{
                    padding:"14px 18px", background:T.surface, border:`1.5px solid ${T.border}`,
                    borderRadius:14, fontSize:14.5, fontWeight:600, color:T.textPrimary,
                    cursor:"pointer", display:"flex", alignItems:"center", gap:12, transition:"all .2s",
                    textAlign:"left"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = T.tealLight}
                  onMouseLeave={e => e.currentTarget.style.background = T.surface}
                >
                  <span style={{ fontSize:18 }}>{slot.emoji}</span>
                  <span style={{ flex:1 }}>{slot.label}</span>
                  <Icon name="chevronRight" size={14} color={T.textMuted} />
                </button>
              ))}
            </div>

            <button className="btn-ghost" onClick={() => setSelectedFood(null)} style={{ width:"100%", padding:"12px", border:`1px solid ${T.border}`, borderRadius:12, color: T.textPrimary }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Success confirmation dialog (Axioma 1) ── */}
      {successMsg && (
        <div style={{ position:"fixed", inset:0, zIndex:2200, background:"rgba(13,41,41,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
          <div className="card fade-up" style={{ padding:"24px 20px", textAlign:"center", maxWidth:320, background:T.bg, border:`2px solid ${T.teal}`, borderRadius:20 }}>
            <img src={MASCOT.logo} alt="NutrIA feliz" style={{ width:60, height:60, borderRadius:16, margin:"0 auto 14px", display:"block", border:`1px solid ${T.teal}40` }} />
            <h4 style={{ fontSize:16, fontWeight:700, color:T.teal, marginBottom:6 }}>¡Registro exitoso! 🦦✨</h4>
            <p style={{ fontSize:13, color:T.textSecondary, lineHeight:1.5, marginBottom:18 }}>{successMsg}</p>
            <button className="btn-primary" onClick={() => { setSuccessMsg(""); onClose(); }} style={{ width:"100%", padding:"10px", borderRadius:12 }}>
              Listo, gracias
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodSearchModal;
