export const initialState = {
  screen:           "welcome",
  isGeneratingPlan: false,
  planError:        null,

  profiles:         [],
  activeProfileId:  null,

  userData: {
    goal:         "",         // "deficit" | "maintain" | "surplus"
    name:         "",
    weight:       "",
    height:       "",
    age:          "",
    sex:          "Masculino",
    somatotype:   "",         // "slim" | "athletic" | "robust"
    cookMode:     "",         // "cook" | "buy" | "mixed"
    cookTime:     "",         // "15min" | "30min" | "60min"
    exerciseTime: "",         // "20min" | "45min" | "60min" | "90min+"
    equipment:    "",         // "gym" | "home" | "outdoor"
    budget:       150,
    sleep:        7,
    stress:       3,
    activity:     "",         // "sedentary"|"light"|"moderate"|"very"
    allergies:    [],         
    injuries:     [],         
    pandoraText:  "",
  },

  plan:         null,
  currentWeek:  1,
  currentDay:   1,
  planStartDate: null, // Guardado persistente del momento en que se genera el plan
  weekHistory:  [],
  lastCheckin:  null,
  diary:        [], // Diario empatico de NutrIA

  todayHabits: {
    water:    0,
    steps:    0,
    sleepActual: 0,
  },
  mealsCompleted: [],
};

const autoSaveProfile = (state) => {
  if (!state.activeProfileId) return state;
  const activeId = state.activeProfileId;
  const newProfile = {
    id: activeId,
    userData: state.userData,
    plan: state.plan,
    currentWeek: state.currentWeek,
    currentDay: state.currentDay,
    planStartDate: state.planStartDate,
    weekHistory: state.weekHistory,
    lastCheckin: state.lastCheckin,
    diary: state.diary || [],
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
  return { ...state, profiles: newProfiles };
};

export const appReducer = (state, action) => {
  switch (action.type) {

    case "SET_SCREEN":
      return { ...state, screen: action.payload };

    case "UPDATE_USER_DATA":
      return autoSaveProfile({ ...state, userData: { ...state.userData, ...action.payload } });

    case "ADD_TAG": {
      const field = action.field; 
      const val   = action.payload.trim();
      if (!val) return state;
      if (state.userData[field].includes(val)) return state;
      return autoSaveProfile({
        ...state,
        userData: { ...state.userData, [field]: [...state.userData[field], val] },
      });
    }

    case "REMOVE_TAG": {
      const field = action.field;
      return autoSaveProfile({
        ...state,
        userData: {
          ...state.userData,
          [field]: state.userData[field].filter(t => t !== action.payload),
        },
      });
    }

    case "SET_GENERATING":
      return { ...state, isGeneratingPlan: action.payload, planError: null };

    case "SET_PLAN": {
      // Seedeo automatico del primer diario de la mascota al generar plan
      let newDiary = state.diary || [];
      if (newDiary.length === 0) {
        const name = state.userData.name || "tú";
        
        // Calculo de biometria interactiva real para el diario del usuario
        const u = state.userData;
        const w = Number(u.weight) || 70;
        const h = Number(u.height) || 170;
        const a = Number(u.age) || 25;
        const isF = u.sex === "Female" || u.sex === "Femenino" || u.sex === "female";
        
        const bmrVal = Math.round(isF 
          ? (10 * w + 6.25 * h - 5 * a - 161)
          : (10 * w + 6.25 * h - 5 * a + 5)
        );
        
        let mult = 1.375;
        if (u.activity === "sedentary") mult = 1.2;
        else if (u.activity === "light") mult = 1.375;
        else if (u.activity === "moderate") mult = 1.55;
        else if (u.activity === "very") mult = 1.725;
        
        const tdeeVal = Math.round(bmrVal * mult);
        const waterG = Math.max(6, Math.min(10, Math.round((w * 35) / 250)));
        const presD = Math.round((Number(u.budget) || 150) / 7);
        const cookText = u.cookMode === "buy" ? "Práctica (comida ya lista)" : u.cookMode === "mixed" ? "Mixta (cocinas y compras)" : "Casera (100% cocinado en hogar)";

        if (name === "Carlos") {
          newDiary = [
            {
              date: Date.now() - 4 * 24 * 60 * 60 * 1000,
              title: "🌱 Alianza Saludable para Oficinista",
              content: "¡Hola, Carlos! He diseñado tu plan de recomposición. Al tener un somatotipo fuerte (Endomorfo) y trabajo sedentario, nuestro enfoque principal será maximizar el NEAT (pasos diarios a 10,500) y darte recetas de altísima saciedad en tus almuerzos de oficina para evitar antojos por la tarde. ¡Haremos que comer sano sea sumamente fácil! 🦦"
            },
            {
              date: Date.now() - 2 * 24 * 60 * 60 * 1000,
              title: "📊 Tu Biometría y Gasto Energético",
              content: "Carlos, he analizado tus variables y estimé tu Tasa Metabólica Basal (BMR) en unos 1,745 kcal/día y tu Gasto Energético Diario Total (TDEE) con actividad moderada en 2,398 kcal/día. Para lograr tu déficit saludable sin fatiga física, calibramos tu plan en 1,950 kcal. Tu meta hídrica óptima es de 10 vasos de agua diarios para procesar grasas con vitalidad. ¡Eres una maravillosa máquina biológica!"
            },
            {
              date: Date.now(),
              title: "🧠 Gestión del Estrés y Saciedad",
              content: "Carlos, he notado en tus datos que tu nivel de estrés en la oficina es alto. Para contrarrestar la hormona del cortisol (que retiene líquidos), incluí snacks estratégicos altos en magnesio y potasio (nueces, chocolate negro 85% y plátano). Tu cuerpo responderá de maravilla."
            }
          ];
        } else if (name === "Ana") {
          newDiary = [
            {
              date: Date.now() - 4 * 24 * 60 * 60 * 1000,
              title: "⚡ ¡Comienza el Superávit Muscular Limpio!",
              content: "¡Hola, Ana! Como mesomorfa y deportista innata, posees una excelente asimilación de nutrientes. Tu plan de volumen limpio está diseñado para potenciar tu fuerza y recuperación. Los macronutrientes están perfectamente distribuidos con un superávit de +250 kcal para que ganes masa libre de grasa. ¡A romper marcas! 🦦💪"
            },
            {
              date: Date.now() - 2 * 24 * 60 * 60 * 1000,
              title: "📊 Tu Biometría y Gasto Energético",
              content: "Ana, al contar con una contextura atlética de 60kg a tus 23 años, tu BMR estimado es de 1,385 kcal/día. Con tus entrenamientos de fuerza, tu TDEE se sitúa en 2,146 kcal/día, por lo que tu volumen libre de grasa operará en 2,400 kcal/día. Tu cuota proteica ideal es de 120g de proteína pura para reparar fibras. ¡A entrenar fuerte!"
            },
            {
              date: Date.now(),
              title: "🏋️ Sincronización del Rendimiento Anabólico",
              content: "Ana, coordiné tus platos con mayor cantidad de carbohidratos complejos en las 2 horas previas a tu entrenamiento de fuerza intensa. Esto asegurará reservas de glucógeno al tope para tus sentadillas pesadas. ¡Mantén esa excelente disciplina!"
            }
          ];
        } else if (name === "Luis") {
          newDiary = [
            {
              date: Date.now() - 4 * 24 * 60 * 60 * 1000,
              title: "🥪 Nutrición Pragmática Express",
              content: "¡Hola, Luis! Sé que tu agenda diaria es sumamente ajustada. Por ello, diseñé tu plan con comidas de bajo tiempo de preparación (menores a 15 min) e ingredientes que puedes encontrar listos o cocinar por lotes. El enfoque aquí es la consistencia con cero estrés. ¡Cada minuto cuenta! 🦦⚡"
            },
            {
              date: Date.now() - 2 * 24 * 60 * 60 * 1000,
              title: "📊 Tu Biometría y Gasto Energético",
              content: "Luis, tu BMR estimado es de 1,712 kcal/día y tu TDEE asciende a 2,354 kcal/día. Como ectomorfo natural, tu cuerpo consume calorías de forma acelerada. Tu alimentación de recomposición se calibra en 2,350 kcal balanceadas. Evita ayunos prolongados para resguardar tu musculatura limpia."
            },
            {
              date: Date.now(),
              title: "🔋 Energía Sostenible contra la Fatiga",
              content: "Luis, al dormir 5 horas promedio, tu cuerpo busca energía rápida. Agregué grasas saludables de digestión lenta (palta y semillas de chía) para darte saciedad duradera y mantener tu concentración a tope sin bajones de azúcar."
            }
          ];
        } else {
          const goalText = state.userData.goal === "deficit" ? "perder grasa con salud y energía" : state.userData.goal === "surplus" ? "construir masa muscular de forma limpia" : "mantener tu vitalidad y peso actual";
          const somText = state.userData.somatotype === "slim" ? "ectomorfo natural (de contextura delgada y metabolismo rápido)" : state.userData.somatotype === "robust" ? "endomorfo natural (de contextura fuerte y excelente retención de energía)" : state.userData.somatotype === "unknown" ? "cuerpo adaptativo (analizaremos tu somatotipo con tu evolución)" : "mesomorfo natural (atleta innato de gran recuperación)";
          
          newDiary = [
            {
              date: Date.now() - 2 * 24 * 60 * 60 * 1000,
              title: "🌱 ¡Nace nuestra alianza saludable!",
              content: "¡Hola, " + name + "! Hoy iniciamos este viaje juntos. He analizado con mucho detalle tus respuestas. Tu somatotipo es el de un " + somText + ", y tu meta principal es " + goalText + ". Diseñé tu plan semanal considerando cada ingrediente de tu lista de compras para que comer sano nunca sea un castigo ni un estrés. ¡Confía en mí, lo haremos paso a paso! 🦦💚"
            },
            {
              date: Date.now(),
              title: "📊 Tu Radiografía Biométrica y Gasto Calórico",
              content: "¡Aquí tienes algunos datos biológicos fascinantes de tu cuerpo que he calculado para nuestro plan:\n" +
                        "• 🧠 BMR (Tasa Metabólica Basal): " + bmrVal + " kcal/día (lo mínimo que gasta tu cuerpo solo por existir).\n" +
                        "• ⚡ TDEE (Gasto Energético Diario): " + tdeeVal + " kcal/día (con tu nivel de movimiento actual).\n" +
                        "• 💧 Hidratación Diaria Óptima: " + waterG + " vasos de 250ml al día (basados en tus " + w + "kg).\n" +
                        "• 💰 Presupuesto Diario de Alimentos: S/ " + presD + " soles diarios.\n" +
                        "• 🍳 Logística preferida: Alimentación " + cookText + ".\n" +
                        "¡Utilizaremos estos pilares para asegurar consistencia y cero fricción!"
            }
          ];
        }
      }

      // Al setear el plan por primera vez, creamos el id de perfil activo si no existe
      const activeId = state.activeProfileId || Date.now().toString();

      // Regla de la noche de NutrIA: si es tarde (>= 22:00 / 10 PM), el plan inicia oficialmente mañana a las 00:00
      let startDateMs = state.planStartDate;
      if (!startDateMs) {
        const now = new Date();
        const currentHour = now.getHours();
        if (currentHour >= 22) {
          const tomorrow = new Date();
          tomorrow.setDate(now.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          startDateMs = tomorrow.getTime();
        } else {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          startDateMs = today.getTime();
        }
      }

      return autoSaveProfile({
        ...state,
        activeProfileId:  activeId,
        plan:             action.payload,
        diary:            newDiary,
        planStartDate:    startDateMs,
        isGeneratingPlan: false,
        planError:        null,
        screen:           "dashboard",
      });
    }

    case "SET_PLAN_ERROR":
      return { ...state, planError: action.payload, isGeneratingPlan: false };

    case "UPDATE_HABITS":
      return autoSaveProfile({
        ...state,
        todayHabits: { ...state.todayHabits, ...action.payload },
      });

    case "SAVE_CHECKIN": {
      const latestCheckin = action.payload;
      const prevDiary = state.diary || [];
      const weightComment = latestCheckin.weightDelta === "down" ? "¡Logramos una variación de peso ideal hacia abajo!" : latestCheckin.weightDelta === "up" ? "Tu peso varió ligeramente hacia arriba, ¡pero recuerda que el músculo y la hidratación fluctúan!" : "Mantuvimos tu peso súper estable esta semana.";
      const energyComment = latestCheckin.fatigue === "yes" ? "Sentiste fatiga física alta, por lo que calibré tu plan de entrenamiento para recortar el volumen un 15% y darte más tiempo de recuperación activa." : "Tu nivel de energía fue excelente. ¡Mantengamos ese ritmo!";
      
      const checkinEntry = {
        date: Date.now(),
        title: "\uD83D\uDCC8 Calibraci\u00F3n para la Semana " + (state.currentWeek + 1),
        content: "Completamos la Semana " + state.currentWeek + ". " + weightComment + " " + energyComment + " He recalculado tu plan completo para la nueva semana para optimizar cada comida. \u00A1Vamos por m\u00E1s! \uD83D\uDC3F\u2728"
      };

      return autoSaveProfile({
        ...state,
        lastCheckin:  latestCheckin,
        weekHistory:  [...state.weekHistory, latestCheckin],
        diary:        [...prevDiary, checkinEntry],
        currentWeek:  state.currentWeek + 1,
        currentDay:   1,
        todayHabits:  { water: 0, steps: 0, sleepActual: 0 },
        mealsCompleted: [],
      });
    }

    case "LOAD_PROFILE": {
      const prof = action.payload;
      const hasPlan = prof.plan && !prof.plan.stub;
      return {
        ...state,
        activeProfileId: prof.id,
        userData:        prof.userData || initialState.userData,
        plan:            prof.plan || null,
        currentWeek:     prof.currentWeek || 1,
        currentDay:      prof.currentDay || 1,
        planStartDate:   prof.planStartDate || null,
        weekHistory:     prof.weekHistory || [],
        lastCheckin:     prof.lastCheckin || null,
        diary:           prof.diary || [],
        todayHabits:     prof.todayHabits || initialState.todayHabits,
        mealsCompleted:  prof.mealsCompleted || [],
        screen:          hasPlan ? "dashboard" : "welcome",
      };
    }

    case "SAVE_PROFILE": {
      return autoSaveProfile(state);
    }

    case "DELETE_PROFILE": {
      const newProfiles = state.profiles.filter(p => p.id !== action.payload);
      const isActiveDeleted = state.activeProfileId === action.payload;
      if (isActiveDeleted) {
        return {
          ...state,
          profiles: newProfiles,
          activeProfileId: null,
          userData: initialState.userData,
          plan: null,
          currentWeek: 1,
          currentDay: 1,
          planStartDate: null,
          weekHistory: [],
          lastCheckin: null,
          diary: [],
          todayHabits: initialState.todayHabits,
          mealsCompleted: [],
          screen: newProfiles.length > 0 ? "profiles" : "welcome",
        };
      }
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
        planStartDate: null,
        weekHistory: [],
        lastCheckin: null,
        diary: [],
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
      return autoSaveProfile({ ...state, mealsCompleted: newMealsCompleted });
    }

    case "ADD_CUSTOM_MEAL": {
      const { mealName, food } = action.payload;
      const dayIndex = state.currentDay;
      
      let updatedPlan = state.plan ? JSON.parse(JSON.stringify(state.plan)) : {
        calories_daily: 2000,
        days: [1, 2, 3, 4, 5, 6, 7].map(d => ({ day: d, meals: [] })),
        shopping: []
      };

      if (!updatedPlan.days) {
        updatedPlan.days = [1, 2, 3, 4, 5, 6, 7].map(d => ({ day: d, meals: [] }));
      }

      let dayObj = updatedPlan.days.find(d => d.day === dayIndex);
      if (!dayObj) {
        dayObj = { day: dayIndex, meals: [] };
        updatedPlan.days.push(dayObj);
      }

      if (!dayObj.meals) {
        dayObj.meals = [];
      }

      const newMeal = {
        name: mealName,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        kcal: Number(food.calories) || 0,
        items: [food.name],
        plan_b: [food.name],
        macros: {
          p: Number(food.macros?.p) || 0,
          c: Number(food.macros?.c) || 0,
          g: Number(food.macros?.g) || 0
        },
        tip: food.description || "Agregado por ti. ¡Excelente elección! 🦦"
      };

      dayObj.meals.push(newMeal);

      return autoSaveProfile({
        ...state,
        plan: updatedPlan
      });
    }

    case "INIT_PROFILES":
      return { ...state, profiles: action.payload };

    case "SYNC_DAILY_PROGRESS": {
      return autoSaveProfile({
        ...state,
        currentDay: action.payload.currentDay,
        todayHabits: action.payload.todayHabits,
        mealsCompleted: action.payload.mealsCompleted,
      });
    }

    default:
      return state;
  }
};
