/**
 * responseCache.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Genera un "fingerprint" del perfil del usuario y lo compara con el banco
 * de respuestas pre-calculadas (responseBank.json).
 *
 * Si existe una coincidencia exacta → devuelve el plan en <1ms.
 * Si no hay exacta → busca el plan más cercano (fuzzy match por prioridad).
 * Si no hay ninguno → devuelve null (app usa stub genérico).
 */

// Eliminamos la carga síncrona para implementar lazy loading
// import responseBank from "../data/responseBank.json";

// ─── Rangos de presupuesto ─────────────────────────────────────────────────
const budgetRange = (soles) => {
  if (soles <= 100) return "low";
  if (soles <= 200) return "medium";
  return "high";
};

// ─── Mapeo de actividad (onboarding → banco) ───────────────────────────────
// El banco usa: sedentary / light / moderate / very / high
// El onboarding guarda: sedentary / light / moderate / very
const activityMap = {
  sedentary: "sedentary",
  light:     "light",
  moderate:  "moderate",
  very:      "very",
};

/**
 * Genera la llave de perfil.
 * Formato: {goal}_{somatotype}_{cookMode}_{budgetRange}_{activity}
 * Ejemplo:  "deficit_athletic_cook_medium_moderate"
 */
export const buildFingerprint = (userData) => {
  const {
    goal        = "maintain",
    somatotype  = "athletic",
    dietType    = "balanced",
    cookMode    = "cook",
    budget      = 150,
    activity    = "moderate",
    sex         = "Masculino",
    exerciseTime = "45min",
    equipment   = "gym"
  } = userData;

  const diet = dietType || "balanced";
  const budg = budgetRange(Number(budget) || 150);
  const act  = activityMap[activity] || activity || "moderate";
  const cook = cookMode === "mixed" ? "mixed" : cookMode === "buy" ? "buy" : "cook";
  const exTime = exerciseTime || "45min";
  // Map outdoor to home para asegurar un match exacto si el banco no tiene outdoor
  const equip = equipment === "outdoor" ? "home" : (equipment || "gym");

  return [goal, somatotype, diet, cook, budg, act, sex, exTime, equip].join("_");
};

/**
 * Busca el plan más adecuado.
 * 1. Primero intenta match exacto de fingerprint.
 * 2. Si no hay, busca planes con mismo goal + somatotype (ignora presupuesto y actividad).
 * 3. Si no hay, busca planes con mismo goal solamente.
 * 4. Si no hay nada, devuelve el primer plan del banco como fallback genérico.
 *
 * @param {object} userData — estado userData del AppContext
 * @returns {Promise<object|null>} — plan completo con toda la estructura del banco
 */
export const findCachedPlan = async (userData) => {
  const fp = buildFingerprint(userData);
  
  // Lazy loading del banco de respuestas
  const responseBankModule = await import("../data/responseBank.json");
  const responseBank = responseBankModule.default || responseBankModule;
  const plans = responseBank.plans;

  // 1. Exacto
  let entry = plans.find(p => p.fingerprint === fp);

  // 2. Fuzzy: prioridad a mismo goal + somatotype + dietType + activity
  if (!entry) {
    const goal      = userData.goal || "maintain";
    const soma      = userData.somatotype || "athletic";
    const diet      = userData.dietType || "balanced";
    const act       = activityMap[userData.activity] || userData.activity || "moderate";
    
    // Priorizar match con la misma actividad para mantener coherencia de entrenamiento
    entry = plans.find(p => 
      p.fingerprint.startsWith(`${goal}_${soma}_${diet}_`) && p.fingerprint.includes(`_${act}_`)
    );
    
    // Si no hay, fallback ignorando actividad
    if (!entry) {
      entry = plans.find(p =>
        p.fingerprint.startsWith(`${goal}_${soma}_${diet}_`)
      );
    }
  }

  // 3. Fuzzy: mismo goal + dietType
  if (!entry) {
    const goal = userData.goal || "maintain";
    entry = plans.find(p => p.fingerprint.startsWith(`${goal}_`));
  }

  // 4. Fallback absoluto
  if (!entry) entry = plans[0];
  if (!entry) return null;

  // ── Hidratación Relacional (Desnormalización en Memoria) ──────────────────
  // Reconstruimos el objeto anidado usando las tablas del banco
  const hydratedPlan = {
    ...entry.plan,
    days: (entry.plan.days || []).map(d => ({
      ...d,
      meals: (d.meals || []).map(mId => typeof mId === 'string' ? responseBank.recipes[mId] : mId)
    })),
    training: typeof entry.plan.training === 'string' ? responseBank.workouts[entry.plan.training] : entry.plan.training,
    shopping: typeof entry.plan.shopping === 'string' ? responseBank.shopping[entry.plan.shopping] : entry.plan.shopping
  };

  const hydratedEntry = {
    ...entry,
    plan: hydratedPlan,
    // Para compatibilidad hacia atrás si la app espera days en la raíz
    days: hydratedPlan.days,
    shopping: hydratedPlan.shopping,
    training: hydratedPlan.training
  };

  // ── Helper: resuelve días con repeat_from para obtener sus meals reales ────
  const resolveDay = (day, allDays) => {
    if (day.repeat_from != null && (!day.meals || day.meals.length === 0)) {
      const source = allDays.find(d => d.day === day.repeat_from);
      return source ? { ...day, meals: source.meals } : day;
    }
    return day;
  };

  // Clonamos y resolvemos los días repetidos de forma global
  const clone = JSON.parse(JSON.stringify(hydratedEntry));
  
  if (clone.plan && clone.plan.days) {
    clone.plan.days = clone.plan.days.map(d => resolveDay(d, clone.plan.days));
    clone.days = clone.plan.days; // sync
  }

  // ── Adaptar cookMode="buy" → usar plan_b como items principales ───────────
  if (userData.cookMode === "buy" && clone.plan && clone.plan.days) {
    clone.plan.days = clone.plan.days.map(day => ({
      ...day,
      meals: (day.meals || []).map(meal => ({
        ...meal,
        items: meal.plan_b && meal.plan_b.length ? meal.plan_b : meal.items,
      })),
    }));
    clone.days = clone.plan.days;
  }

  // ── Filtro de Alérgenos ──────────────────────────────────────────────────
  if (userData.allergies && userData.allergies.length > 0 && clone.plan && clone.plan.days) {
    const allergies = userData.allergies.map(a => a.toLowerCase().trim());
    clone.plan.days = clone.plan.days.map(day => ({
      ...day,
      meals: (day.meals || []).map(meal => {
        const hasAllergy = (meal.items || []).some(item =>
          allergies.some(alg => item.toLowerCase().includes(alg))
        );
        return {
          ...meal,
          items: hasAllergy && meal.plan_b && meal.plan_b.length ? meal.plan_b : meal.items
        };
      }),
    }));
    clone.days = clone.plan.days;
  }

  // ── Adaptar mealCount ────────────────────────────────────────────────────
  const mealCount = Number(userData.mealCount) || 4;
  if (mealCount !== 4 && clone.plan && clone.plan.days) {
    clone.plan.days = clone.plan.days.map(day => {
      const meals = [...(day.meals || [])];
      
      if (mealCount === 2 && meals.length >= 4) {
        // 2 comidas: Fusionar Desayuno+Almuerzo, Snack+Cena
        const m1 = meals[0];
        const m2 = meals[1];
        const m3 = meals[2];
        const m4 = meals[3];
        
        m1.items = [...m1.items, ...m2.items];
        m1.plan_b = [...(m1.plan_b || []), ...(m2.plan_b || [])];
        m1.kcal += m2.kcal;
        m1.macros.p += m2.macros.p;
        m1.macros.c += m2.macros.c;
        m1.macros.g += m2.macros.g;
        
        m3.items = [...m3.items, ...m4.items];
        m3.plan_b = [...(m3.plan_b || []), ...(m4.plan_b || [])];
        m3.kcal += m4.kcal;
        m3.macros.p += m4.macros.p;
        m3.macros.c += m4.macros.c;
        m3.macros.g += m4.macros.g;
        
        day.meals = [m1, m3];
      } else if (mealCount === 3 && meals.length >= 4) {
        // 3 comidas: Fusionar el Snack en el Almuerzo
        const m1 = meals[0];
        const m2 = meals[1]; // Almuerzo
        const m3 = meals[2]; // Snack
        const m4 = meals[3]; // Cena
        
        m2.items = [...m2.items, ...m3.items];
        m2.plan_b = [...(m2.plan_b || []), ...(m3.plan_b || [])];
        m2.kcal += m3.kcal;
        m2.macros.p += m3.macros.p;
        m2.macros.c += m3.macros.c;
        m2.macros.g += m3.macros.g;
        
        day.meals = [m1, m2, m4];
      } else if (mealCount === 5 && meals.length >= 4) {
        // 5 comidas: Dividir Almuerzo en dos
        const m1 = meals[0];
        const m2 = meals[1]; // Almuerzo
        const m3 = meals[2]; // Snack
        const m4 = meals[3]; // Cena
        
        const m2a = JSON.parse(JSON.stringify(m2));
        const m2b = JSON.parse(JSON.stringify(m2));
        
        m2a.name = "Media Mañana";
        m2a.kcal = Math.round(m2a.kcal / 2);
        m2a.macros.p = Math.round(m2a.macros.p / 2);
        m2a.macros.c = Math.round(m2a.macros.c / 2);
        m2a.macros.g = Math.round(m2a.macros.g / 2);
        
        m2b.kcal = m2.kcal - m2a.kcal;
        m2b.macros.p = m2.macros.p - m2a.macros.p;
        m2b.macros.c = m2.macros.c - m2a.macros.c;
        m2b.macros.g = m2.macros.g - m2a.macros.g;
        
        day.meals = [m1, m2a, m2b, m3, m4];
      }
      
      return day;
    });
    clone.days = clone.plan.days;
  }

  // ── Adaptar por Check-in (Semanas 2+) ────────────────────────────────────
  if (userData.currentWeek > 1 && userData.lastCheckin) {
    const ci = userData.lastCheckin;
    // Multiplicador calórico base = 1.0
    let calMultiplier = 1.0;
    
    // Si hubo hambre nivel 4 o 5 o "yes", subimos 10%
    if (ci.hunger_level >= 4 || ci.hunger === "yes") {
       calMultiplier += 0.10;
    }
    // Si el peso subió y meta era deficit, bajamos 5%
    if (userData.goal === "deficit" && ci.weightDelta === "up") {
       calMultiplier -= 0.05;
    }
    
    if (calMultiplier !== 1.0 && clone.plan && clone.plan.days) {
      clone.plan.days = clone.plan.days.map(day => ({
         ...day,
         meals: (day.meals || []).map(meal => {
            const m = { ...meal };
            m.kcal = Math.round(m.kcal * calMultiplier);
            if (m.macros) {
              m.macros.p = Math.round(m.macros.p * calMultiplier);
              m.macros.c = Math.round(m.macros.c * calMultiplier);
              m.macros.g = Math.round(m.macros.g * calMultiplier);
            }
            // Escalar cantidades numéricas en los items
            m.items = (m.items || []).map(item => {
               // Busca números en el string y los multiplica, asumiendo que representan gramos o cantidades
               return item.replace(/\b\d+\b/g, (match) => {
                  return Math.round(Number(match) * calMultiplier);
               });
            });
            if (m.plan_b) {
               m.plan_b = m.plan_b.map(item => {
                  return item.replace(/\b\d+\b/g, (match) => {
                     return Math.round(Number(match) * calMultiplier);
                  });
               });
            }
            return m;
         })
      }));
      clone.plan.calories_daily = Math.round(clone.plan.calories_daily * calMultiplier);
      if (clone.plan.macros) {
          clone.plan.macros.protein_g = Math.round(clone.plan.macros.protein_g * calMultiplier);
          clone.plan.macros.carbs_g = Math.round(clone.plan.macros.carbs_g * calMultiplier);
          clone.plan.macros.fat_g = Math.round(clone.plan.macros.fat_g * calMultiplier);
      }
      clone.days = clone.plan.days;
    }
    
    // Rotar comidas según la semana para no repetir (Semana 2 = offset 1, Semana 3 = offset 2)
    const offset = userData.currentWeek - 1;
    if (offset > 0 && clone.plan && clone.plan.days) {
        // Hacemos que el día 1 sea el día 2, el día 2 sea el día 3, etc.
        const rotatedDays = [...clone.plan.days];
        for (let i = 0; i < offset; i++) {
            rotatedDays.push(rotatedDays.shift());
        }
        // Restauramos los números de día para que la UI no se rompa (Día 1 al 7)
        clone.plan.days = rotatedDays.map((d, index) => ({ ...d, day: index + 1 }));
        clone.days = clone.plan.days;
    }
  }

  return clone; // devuelve el objeto completo adaptado y resuelto
};

/**
 * Lista todos los fingerprints disponibles (útil para debug)
 */
export const listAvailableFingerprints = async () => {
  const responseBankModule = await import("../data/responseBank.json");
  const responseBank = responseBankModule.default || responseBankModule;
  return responseBank.plans.map(p => ({ fp: p.fingerprint, label: p.label }));
};
