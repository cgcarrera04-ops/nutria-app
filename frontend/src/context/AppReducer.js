export const initialState = {
  screen:           "welcome",
  isGeneratingPlan: false,
  planError:        null,

  profiles:         [],
  activeProfileId:  null,

  userData: {
    // Paso 1 — Objetivo
    goal:         "",         // "deficit" | "maintain" | "surplus"

    // Paso 2 — Biometría
    name:         "",
    weight:       "",
    height:       "",
    age:          "",
    sex:          "Masculino",
    somatotype:   "",         // "slim" | "athletic" | "robust"

    // Paso 3 — Contexto de vida
    cookMode:     "",         // "cook" | "buy" | "mixed"
    cookTime:     "",         // "15min" | "30min" | "60min" (solo si cookMode!="buy")
    exerciseTime: "",         // "20min" | "45min" | "60min" | "90min+"
    equipment:    "",         // "gym" | "home" | "outdoor"
    budget:       150,
    sleep:        7,
    stress:       3,
    activity:     "",         // "sedentary"|"light"|"moderate"|"very"
    allergies:    [],         // string[]
    injuries:     [],         // string[]
    pandoraText:  "",
  },

  plan:         null,
  currentWeek:  1,
  currentDay:   1,
  weekHistory:  [],
  lastCheckin:  null,

  // Water / hábitos del día
  todayHabits: {
    water:    0,
    steps:    0,
    sleepActual: 0,
  },
  mealsCompleted: [],
};

export const appReducer = (state, action) => {
  switch (action.type) {

    case "SET_SCREEN":
      return { ...state, screen: action.payload };

    case "UPDATE_USER_DATA":
      return { ...state, userData: { ...state.userData, ...action.payload } };

    case "ADD_TAG": {
      const field = action.field; // "allergies" | "injuries"
      const val   = action.payload.trim();
      if (!val) return state;
      if (state.userData[field].includes(val)) return state;
      return {
        ...state,
        userData: { ...state.userData, [field]: [...state.userData[field], val] },
      };
    }

    case "REMOVE_TAG": {
      const field = action.field;
      return {
        ...state,
        userData: {
          ...state.userData,
          [field]: state.userData[field].filter(t => t !== action.payload),
        },
      };
    }

    case "SET_GENERATING":
      return { ...state, isGeneratingPlan: action.payload, planError: null };

    case "SET_PLAN":
      return {
        ...state,
        plan:             action.payload,
        isGeneratingPlan: false,
        planError:        null,
        screen:           "dashboard",
      };

    case "SET_PLAN_ERROR":
      return { ...state, planError: action.payload, isGeneratingPlan: false };

    case "UPDATE_HABITS":
      return {
        ...state,
        todayHabits: { ...state.todayHabits, ...action.payload },
      };

    case "SAVE_CHECKIN":
      return {
        ...state,
        lastCheckin:  action.payload,
        weekHistory:  [...state.weekHistory, action.payload],
        currentWeek:  state.currentWeek + 1,
        currentDay:   1,
        todayHabits:  { water: 0, steps: 0, sleepActual: 0 },
        mealsCompleted: [],
      };

    case "LOAD_PROFILE":
      return {
        ...state,
        activeProfileId: action.payload.id,
        userData:        action.payload.userData,
        plan:            action.payload.plan || null,
        currentWeek:     action.payload.currentWeek || 1,
        currentDay:      action.payload.currentDay || 1,
        weekHistory:     action.payload.weekHistory || [],
        lastCheckin:     action.payload.lastCheckin || null,
        todayHabits:     action.payload.todayHabits || initialState.todayHabits,
        mealsCompleted:  action.payload.mealsCompleted || [],
        screen:          "dashboard",
      };

    case "SAVE_PROFILE": {
      const activeId = state.activeProfileId || Date.now().toString();
      const newProfile = {
        id: activeId,
        userData: state.userData,
        plan: state.plan,
        currentWeek: state.currentWeek,
        currentDay: state.currentDay,
        weekHistory: state.weekHistory,
        lastCheckin: state.lastCheckin,
        todayHabits: state.todayHabits,
        mealsCompleted: state.mealsCompleted || [],
      };
      
      const existingIndex = state.profiles.findIndex(p => p.id === activeId);
      const newProfiles = [...state.profiles];
      
      if (existingIndex >= 0) {
        newProfiles[existingIndex] = newProfile;
      } else {
        newProfiles.push(newProfile);
      }
      
      return { ...state, profiles: newProfiles, activeProfileId: activeId };
    }

    case "DELETE_PROFILE": {
      const newProfiles = state.profiles.filter(p => p.id !== action.payload);
      return { ...state, profiles: newProfiles };
    }

    case "RESET_ONBOARDING": {
      return {
        ...state,
        screen: "welcome",
        activeProfileId: null,
        userData: initialState.userData,
        plan: null,
        currentWeek: 1,
        currentDay: 1,
        weekHistory: [],
        lastCheckin: null,
        todayHabits: initialState.todayHabits,
        mealsCompleted: [],
      };
    }

    case "TOGGLE_MEAL": {
      const mealId = action.payload;
      const isCompleted = state.mealsCompleted.includes(mealId);
      const newMealsCompleted = isCompleted 
        ? state.mealsCompleted.filter(id => id !== mealId)
        : [...state.mealsCompleted, mealId];
      return { ...state, mealsCompleted: newMealsCompleted };
    }

    case "INIT_PROFILES":
      return { ...state, profiles: action.payload };

    default:
      return state;
  }
};
