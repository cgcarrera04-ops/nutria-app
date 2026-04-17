import { useState } from "react";
import Icon from "../components/ui/Icon";
import MASCOT from "../constants/mascotImages";
import { useApp } from "../context/AppContext";
import T from "../tokens/T";

const EMOJIS = ["🦦","🦊","🦁","🐼","🐯","🐷","🐸","🐙","🦖","🦈","🦸‍♂️","🦸‍♀️","🧙‍♂️","🥷","🕵️","🧑‍🚀","🧟","🤖","👻","👽"];

const ProfileManagerScreen = ({ profiles, onLoad, onDelete, onCreate }) => {
  const { dispatch } = useApp();
  const [editingId, setEditingId] = useState(null);

  const handleSetEmoji = (id, emoji) => {
    // Find profile, update it, save it
    const profile = profiles.find(p => p.id === id);
    if (!profile) return;
    
    // We need to load it, update the userData, and save it.
    // However, we are outside the active profile context, so it's safer to just trigger an action.
    dispatch({ type: "LOAD_PROFILE", payload: profile });
    dispatch({ type: "UPDATE_USER_DATA", payload: { avatarEmoji: emoji } });
    dispatch({ type: "SAVE_PROFILE" });
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
              
              {/* Botón borrar */}
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                style={{
                  position:"absolute", top:-8, right:-8, width:28, height:28, borderRadius:"50%", 
                  background:T.surface, border:`1px solid ${T.border}`, color:T.amber, display:"flex", 
                  alignItems:"center", justifyContent:"center", cursor:"pointer", boxShadow:T.shadow, zIndex:10
                }}
              >
                <Icon name="x" size={12} color={T.brown} />
              </button>
            </div>
          );
        })}

        {/* Añadir Perfil */}
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
                <div key={em} onClick={() => handleSetEmoji(editingId, em)} style={{ fontSize:32, textAlign:"center", cursor:"pointer", padding:8, background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, transition:"all .1s" }}>
                  {em}
                </div>
              ))}
            </div>
            <button onClick={() => setEditingId(null)} className="btn-ghost" style={{ width:"100%" }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileManagerScreen;
