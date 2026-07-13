import { useState } from "react";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";

// Emojis representados en Unicode Escapes para maxima compatibilidad de codificacion
const EMOJIS = [
  "\uD83E\uDDF6", 
  "\uD83E\uDD8A", 
  "\uD83E\uDD81", 
  "\uD83D\uDC3C", 
  "\uD83D\uDC2F", 
  "\uD83D\uDC37", 
  "\uD83D\uDC38", 
  "\uD83D\uDC19", 
  "\uD83E\uDD96", 
  "\uD83E\uDD88", 
  "\uD83E\uDD77", 
  "\uD83D\uDD75\uFE0F", 
  "\uD83E\uDD16", 
  "\uD83D\uDC7B", 
  "\uD83D\uDC7D"  
];

const ProfileManagerScreen = ({ profiles, onLoad, onDelete, onCreate }) => {
  const { dispatch } = useApp();
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleSetEmoji = (id, emoji) => {
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    const updatedProfile = { ...profile, userData: { ...profile.userData, avatarEmoji: emoji } };
    const newProfiles = profiles.map(p => p.id === id ? updatedProfile : p);
    dispatch({ type: "INIT_PROFILES", payload: newProfiles });
    setEditingId(null);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: T.bg, padding: "24px", position: "relative",
    }}>
      {/* Header */}
      <div className="fade-up" style={{ textAlign:"center", marginBottom:32, marginTop:40 }}>
        <h1 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:800, fontSize:28, color:T.textPrimary, letterSpacing:"-0.5px" }}>
          ¿Quién va a entrenar hoy?
        </h1>
        <p style={{ fontSize:14.5, color:T.textSecondary, marginTop:8 }}>
          Selecciona un perfil o crea uno nuevo.
        </p>
      </div>

      {/* Grid de Perfiles */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(140px, 1fr))", gap:16, maxWidth:600, margin:"0 auto", width:"100%" }}>
        
        {profiles.length === 0 && (
          <div className="fade-up" style={{
            gridColumn:"1 / -1",
            background:T.surface, border:`1.5px dashed ${T.teal}`, borderRadius:20, padding:"24px",
            textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12
          }}>
            <img src={MASCOT.logo} alt="NutrIA Anfitriona" style={{ width:80, height:80, borderRadius:16, objectFit:"cover", boxShadow:`0 4px 16px rgba(43,188,185,0.2)` }} onError={e => { e.target.style.display="none"; }} />
            <div>
              <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:16, color:T.textPrimary, marginBottom:4 }}>¡Hola, caminante! 👋</div>
              <div style={{ fontSize:13, color:T.textSecondary, maxWidth:280, margin:"0 auto", lineHeight:1.5 }}>Parece que tu espacio de entrenamiento está listo para un nuevo comienzo. ¡Crea tu primer perfil para que NutrIA diseñe tu plan semanal!</div>
            </div>
          </div>
        )}

        {profiles.map((p, i) => {
          const s = p.userData.somatotype || "athletic";
          const goal = p.userData.goal === "deficit" ? "Déficit" : p.userData.goal === "surplus" ? "Superávit" : "Mantener";
          
          return (
            <div key={p.id} className={`fade-up fade-up-${(i % 5) + 1}`} style={{ position:"relative" }}>
              <div 
                onClick={() => onLoad(p)}
                style={{
                  background:T.surface, border:`2px solid ${T.border}`, borderRadius:20, 
                  padding:"16px", textAlign:"center", cursor:"pointer", transition:"all .2s", 
                  boxShadow:T.shadow, height:"100%", display:"flex", flexDirection:"column", alignItems:"center"
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = T.teal}
                onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
              >
                <div style={{ position:"relative", marginBottom:12 }} onClick={(e) => { e.stopPropagation(); setEditingId(p.id); }}>
                  {p.userData.avatarEmoji ? (
                    <div style={{ width:72, height:72, borderRadius:16, background:T.tealLight, fontSize:40, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {p.userData.avatarEmoji}
                    </div>
                  ) : (
                    <img 
                      src={MASCOT.somatotype[s]} 
                      alt="Avatar" 
                      onError={e => { e.target.src = MASCOT.logo; }}
                      style={{ width:72, height:72, borderRadius:16, objectFit:"cover", background:T.card, padding:2 }}
                    />
                  )}
                  <div style={{ position:"absolute", bottom:-6, right:-6, width:24, height:24, background:T.surface, border:`1px solid ${T.border}`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:T.shadow }}>
                    <Icon name="zap" size={12} color={T.teal} />
                  </div>
                </div>
                <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:15, color:T.textPrimary, marginBottom:4, wordBreak:"break-word" }}>
                  {p.userData.name || "Usuario"}
                </div>
                <div style={{ fontSize:11.5, color:T.textMuted, background:T.bg, padding:"2px 8px", borderRadius:8 }}>
                  {goal}
                </div>
              </div>
              
              {/* Boton borrar */}
              <button 
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(p.id); }}
                style={{
                  position:"absolute", top:-8, right:-8, width:28, height:28, borderRadius:"50%", 
                  background:T.surface, border:`1px solid ${T.border}`, display:"flex", 
                  alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:T.shadow, zIndex:10
                }}
              >
                <Icon name="x" size={12} color={T.brown} />
              </button>
            </div>
          );
        })}

        {/* Anadir Perfil */}
        <div className="fade-up fade-up-5">
          <div 
            onClick={onCreate}
            style={{
              background:`${T.teal}10`, border:`2px dashed ${T.teal}50`, borderRadius:20, 
              padding:"16px", textAlign:"center", cursor:"pointer", transition:"all .2s", 
              height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
              minHeight:150
            }}
            onMouseEnter={e => e.currentTarget.style.background = `${T.teal}20`}
            onMouseLeave={e => e.currentTarget.style.background = `${T.teal}10`}
          >
            <div style={{ width:48, height:48, borderRadius:"50%", background:T.teal, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
              <Icon name="plus" size={20} color="#fff" />
            </div>
            <div style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:600, fontSize:14, color:T.teal }}>
              Nuevo Perfil
            </div>
          </div>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {editingId && (
        <div style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(13,41,41,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setEditingId(null)}>
          <div style={{ background:T.bg, borderRadius:24, padding:24, width:"100%", maxWidth:320, animation:"fadeUp .2s ease both" }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:18, color:T.textPrimary, marginBottom:16, textAlign:"center" }}>
              Elige tu Avatar
            </h3>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:10, marginBottom:20 }}>
              {EMOJIS.map(em => (
                <div key={em} onClick={() => handleSetEmoji(editingId, em)} style={{ fontSize:26, display:"flex", alignItems:"center", justifyContent:"center", width:44, height:44, cursor:"pointer", background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, transition:"all .1s" }} onMouseEnter={e => e.currentTarget.style.borderColor=T.teal} onMouseLeave={e => e.currentTarget.style.borderColor=T.border}>
                  {em}
                </div>
              ))}
            </div>
            <button onClick={() => setEditingId(null)} className="btn-ghost" style={{ width:"100%" }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Deletion Confirmation Modal */}
      {deleteConfirmId && (
        <div style={{ position:"fixed", inset:0, zIndex:3000, background:"rgba(13,41,41,0.6)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }} onClick={() => setDeleteConfirmId(null)}>
          <div style={{ background:T.bg, borderRadius:24, padding:24, width:"100%", maxWidth:320, textAlign:"center", boxShadow:T.shadow, animation:"fadeUp .2s ease both" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:44, marginBottom:16 }}>🧶💔</div>
            <h3 style={{ fontFamily:"'Plus Jakarta Sans', sans-serif", fontWeight:700, fontSize:18, color:T.textPrimary, marginBottom:8 }}>
              ¿Despedirse de NutrIA?
            </h3>
            <p style={{ fontSize:13.5, color:T.textSecondary, lineHeight:1.5, marginBottom:24 }}>
              Estás a punto de eliminar este perfil. Se perderá todo tu historial, metas y hábitos de forma permanente.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn-ghost" style={{ flex:1 }}>Cancelar</button>
              <button onClick={() => { onDelete(deleteConfirmId); setDeleteConfirmId(null); }} style={{ flex:1, background:T.amber, color:"#fff", border:"none", padding:"12px", borderRadius:12, fontWeight:700, cursor:"pointer", boxShadow:T.shadow }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagerScreen;
