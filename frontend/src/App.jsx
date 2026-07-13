import { HashRouter } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { globalStyles } from "./tokens/fonts";
import LoadingOverlay from "./components/overlays/LoadingOverlay";
import SplashPreloader from "./components/overlays/SplashPreloader";
import BottomNav from "./components/ui/BottomNav";
import NotificationController from "./components/overlays/NotificationController";
import PWAInstallPrompt from "./components/overlays/PWAInstallPrompt";
import { findCachedPlan } from "./services/responseCache";
import { API_BASE } from "./config/api";

// Screens
import WelcomeScreen   from "./screens/WelcomeScreen";
import OnboardGoal     from "./screens/onboarding/OnboardGoal";
import OnboardBio      from "./screens/onboarding/OnboardBio";
import OnboardContext  from "./screens/onboarding/OnboardContext";
import DashboardScreen from "./screens/DashboardScreen";
import NutritionScreen from "./screens/NutritionScreen";
import TrainingScreen  from "./screens/TrainingScreen";
import HabitsScreen    from "./screens/HabitsScreen";
import CheckInScreen   from "./screens/CheckInScreen";
import AnalyticsScreen from "./screens/AnalyticsScreen";
import ProfileManagerScreen from "./screens/ProfileManagerScreen";
import DiaryScreen from "./screens/DiaryScreen";

import { useEffect } from "react";
import { playClick, startBgMusic } from "./services/audioEngine";

const APP_SCREENS = new Set(["dashboard","nutrition","training","habits","analytics","diary"]);

// ─── Inner app ────────────────────────────────────────────────────────────────
const AppInner = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.userData.theme || "light");
  }, [state.userData.theme]);

  // ── Sincronizador de Día y Progreso Diario (Axioma 3) ──
  useEffect(() => {
    if (!state.planStartDate) return;
    const diffTime = Date.now() - state.planStartDate;
    const daysPassed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const calculatedWeek = Math.floor(daysPassed / 7) + 1;
    const calculatedDay = (daysPassed % 7) + 1; // 1 a 7

    if (calculatedWeek === state.currentWeek) {
      if (calculatedDay !== state.currentDay) {
        dispatch({
          type: "SYNC_DAILY_PROGRESS",
          payload: {
            currentDay: calculatedDay,
            todayHabits: { water: 0, steps: 0, sleepActual: 0 },
            mealsCompleted: []
          }
        });
      }
    }
  }, [state.planStartDate, state.currentWeek, state.currentDay, dispatch]);

  // ── Interceptor Global de Sonidos de Clic Tactiles y Música ──
  useEffect(() => {
    let audioInitialized = false;

    const handleGlobalClick = (e) => {
      // Intentar iniciar la música de fondo en la primera interacción
      if (!audioInitialized) {
        const bgMusicActive = localStorage.getItem("nutria_bgmusic") !== "false";
        if (bgMusicActive) {
          startBgMusic();
        }
        audioInitialized = true;
      }

      const target = e.target;
      const interactive = target.closest("button, a, [role='button'], [style*='cursor: pointer'], [style*='cursor:pointer'], input[type='range'], input[type='checkbox'], input[type='radio'], select");
      if (interactive) {
        const sfxActive = localStorage.getItem("nutria_sfx") !== "false";
        if (sfxActive) {
          playClick();
        }
      }
    };
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("touchstart", handleGlobalClick, { passive: true });
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("touchstart", handleGlobalClick);
    };
  }, []);

  const { screen } = state;

  const handleGoogleLogin = (googleUser) => {
    const existing = state.profiles.find(p => p.userData?.googleUid === googleUser.uid || p.userData?.email === googleUser.email);
    if (existing) {
      dispatch({ type: "LOAD_PROFILE", payload: existing });
    } else {
      dispatch({
        type: "UPDATE_USER_DATA",
        payload: {
          name: googleUser.displayName ? googleUser.displayName.split(" ")[0] : "Usuario",
          email: googleUser.email,
          photoURL: googleUser.photoURL,
          googleUid: googleUser.uid,
        }
      });
      nav("onboard1");
    }
  };

  const nav = (s) => dispatch({ type:"SET_SCREEN", payload:s });

  const applyLocalAdjustments = (plan, checkin) => {
    if (!checkin) return plan;
    try {
      const clone = JSON.parse(JSON.stringify(plan));
      if (checkin.hunger === "yes") {
        clone.calories_daily = (clone.calories_daily || 2000) + 150;
      }
      if (checkin.fatigue === "yes" && clone.training && clone.training.days) {
        clone.training.days = clone.training.days.map(d => ({
          ...d,
          exercises: (d.exercises || []).map(e => ({
            ...e,
            sets: Math.max(1, (e.sets || 3) - 1)
          }))
        }));
      }
      return clone;
    } catch (e) {
      return plan;
    }
  };

  const triggerGenerate = (targetWeek = state.currentWeek, lastCheckin = state.lastCheckin) => {
    dispatch({ type: "SET_GENERATING", payload: true });

    // Protegemos el flujo ante eventos accidentales del DOM para que la mascota trabaje contenta
    const cleanWeek = (typeof targetWeek === "number") ? targetWeek : state.currentWeek;
    const cleanCheckin = (lastCheckin && typeof lastCheckin === "object" && !lastCheckin.preventDefault) ? lastCheckin : state.lastCheckin;

    const payload = {
      userData: state.userData,
      currentWeek: cleanWeek,
      lastCheckin: cleanCheckin,
      basePlan: cleanWeek > 1 ? state.plan : null
    };

    fetch(`${API_BASE}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error("Fallo al contactar al servidor local de NutrIA");
      return res.json();
    })
    .then(data => {
      if (data.plan) {
        dispatch({ type: "SET_PLAN", payload: data.plan });
        dispatch({ type: "SAVE_PROFILE" });
      } else {
        throw new Error("El servidor devolvió un formato de plan inválido");
      }
    })
    .catch(async err => {
      console.warn("[NutrIA] Servidor local no disponible. Cargando plan offline con ajustes:", err);
      // Fallback local robusto
      try {
        const cached = await findCachedPlan(state.userData);
        if (cached) {
          const adjusted = cleanWeek > 1 ? applyLocalAdjustments(cached, cleanCheckin) : cached;
          dispatch({ type: "SET_PLAN", payload: adjusted });
          dispatch({ type: "SAVE_PROFILE" });
        } else {
          dispatch({ type: "SET_PLAN", payload: { stub: true, fromAI: true } });
          dispatch({ type: "SAVE_PROFILE" });
        }
      } catch (fallbackErr) {
        console.error("[NutrIA] Error fatal en fallback local:", fallbackErr);
        dispatch({
          type: "SET_PLAN_ERROR",
          payload: "Hubo un pequeño tropiezo preparando tu plan offline. ¡Volvamos a intentarlo!",
        });
      }
    });
  };

  useEffect(() => {
    window.__nutriaTriggerGenerate = (targetWeek, lastCheckin) => {
      triggerGenerate(targetWeek, lastCheckin);
    };
    // Contador en tiempo real de sesiones de inicio
    try {
      const currentSessions = Number(localStorage.getItem("nutria_session_count") || 0);
      localStorage.setItem("nutria_session_count", currentSessions + 1);
    } catch (e) {}
    return () => {
      delete window.__nutriaTriggerGenerate;
    };
  }, [state.userData, state.plan, state.currentWeek, state.lastCheckin]);

  const showNav = APP_SCREENS.has(screen);

  return (
    <>
      <style>{globalStyles}</style>

      {screen === "profiles"  && <ProfileManagerScreen profiles={state.profiles} onLoad={p => dispatch({ type:"LOAD_PROFILE", payload:p })} onDelete={id => dispatch({ type:"DELETE_PROFILE", payload:id })} onCreate={() => dispatch({ type:"RESET_ONBOARDING" })} />}
      {screen === "welcome"   && <WelcomeScreen   onNext={() => nav("onboard1")} onDemo={(p) => { dispatch({ type:"UPDATE_USER_DATA", payload:p }); triggerGenerate(); }} onGoogleLogin={handleGoogleLogin} />}
      {screen === "onboard1"  && <OnboardGoal     onNext={() => nav("onboard2")} />}
      {screen === "onboard2"  && <OnboardBio      onNext={() => nav("onboard3")} onBack={() => nav("onboard1")} />}
      {screen === "onboard3"  && <OnboardContext  onNext={() => triggerGenerate()}        onBack={() => nav("onboard2")} />}
      {screen === "dashboard" && <DashboardScreen onNav={nav} />}
      {screen === "nutrition" && <NutritionScreen onBack={() => nav("dashboard")} />}
      {screen === "training"  && <TrainingScreen  onBack={() => nav("dashboard")} />}
      {screen === "habits"    && <HabitsScreen    onBack={() => nav("dashboard")} />}
      {screen === "checkin"   && <CheckInScreen   onBack={() => nav("dashboard")} />}
      {screen === "analytics" && <AnalyticsScreen onBack={() => nav("dashboard")} />}
      {screen === "diary"     && <DiaryScreen     onBack={() => nav("dashboard")} />}

      {showNav && <BottomNav current={screen} onNav={nav} />}
      <NotificationController />
      <PWAInstallPrompt />
      <LoadingOverlay />
    </>
  );
};

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <SplashPreloader>
          <AppInner />
        </SplashPreloader>
      </AppProvider>
    </HashRouter>
  );
}
