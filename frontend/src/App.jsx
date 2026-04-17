import { HashRouter } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { globalStyles } from "./tokens/fonts";
import LoadingOverlay from "./components/overlays/LoadingOverlay";
import SplashPreloader from "./components/overlays/SplashPreloader";
import BottomNav from "./components/ui/BottomNav";
import NotificationController from "./components/overlays/NotificationController";
import { findCachedPlan } from "./services/responseCache";

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

const APP_SCREENS = new Set(["dashboard","nutrition","training","habits","analytics"]);

import { useEffect } from "react";
// ─── Inner app ────────────────────────────────────────────────────────────────
const AppInner = () => {
  const { state, dispatch } = useApp();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.userData.theme || "light");
  }, [state.userData.theme]);
  const { screen } = state;

  const nav = (s) => dispatch({ type:"SET_SCREEN", payload:s });

    const triggerGenerate = () => {
      dispatch({ type:"SET_GENERATING", payload:true });
  
      const cached = findCachedPlan(state.userData);
      if (cached) {
        setTimeout(() => {
          dispatch({ type:"SET_PLAN", payload:cached });
          dispatch({ type:"SAVE_PROFILE" }); // Guardar tras generar
        }, 800);
      } else {
        setTimeout(() => {
          dispatch({ type:"SET_PLAN", payload:{ stub:true, fromAI:true } });
          dispatch({ type:"SAVE_PROFILE" }); // Guardar tras generar
        }, 4200);
      }
    };

  const showNav = APP_SCREENS.has(screen);

  return (
    <>
      <style>{globalStyles}</style>

      {screen === "profiles"  && <ProfileManagerScreen profiles={state.profiles} onLoad={p => dispatch({ type:"LOAD_PROFILE", payload:p })} onDelete={id => dispatch({ type:"DELETE_PROFILE", payload:id })} onCreate={() => dispatch({ type:"RESET_ONBOARDING" })} />}
      {screen === "welcome"   && <WelcomeScreen   onNext={() => nav("onboard1")} onDemo={(p) => { dispatch({ type:"UPDATE_USER_DATA", payload:p }); triggerGenerate(); }} />}
      {screen === "onboard1"  && <OnboardGoal     onNext={() => nav("onboard2")} />}
      {screen === "onboard2"  && <OnboardBio      onNext={() => nav("onboard3")} onBack={() => nav("onboard1")} />}
      {screen === "onboard3"  && <OnboardContext  onNext={triggerGenerate}        onBack={() => nav("onboard2")} />}
      {screen === "dashboard" && <DashboardScreen onNav={nav} />}
      {screen === "nutrition" && <NutritionScreen onBack={() => nav("dashboard")} />}
      {screen === "training"  && <TrainingScreen  onBack={() => nav("dashboard")} />}
      {screen === "habits"    && <HabitsScreen    onBack={() => nav("dashboard")} />}
      {screen === "checkin"   && <CheckInScreen   onBack={() => nav("dashboard")} />}
      {screen === "analytics" && <AnalyticsScreen onBack={() => nav("dashboard")} />}

      {showNav && <BottomNav current={screen} onNav={nav} />}
      <NotificationController />
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
