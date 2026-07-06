import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { calcFrictionScore } from "../hooks/useFriction";
import T from "../tokens/T";

// ─── Mapa de mensajes por estado del sistema ──────────────────────────────────
const MESSAGE_MAP = {
  PLAN_GENERATING: {
    emoji: "⚙️",
    color: T.teal,
    bg: T.tealLight,
    messages: ["Construyendo tu plan óptimo…", "La IA está procesando tu contexto de vida…"],
  },
  PLAN_ERROR: {
    emoji: "⚠️",
    color: T.amber,
    bg: T.amberLight,
    messages: ["Hubo un problema al generar el plan. Reintentando…"],
  },
  WEEK_COMPLETE: {
    emoji: "🎉",
    color: T.teal,
    bg: T.tealLight,
    messages: [
      "¡Completaste la semana! Es momento del check-in.",
      "7 días de constancia. Ahora ajustamos el plan para la siguiente semana.",
    ],
  },
  HIGH_FRICTION: {
    emoji: "🧘",
    color: T.brown,
    bg: T.brownLight,
    messages: [
      "NutrIA detectó alta fricción en tu semana. El plan se suavizó por ti.",
      "Condiciones difíciles detectadas. Tu plan se adaptó para ser más sostenible.",
    ],
  },
  NO_SLEEP: {
    emoji: "🌙",
    color: T.brown,
    bg: T.brownLight,
    messages: [
      "Dormiste poco. Hoy priorizamos recuperación sobre rendimiento.",
      "El sueño es parte del plan. Hoy el objetivo es descansar bien.",
    ],
  },
  HIGH_STRESS: {
    emoji: "💆",
    color: T.blue,
    bg: T.blueLight,
    messages: [
      "Semana exigente. Tu cuerpo necesita más cuidado ahora.",
      "El estrés es una variable real. Tu plan lo tiene en cuenta.",
    ],
  },
  OPTIMAL: {
    emoji: "✨",
    color: T.teal,
    bg: T.tealLight,
    messages: [
      "Tus condiciones son óptimas hoy. Tu plan trabaja al máximo.",
      "Nivel de fricción bajo. Aprovecha el momentum de hoy.",
      "Todo alineado. Es un buen día para dar el extra.",
    ],
  },
  MODERATE: {
    emoji: "⚖️",
    color: T.blue,
    bg: T.blueLight,
    messages: [
      "Buen equilibrio. Mantén tu ritmo de hoy.",
      "Condiciones normales. Consistencia es la clave.",
    ],
  },
  DEFAULT: {
    emoji: "🦦",
    color: T.teal,
    bg: T.tealLight,
    messages: [
      "Cada pequeño paso cuenta. Sigue adelante.",
      "La constancia supera a la perfección. Un día a la vez.",
      "NutrIA está contigo en cada semana.",
    ],
  },
};

// ─── Hook para calcular el estado activo ──────────────────────────────────────
const useSystemState = () => {
  const { state } = useApp();
  const { userData, isGeneratingPlan, planError, currentDay } = state;

  return useMemo(() => {
    if (isGeneratingPlan)            return "PLAN_GENERATING";
    if (planError)                   return "PLAN_ERROR";
    if (currentDay === 7)            return "WEEK_COMPLETE";
    if ((userData.sleep || 7) < 5)  return "NO_SLEEP";
    if ((userData.stress || 3) >= 4) return "HIGH_STRESS";

    // Usa el mismo calcFrictionScore canónico del hook useFriction para evitar divergencia
    const score = calcFrictionScore(userData);

    if (score > 65) return "HIGH_FRICTION";
    if (score < 35) return "OPTIMAL";
    return "MODERATE";
  }, [userData, isGeneratingPlan, planError, currentDay]);
};

// ─── Componente EmpatheticFooter ──────────────────────────────────────────────
const EmpatheticFooter = () => {
  const systemState = useSystemState();
  const config      = MESSAGE_MAP[systemState] || MESSAGE_MAP.DEFAULT;
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible,  setVisible]  = useState(true);

  // Rotar mensajes cada 8 segundos si hay más de uno
  useEffect(() => {
    if (config.messages.length <= 1) return;
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex(i => (i + 1) % config.messages.length);
        setVisible(true);
      }, 350);
    }, 8000);
    return () => clearInterval(t);
  }, [config]);

  // Resetear índice si cambia el estado
  useEffect(() => {
    setMsgIndex(0);
    setVisible(true);
  }, [systemState]);

  const message = config.messages[msgIndex % config.messages.length];

  return (
    <div style={{
      marginTop: 10, marginBottom: 4,
      padding: "14px 18px",
      background: config.bg,
      border: `1.5px solid ${config.color}30`,
      borderRadius: 14,
      display: "flex", gap: 12, alignItems: "center",
      transition: "all .3s",
    }}>
      {/* Emoji */}
      <span style={{
        fontSize: 24, lineHeight: 1, flexShrink: 0,
        animation: "float 3s ease-in-out infinite",
      }}>
        {config.emoji}
      </span>

      {/* Texto empático */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(4px)",
        transition: "opacity .35s, transform .35s",
      }}>
        <div style={{
          fontFamily: "'Nunito Sans', sans-serif",
          fontSize: 13.5, color: config.color, fontWeight: 600,
          lineHeight: 1.55,
        }}>
          {message}
        </div>
        <div style={{
          fontSize: 10.5, color: T.textMuted,
          fontFamily: "'IBM Plex Mono', monospace",
          marginTop: 3, letterSpacing: ".3px",
        }}>
          ESTADO · {systemState.replaceAll("_", " ")}
        </div>
      </div>
    </div>
  );
};

export default EmpatheticFooter;
