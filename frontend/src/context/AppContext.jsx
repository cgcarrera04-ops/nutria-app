import { createContext, useContext, useReducer, useEffect } from "react";
import { appReducer, initialState } from "./AppReducer";

const init = (initial) => {
  try {
    const saved = localStorage.getItem("nutriaccion_profiles");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.length > 0) {
        return { ...initial, profiles: parsed, screen: "profiles" };
      }
    }
  } catch (e) {
    console.error("Error loading profiles:", e);
  }
  return initial;
};

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, init);

  useEffect(() => {
    localStorage.setItem("nutriaccion_profiles", JSON.stringify(state.profiles));
  }, [state.profiles]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp debe usarse dentro de <AppProvider>");
  return ctx;
};
