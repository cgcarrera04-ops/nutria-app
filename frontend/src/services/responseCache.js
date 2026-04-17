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

import responseBank from "../data/responseBank.json";

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
    cookMode    = "cook",
    budget      = 150,
    activity    = "moderate",
  } = userData;

  const budg = budgetRange(Number(budget) || 150);
  const act  = activityMap[activity] || activity || "moderate";
  const cook = cookMode === "mixed" ? "mixed" : cookMode === "buy" ? "buy" : "cook";

  return [goal, somatotype, cook, budg, act].join("_");
};

/**
 * Busca el plan más adecuado.
 * 1. Primero intenta match exacto de fingerprint.
 * 2. Si no hay, busca planes con mismo goal + somatotype (ignora presupuesto y actividad).
 * 3. Si no hay, busca planes con mismo goal solamente.
 * 4. Si no hay nada, devuelve el primer plan del banco como fallback genérico.
 *
 * @param {object} userData — estado userData del AppContext
 * @returns {object|null} — plan completo con toda la estructura del banco
 */
export const findCachedPlan = (userData) => {
  const fp = buildFingerprint(userData);
  const plans = responseBank.plans;

  // 1. Exacto
  let entry = plans.find(p => p.fingerprint === fp);

  // 2. Fuzzy: mismo goal + somatotype
  if (!entry) {
    const goal      = userData.goal || "maintain";
    const soma      = userData.somatotype || "athletic";
    entry = plans.find(p =>
      p.fingerprint.startsWith(`${goal}_${soma}_`)
    );
  }

  // 3. Fuzzy: mismo goal
  if (!entry) {
    const goal = userData.goal || "maintain";
    entry = plans.find(p => p.fingerprint.startsWith(`${goal}_`));
  }

  // 4. Fallback absoluto
  if (!entry) entry = plans[0];
  if (!entry) return null;

  // ── Adaptar cookMode="buy" → usar plan_b como items principales ───────────
  if (userData.cookMode === "buy") {
    const clone = JSON.parse(JSON.stringify(entry));
    clone.days = clone.days.map(day => ({
      ...day,
      meals: day.meals.map(meal => ({
        ...meal,
        items: meal.plan_b && meal.plan_b.length ? meal.plan_b : meal.items,
      })),
    }));
    return clone;
  }

  return entry; // devuelve el objeto completo del banco (con days, shopping, training)
};

/**
 * Lista todos los fingerprints disponibles (útil para debug)
 */
export const listAvailableFingerprints = () =>
  responseBank.plans.map(p => ({ fp: p.fingerprint, label: p.label }));
