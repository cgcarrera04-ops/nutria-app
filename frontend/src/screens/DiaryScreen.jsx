import { useState } from "react";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";
import { playPageFlip } from "../services/audioEngine";

const DiaryScreen = ({ onBack }) => {
  const { state } = useApp();
  const diary = state.diary || [];
  const [currentPage, setCurrentPage] = useState(0);
  const [animClass, setAnimClass] = useState("");

  const formatDate = (ms) => {
    try {
      const d = new Date(ms);
      return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  };

  const handleNext = () => {
    if (currentPage < diary.length - 1) {
      playPageFlip();
      setAnimClass("page-turn-next");
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setAnimClass("page-turn-prev-in");
        setTimeout(() => setAnimClass(""), 280);
      }, 280);
    }
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      playPageFlip();
      setAnimClass("page-turn-prev");
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setAnimClass("page-turn-next-in");
        setTimeout(() => setAnimClass(""), 280);
      }, 280);
    }
  };

  // Cuántas páginas quedan a cada lado para el grosor visual
  const leftStackCount = currentPage;
  const rightStackCount = diary.length > 0 ? (diary.length - 1 - currentPage) : 0;

  // Desplazamiento horizontal según la página activa y llenado (peso físico del libro)
  const bookOffset = diary.length > 1
    ? ((currentPage / (diary.length - 1)) - 0.5) * 14
    : 0;

  return (
    <>
      {/* Importar fuentes manuscritas premium y animaciones */}
      <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Kalam:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes pageTurnNext {
          0% { transform: rotateY(0deg) skewY(0deg); opacity: 1; }
          100% { transform: rotateY(-45deg) skewY(-4deg); transform-origin: left center; opacity: 0; }
        }
        @keyframes pageTurnPrevIn {
          0% { transform: rotateY(45deg) skewY(4deg); transform-origin: left center; opacity: 0; }
          100% { transform: rotateY(0deg) skewY(0deg); opacity: 1; }
        }
        @keyframes pageTurnPrev {
          0% { transform: rotateY(0deg) skewY(0deg); opacity: 1; }
          100% { transform: rotateY(45deg) skewY(4deg); transform-origin: left center; opacity: 0; }
        }
        @keyframes pageTurnNextIn {
          0% { transform: rotateY(-45deg) skewY(-4deg); transform-origin: left center; opacity: 0; }
          100% { transform: rotateY(0deg) skewY(0deg); opacity: 1; }
        }
        .page-turn-next { animation: pageTurnNext 0.28s ease-in both; }
        .page-turn-prev-in { animation: pageTurnPrevIn 0.28s ease-out both; }
        .page-turn-prev { animation: pageTurnPrev 0.28s ease-in both; }
        .page-turn-next-in { animation: pageTurnNextIn 0.28s ease-out both; }

        .page-shadow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: 16px;
          background: linear-gradient(to right, rgba(0,0,0,0.12) 0%, rgba(255,255,255,0.06) 50%, rgba(0,0,0,0.18) 100%);
          opacity: 0;
          z-index: 80;
          transition: opacity 0.28s ease;
        }
        .page-turn-next .page-shadow, .page-turn-prev .page-shadow {
          opacity: 1;
        }
      `}</style>

      <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 16px 110px", background:T.bg, minHeight:"100vh" }}>
        
        {/* Header */}
        <div className="fade-up" style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
          <button onClick={onBack} style={{ width:36, height:36, borderRadius:10, background:T.surface, border:`1.5px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:T.shadow }}>
            <Icon name="arrowLeft" size={17} color={T.textSecondary} />
          </button>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:10.5, color:T.textMuted, fontFamily:"'IBM Plex Mono', monospace" }}>DIARIO DE NutrIA</div>
            <h2 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:19, color:T.textPrimary }}>Libro de Anotaciones 📔</h2>
          </div>
          {diary.length > 0 && (
            <span className="tag" style={{ background:T.tealLight, color:T.teal, border:`1.5px solid ${T.teal}30`, fontFamily:"'IBM Plex Mono', monospace", fontWeight:700 }}>
              Pág. {currentPage + 1} de {diary.length}
            </span>
          )}
        </div>

        {/* ── Estructura de Libro Físico Rústico ── */}
        <div className="fade-up" style={{
          background: "linear-gradient(135deg, #7c4c34 0%, #4a291b 100%)", // Cubierta de cuero premium
          borderRadius: 24,
          padding: "16px 14px 16px 20px",
          boxShadow: "0 16px 44px rgba(0,0,0,0.35)",
          border: "4px solid #3c1f13",
          position: "relative",
          transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          transform: `translateX(${bookOffset}px)`,
          perspective: 1000
        }}>
          
          {/* ── ANILLOS DE FRICCIÓN / BINDING RINGS REALISTAS 3D ── */}
          <div style={{
            position: "absolute",
            left: 10,
            top: 24,
            bottom: 24,
            width: 32,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            zIndex: 100, // Por encima del cuero y del papel
            pointerEvents: "none"
          }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} style={{
                width: 32,
                height: 12,
                borderRadius: 6,
                // Degradado metálico cromado horizontal 3D
                background: "linear-gradient(to bottom, #eeeeee 0%, #b0bec5 40%, #37474f 75%, #cfd8dc 100%)",
                border: "1px solid #263238",
                boxShadow: "2px 3px 5px rgba(0,0,0,0.45)",
                transform: "translateX(-2px)"
              }} />
            ))}
          </div>

          {/* Página de papel vintage pergamino principal */}
          <div className={animClass} style={{
            background: "#fbf3e3", // Papel crema envejecido
            borderRadius: 16,
            minHeight: 460,
            padding: "24px 20px 30px 42px", // Margen izquierdo ancho por los anillos 3D
            position: "relative",
            boxShadow: "inset 3px 0 10px rgba(0,0,0,0.06), 3px 3px 12px rgba(0,0,0,0.15)",
            backgroundImage: "radial-gradient(#ebdcb9 1.2px, transparent 1.2px)",
            backgroundSize: "22px 22px",
            zIndex: 5
          }}>
            
            {/* Sombra de plegado tridimensional (Page flip ambient shading) */}
            <div className="page-shadow" />
            {/* ── Grosor de Hojas Apiladas Dinámicas ── */}
            {/* Derecha (Hojas por leer) */}
            {Array.from({ length: Math.min(4, rightStackCount) }).map((_, idx) => (
              <div key={`right-stack-${idx}`} style={{
                position: "absolute",
                top: 4 + idx * 2.5,
                bottom: 4 + idx * 2.5,
                right: -(idx * 3.5 + 4),
                width: "100%",
                background: "#fdf8eb",
                border: "1px solid #e5d5b0",
                borderRadius: 16,
                zIndex: -1 - idx,
                boxShadow: "2px 2px 6px rgba(0,0,0,0.07)",
                pointerEvents: "none"
              }} />
            ))}

            {/* Izquierda (Hojas ya leídas) */}
            {Array.from({ length: Math.min(4, leftStackCount) }).map((_, idx) => (
              <div key={`left-stack-${idx}`} style={{
                position: "absolute",
                top: 4 + idx * 2.5,
                bottom: 4 + idx * 2.5,
                left: -(idx * 3.5 + 4),
                width: "100%",
                background: "#fdf8eb",
                border: "1px solid #e5d5b0",
                borderRadius: 16,
                zIndex: -1 - idx,
                boxShadow: "-2px 2px 6px rgba(0,0,0,0.07)",
                pointerEvents: "none"
              }} />
            ))}

            {/* Línea de margen vertical roja clásica */}
            <div style={{
              position: "absolute",
              left: 34,
              top: 0,
              bottom: 0,
              width: 1.5,
              background: "rgba(229,115,115,0.55)",
              pointerEvents: "none"
            }} />

            {/* Contenido manuscrito */}
            <div style={{ position: "relative", zIndex: 10 }}>
              {diary.length === 0 ? (
                <div style={{ textAlign:"center", padding:"50px 10px 20px" }}>
                  <img 
                    src={MASCOT.emptyState.empty} 
                    alt="NutrIA pensando" 
                    onError={e => { e.target.style.display="none"; }}
                    style={{ width:84, height:84, borderRadius:20, objectFit:"cover", margin:"0 auto 16px", display:"block", boxShadow:`0 4px 16px rgba(43,188,185,0.18)`, animation:"float 4s ease-in-out infinite" }}
                  />
                  <h3 style={{ fontFamily:"'Kalam', cursive", fontWeight:700, fontSize:19, color:"#4e342e", marginBottom:8 }}>
                    ¡Tu libro está en blanco!
                  </h3>
                  <p style={{ fontFamily:"'Kalam', cursive", fontSize:15, color:"#5d4037", lineHeight:1.6, maxWidth:260, margin:"0 auto" }}>
                    Tan pronto como genere tu plan de alimentación, escribiré en estas páginas mis anotaciones con total empatía. 🌱
                  </p>
                </div>
              ) : (
                <div style={{ minHeight: 380, display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                  {/* Entrada activa de la página actual */}
                  <div>
                    {/* Fecha manuscrita */}
                    <div style={{ 
                      fontSize: 12.5, 
                      fontFamily: "'IBM Plex Mono', monospace", 
                      color: "#795548", 
                      marginBottom: 8, 
                      fontWeight: 700,
                      letterSpacing: 0.8
                    }}>
                      ✍️ {formatDate(diary[currentPage].date)}
                    </div>

                    {/* Título manuscrito */}
                    <h3 style={{ 
                      fontFamily: "'Kalam', cursive", 
                      fontWeight: 700, 
                      fontSize: 20, 
                      color: "#3e2723", 
                      marginBottom: 14,
                      lineHeight: 1.25,
                      borderBottom: "1px dashed rgba(93,64,55,0.15)",
                      paddingBottom: 6
                    }}>
                      {diary[currentPage].title}
                    </h3>

                    {/* Contenido manuscrito con inclinación real humana */}
                    <p style={{ 
                      fontFamily: "'Caveat', cursive", 
                      fontSize: 20, 
                      color: "#2e1c16", 
                      lineHeight: 1.5, 
                      whiteSpace: "pre-wrap",
                      margin: 0,
                      letterSpacing: "0.3px",
                      transform: "rotate(-0.5deg)"
                    }}>
                      {diary[currentPage].content}
                    </p>
                  </div>

                  {/* Sello de marca de agua de la mascota en el fondo del papel */}
                  <div style={{
                    position: "absolute",
                    right: 0,
                    bottom: 0,
                    opacity: 0.05,
                    pointerEvents: "none"
                  }}>
                    <img src={MASCOT.logo} alt="" style={{ width:100, height:100, filter:"grayscale(100%)" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Controles de navegación estilo Separador de Páginas ── */}
          {diary.length > 0 && (
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 18,
              position: "relative",
              zIndex: 30
            }}>
              <button 
                onClick={handlePrev}
                disabled={currentPage === 0 || animClass !== ""}
                style={{
                  padding: "8px 14px",
                  background: currentPage === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 12,
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: currentPage === 0 ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                  opacity: currentPage === 0 ? 0.3 : 1
                }}
              >
                <Icon name="arrowLeft" size={14} color="#fff" /> Anterior
              </button>

              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace" }}>
                Hoja {currentPage + 1} de {diary.length}
              </span>

              <button 
                onClick={handleNext}
                disabled={currentPage === diary.length - 1 || animClass !== ""}
                style={{
                  padding: "8px 14px",
                  background: currentPage === diary.length - 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.25)",
                  borderRadius: 12,
                  color: "#fff",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: currentPage === diary.length - 1 ? "default" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 0.2s",
                  opacity: currentPage === diary.length - 1 ? 0.3 : 1
                }}
              >
                Siguiente <Icon name="arrowRight" size={14} color="#fff" />
              </button>
            </div>
          )}

        </div>

        {/* Footer de lectura */}
        <div style={{ textAlign:"center", marginTop:28, color:T.textMuted, fontSize:11, fontFamily:"'IBM Plex Mono', monospace" }}>
          🦦 MANTENTE CONSTANTE Y ESCUCHA A TU CUERPO
        </div>
      </div>
    </>
  );
};

export default DiaryScreen;
