import { useEffect, useState } from "react";
import { useApp } from "../../context/AppContext";
import { getMealsForUser } from "../../screens/NutritionScreen";
import MASCOT from "../../constants/mascotImages";
import T from "../../tokens/T";

const NotificationController = () => {
  const { state } = useApp();
  const [toast, setToast] = useState(null); // { title, body }

  useEffect(() => {
    // Only run if there is an active profile with a plan
    if (!state.userData.goal || state.screen === "welcome" || state.screen.startsWith("onboard") || state.isGeneratingPlan) return;

    const MEALS = getMealsForUser(state.userData, state.plan, state.currentDay);
    if (!MEALS || MEALS.length === 0) return;

    const checkMeals = () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();

      MEALS.forEach((meal, i) => {
        if (state.mealsCompleted?.includes(i)) return; // ya completó esta comida
        if (!meal.time) return;

        const [mH, mM] = meal.time.split(":").map(Number);
        
        // Calculamos la diferencia en minutos
        const diffMinutes = (mH * 60 + mM) - (currentH * 60 + currentM);
        
        // Si falta exactamente 15 minutos o acaba de pasar la hora (hasta 5 min después)
        // Usamos sessionStorage para no repetir la notificación
        const notifKey = `notif_${state.userData.id}_meal_${i}_${now.toDateString()}`;
        if (diffMinutes <= 15 && diffMinutes >= -30 && !sessionStorage.getItem(notifKey)) {
          sessionStorage.setItem(notifKey, "true");
          
          const msgs = [
            `Sé que estás ocupado, pero tu ${meal.name.toLowerCase()} te espera. ¡Solo te tomará un rato!`,
            `¡Hora de recargar energías! Tu ${meal.name.toLowerCase()} está programado para ahora.`,
            `NutrIA te recuerda: No te saltes tu ${meal.name.toLowerCase()}, tus macros te lo agradecerán.`
          ];
          const randomMsg = msgs[Math.floor(Math.random() * msgs.length)];
          
          setToast({
            title: `¡Es hora de tu ${meal.name}! 🍲`,
            body: randomMsg
          });

          // Intentar Push API si está soportado
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(`¡Es hora de tu ${meal.name}! 🍲`, {
              body: randomMsg,
              icon: "https://i.postimg.cc/FsNKHJ22/1776015778388.png"
            });
          }
        }
      });
    };

    // Pedir permiso para notificaciones web
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Chequear cada minuto
    checkMeals();
    const interval = setInterval(checkMeals, 60000);
    return () => clearInterval(interval);
  }, [state.userData, state.mealsCompleted, state.screen, state.isGeneratingPlan]);

  if (!toast) return null;

  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 9999, background: T.surface, border: `1.5px solid ${T.teal}`,
      borderRadius: 16, padding: "16px", boxShadow: T.shadowLg, width: "90%", maxWidth: 360,
      display: "flex", gap: 12, alignItems: "flex-start", animation: "slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
    }}>
      <img src={MASCOT.logo} alt="NutrIA" style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover" }} />
      <div style={{ flex: 1 }}>
        <h4 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14, color: T.textPrimary, margin: 0 }}>
          {toast.title}
        </h4>
        <p style={{ fontSize: 13, color: T.textSecondary, marginTop: 4, marginBottom: 0, lineHeight: 1.4 }}>
          {toast.body}
        </p>
      </div>
      <button 
        onClick={() => setToast(null)}
        style={{ background: "transparent", border: "none", fontSize: 18, color: T.textMuted, cursor: "pointer", padding: 4 }}
      >
        ×
      </button>
      <style>{`
        @keyframes slideDown {
          from { transform: translate(-50%, -100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default NotificationController;
