import { useState, useEffect } from "react";
import Icon from "../components/ui/Icon";
import T from "../tokens/T";
import MASCOT from "../constants/mascotImages";
import { API_BASE } from "../config/api";

const AdminNpsScreen = ({ onBack }) => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/nps`)
      .then(res => {
        if (!res.ok) throw new Error("No se pudieron cargar los reportes");
        return res.json();
      })
      .then(data => {
        setRatings(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Tu NutrIA 🦦 tuvo problemas de red al conectarse con el servidor de reportes.");
        setLoading(false);
      });
  }, []);

  // ── Cálculos de NPS en tiempo real ──────────────────────────────────────────
  const totalVotes = ratings.length;
  const averageRating = totalVotes > 0 
    ? (ratings.reduce((acc, curr) => acc + curr.rating, 0) / totalVotes).toFixed(1)
    : 0;

  // Contar distribución (de 1 a 5 estrellas)
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => {
    if (distribution[r.rating] !== undefined) {
      distribution[r.rating]++;
    }
  });

  const exportAsJSON = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ratings, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "reporte_nps_nutria.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      alert("Hubo un problema al exportar los reportes. 🦦");
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: T.bg, textAlign: "center" }}>
        <img src={MASCOT.detective} alt="NutrIA pensando" style={{ width: 80, height: 80, borderRadius: 20, animation: "float 2s ease-in-out infinite", marginBottom: 20 }} />
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, color: T.textPrimary }}>
          NutrIA está recopilando las opiniones...
        </h3>
        <p style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
          Consultando calificaciones y estrellas del servidor en tiempo real. 🦦
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: "18px 16px 100px", background: T.bg, minHeight: "100vh" }}>
      {/* Header */}
      <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 10, background: T.surface, border: `1.5px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: T.shadow }}>
          <Icon name="arrowLeft" size={17} color={T.textSecondary} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10.5, color: T.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>PANEL DE CONTROL</div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 19, color: T.textPrimary }}>Reportes NPS en Vivo</h2>
        </div>
      </div>

      {error ? (
        <div style={{ padding: "16px 18px", background: `${T.amber}12`, border: `1.5px solid ${T.border}`, borderRadius: 14, textAlign: "center" }}>
          <span style={{ fontSize: 32, display: "block", marginBottom: 8 }}>🦦🔍</span>
          <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>{error}</p>
          <button className="btn-primary" onClick={onBack} style={{ marginTop: 14, padding: "10px 20px", fontSize: 13 }}>
            Volver al Dashboard
          </button>
        </div>
      ) : (
        <>
          {/* Tarjeta de Resumen */}
          <div className="fade-up fade-up-1 card" style={{ padding: 20, marginBottom: 16, display: "flex", gap: 20, alignItems: "center" }}>
            <div style={{ textAlign: "center", flexShrink: 0, paddingRight: 16, borderRight: `1.5px solid ${T.border}` }}>
              <div style={{ fontSize: 44, fontWeight: 800, color: T.teal, fontFamily: "'IBM Plex Mono', monospace", lineHeight: 1 }}>
                {averageRating > 0 ? averageRating : "—"}
              </div>
              <div style={{ fontSize: 10.5, color: T.textMuted, fontWeight: 600, marginTop: 4 }}>PROMEDIO</div>
              <div style={{ fontSize: 11, color: T.teal, marginTop: 4 }}>
                {"⭐".repeat(Math.round(averageRating)) || "Sin votos"}
              </div>
            </div>
            
            <div style={{ flex: 1 }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: T.textPrimary, marginBottom: 4 }}>
                Calificación General
              </h4>
              <p style={{ fontSize: 12.5, color: T.textSecondary, lineHeight: 1.5, margin: 0 }}>
                {totalVotes > 0 
                  ? `Recopilamos ${totalVotes} opiniones de usuarios en total. ¡Sigue así! 🦦💚`
                  : "Aún no hay calificaciones de usuarios registradas en esta instalación."
                }
              </p>
            </div>
          </div>

          {/* Distribución de Calificaciones */}
          {totalVotes > 0 && (
            <div className="fade-up fade-up-2 card" style={{ marginBottom: 16, padding: 18 }}>
              <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: T.textPrimary, marginBottom: 14 }}>
                Distribución de Calificaciones
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = distribution[stars] || 0;
                  const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                  return (
                    <div key={stars} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 65, fontSize: 11.5, color: T.textSecondary, display: "flex", alignItems: "center", gap: 3 }}>
                        {stars} {stars === 5 ? "⭐" : "⭐"}
                      </span>
                      <div style={{ flex: 1, height: 8, background: T.border, borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: T.teal, borderRadius: 4, transition: "width .5s ease" }} />
                      </div>
                      <span style={{ width: 35, fontSize: 11.5, fontFamily: "'IBM Plex Mono', monospace", color: T.textMuted, textAlign: "right" }}>
                        {count} ({Math.round(pct)}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Listado de Calificaciones */}
          <div className="fade-up fade-up-3" style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: T.textPrimary }}>
                Opiniones Recientes ({ratings.length})
              </h3>
              {ratings.length > 0 && (
                <button onClick={exportAsJSON} style={{
                  background: "transparent", border: "none", color: T.teal,
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4
                }}>
                  📥 Descargar Reporte (JSON)
                </button>
              )}
            </div>

            {ratings.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 20px", background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14 }}>
                <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🦦💤</span>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600, fontSize: 14, color: T.textPrimary }}>
                  Sin calificaciones
                </div>
                <p style={{ fontSize: 12, color: T.textSecondary, marginTop: 4, margin: 0 }}>
                  Las opiniones que envíen los usuarios en su primer check-in aparecerán aquí al instante.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {ratings.map((r, i) => (
                  <div key={i} style={{ padding: 14, background: T.surface, border: `1.5px solid ${T.border}`, borderRadius: 14, display: "flex", gap: 12, alignItems: "flex-start", boxShadow: T.shadow }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${T.teal}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: `1px solid ${T.border}`, flexShrink: 0 }}>
                      🦦
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6, marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: T.textPrimary }}>{r.name || "Anónimo"}</span>
                        <span style={{ fontSize: 10, color: T.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}>{formatDateTime(r.timestamp)}</span>
                      </div>
                      
                      {r.email && (
                        <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8 }}>{r.email}</div>
                      )}
                      
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ display: "flex", gap: 2 }}>
                          {[1, 2, 3, 4, 5].map(num => (
                            <span key={num} style={{ fontSize: 12, opacity: num <= r.rating ? 1 : 0.2 }}>⭐</span>
                          ))}
                        </div>
                        <span style={{ fontSize: 11, color: T.textSecondary, fontWeight: 600 }}>
                          {r.rating === 5 ? "¡Excelente recomendación!" : r.rating === 4 ? "Muy bueno" : r.rating === 3 ? "Neutral" : "Por mejorar"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdminNpsScreen;
