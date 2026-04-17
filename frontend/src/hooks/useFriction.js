import { useMemo } from "react";
import { useApp } from "../context/AppContext";

// ─── Normalizers ─────────────────────────────────────────────────────────────
const norm = (val, min, max) => Math.min(Math.max((val - min) / (max - min), 0), 1);

/**
 * FrictionScore — 0 (óptimo) a 100 (máxima fricción)
 *
 * Pesos del Manual v2.0:
 *   Estrés       30%
 *   Sueño        25%
 *   Presupuesto  20%
 *   Actividad    15%
 *   Lesiones     10%
 */
export const calcFrictionScore = (userData) => {
  const stress   = userData.stress || 3;
  const sleep    = userData.sleep  || 7;
  const budget   = userData.budget || 150;
  const activity = userData.activity || "moderate";
  const injuries = userData.injuries || [];

  // Estrés: 1=0 fricción, 5=1 fricción
  const fStress = norm(stress, 1, 5);

  // Sueño: 10h=0 fricción, 4h=1 fricción
  const fSleep = 1 - norm(sleep, 4, 10);

  // Presupuesto: S/500=0 fricción, S/30=1 fricción
  const fBudget = 1 - norm(budget, 30, 500);

  // Actividad: muy activo = menos fricción (cuerpo adaptado)
  const actMap = { sedentary: 0.8, light: 0.5, moderate: 0.3, very: 0.1 };
  const fActivity = actMap[activity] ?? 0.3;

  // Lesiones: cada lesión suma fricción, máx 1
  const fInjuries = Math.min(injuries.length * 0.25, 1);

  const raw = (
    fStress   * 0.30 +
    fSleep    * 0.25 +
    fBudget   * 0.20 +
    fActivity * 0.15 +
    fInjuries * 0.10
  );

  return Math.round(raw * 100);
};

/**
 * Retorna el nivel textual y color del score
 */
export const getFrictionLevel = (score) => {
  if (score < 35) return { label: "Bajo",     desc: "Condiciones óptimas. Tu plan trabaja al máximo.",   color: "#2BBCB9" };
  if (score < 65) return { label: "Moderado", desc: "Condiciones normales. Mantén tu ritmo.",             color: "#3D85B0" };
  return             { label: "Alto",     desc: "NutrIA detectó alta fricción y suavizó tu plan.",    color: "#C07828" };
};

/**
 * Hook: useFriction()
 * Retorna { score, level, breakdown }
 */
const useFriction = () => {
  const { state } = useApp();
  const { userData } = state;

  return useMemo(() => {
    const score = calcFrictionScore(userData);
    const level = getFrictionLevel(score);

    const breakdown = [
      {
        label:   "Estrés",
        emoji:   "🧠",
        weight:  "30%",
        value:   Math.round(norm(userData.stress || 3, 1, 5) * 100),
        color:   "#C07828",
      },
      {
        label:   "Sueño",
        emoji:   "🌙",
        weight:  "25%",
        value:   Math.round((1 - norm(userData.sleep || 7, 4, 10)) * 100),
        color:   "#7A5540",
      },
      {
        label:   "Presupuesto",
        emoji:   "💰",
        weight:  "20%",
        value:   Math.round((1 - norm(userData.budget || 150, 30, 500)) * 100),
        color:   "#3D85B0",
      },
      {
        label:   "Actividad",
        emoji:   "⚡",
        weight:  "15%",
        value:   Math.round(({ sedentary: 80, light: 50, moderate: 30, very: 10 }[userData.activity] || 30)),
        color:   "#2BBCB9",
      },
      {
        label:   "Lesiones",
        emoji:   "🦴",
        weight:  "10%",
        value:   Math.min((userData.injuries || []).length * 25, 100),
        color:   "#C07828",
      },
    ];

    return { score, level, breakdown };
  }, [userData]);
};

export default useFriction;
