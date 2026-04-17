import { useState, useRef } from "react";
import Icon from "./Icon";
import MASCOT from "../../constants/mascotImages";
import T from "../../tokens/T";
import foodBank from "../../data/foodBank.json";
import { useApp } from "../../context/AppContext";

const FoodSearchModal = ({ onClose }) => {
  const { state } = useApp();
  const [tab, setTab] = useState("text"); // 'text' | 'camera'
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const fileInputRef = useRef(null);
  
  const results = query.trim().length > 1
    ? foodBank.filter(f => 
        f.name.toLowerCase().includes(query.toLowerCase()) || 
        f.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : [];

  const handleCapture = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIsScanning(true);
      setScanResults(null);
      // Simular llamada a Gemini Vision
      setTimeout(() => {
        setIsScanning(false);
        // Sugerir 3 platos saludables basados en el banco
        const suggested = foodBank.filter(f => f.calories < 500).slice(0, 3);
        setScanResults(suggested.length ? suggested : foodBank.slice(0,3));
      }, 3500);
    }
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
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
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
            <div style={{ position:"relative", marginBottom:24 }}>
              <Icon name="search" size={18} color={T.textMuted} style={{ position:"absolute", left:16, top:16 }} />
              <input
                autoFocus
                type="text"
                placeholder="Ej. Pollo a la brasa, lomo saltado..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width:"100%", padding:"16px 16px 16px 44px", fontSize:15, fontFamily:"'Nunito Sans', sans-serif", background:T.surface, border:`2px solid ${query ? T.teal : T.border}`, borderRadius:14, color:T.textPrimary, boxShadow:T.shadow, transition:"all .2s" }}
              />
            </div>

            {/* Results */}
            {query.length > 1 && results.length === 0 && (
              <div style={{ textAlign:"center", padding:"30px 0" }}>
                <div style={{ fontSize:40, marginBottom:10 }}>🦦🔍</div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:15, color:T.textPrimary }}>No encontré ese plato</div>
                <div style={{ fontSize:13, color:T.textSecondary, marginTop:4 }}>Intenta buscar con otras palabras o por ingredientes.</div>
              </div>
            )}

            {results.length > 0 && (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <p style={{ fontSize:11, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>RESULTADOS ({results.length})</p>
                {results.map(f => (
                  <div key={f.id} style={{ padding:"14px", background:T.surface, border:`1.5px solid ${T.border}`, borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:T.shadow }}>
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
                  <div style={{ fontWeight:600, fontSize:13.5, color:T.teal }}>Base de datos peruana</div>
                  <div style={{ fontSize:12.5, color:T.textSecondary, lineHeight:1.5 }}>
                    Escribe un plato típico peruano, un piqueo o un alimento suelto para ver sus macros y calorías estimadas.
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
                  <h4 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:16, color:T.textPrimary }}>Opciones Recomendadas</h4>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:10, textAlign:"left" }}>
                  {scanResults.map(f => (
                    <div key={f.id} style={{ padding:"14px", background:T.surface, border:`2px solid ${T.teal}40`, borderRadius:14, display:"flex", justifyContent:"space-between", alignItems:"center", boxShadow:T.shadow }}>
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
                <button onClick={() => setScanResults(null)} style={{ width:"100%", marginTop:20, padding:12, borderRadius:12, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer" }}>Escanear otro menú</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodSearchModal;
