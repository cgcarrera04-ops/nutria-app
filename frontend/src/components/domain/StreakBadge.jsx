import { useState, useEffect } from "react";
import T from "../../tokens/T";
import MASCOT from "../../constants/mascotImages";

// ─── Streak Badge ─────────────────────────────────────────────────────────────
// Componente modular que calcula y muestra las rachas diarias del usuario.
// La racha se incrementa si el usuario abre la app cada día consecutivo.
// Se persiste en localStorage para sobrevivir recargas y cierres del navegador.

const STORAGE_KEY_STREAK = "nutria_streak";
const STORAGE_KEY_LAST   = "nutria_lastVisit";

const getTodayStr = () => new Date().toISOString().slice(0, 10); // "2026-05-28"

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

const computeStreak = () => {
  const today     = getTodayStr();
  const yesterday = getYesterdayStr();
  const lastVisit = localStorage.getItem(STORAGE_KEY_LAST);
  let streak      = parseInt(localStorage.getItem(STORAGE_KEY_STREAK) || "0", 10);

  if (lastVisit === today) {
    // Ya visitó hoy — no cambiar nada
    return streak;
  }

  if (lastVisit === yesterday) {
    // Día consecutivo — incrementar racha
    streak += 1;
  } else {
    // Rompió la racha o es primera vez — reiniciar a 1
    streak = 1;
  }

  localStorage.setItem(STORAGE_KEY_STREAK, String(streak));
  localStorage.setItem(STORAGE_KEY_LAST, today);
  return streak;
};

const STREAK_TIERS = [
  {
    minDays: 365,
    name: "celestial",
    color: "#E5C158", // Dorado celestial premium
    emoji: "☀️",
    bgGradient: "linear-gradient(135deg, rgba(229,193,88,0.15) 0%, rgba(255,255,255,0.06) 100%)",
    animation: "float 2.2s ease-in-out infinite",
    badgeLabel: "Racha Celestial"
  },
  {
    minDays: 90,
    name: "cosmic",
    color: "#9F56D2", // Violeta cósmico
    emoji: "🌌",
    bgGradient: "linear-gradient(135deg, rgba(159,86,210,0.12) 0%, rgba(61,133,176,0.06) 100%)",
    animation: "float 3s ease-in-out infinite",
    badgeLabel: "Racha Cósmica"
  },
  {
    minDays: 30,
    name: "royal",
    color: "#E25C5C", // Rubí imperial
    emoji: "🏆",
    bgGradient: "linear-gradient(135deg, rgba(226,92,92,0.12) 0%, rgba(122,85,64,0.05) 100%)",
    animation: "pulse 2s ease-in-out infinite",
    badgeLabel: "Racha Mensual"
  },
  {
    minDays: 21,
    name: "emerald",
    color: "#24A17F", // Esmeralda
    emoji: "🌿",
    bgGradient: "linear-gradient(135deg, rgba(36,161,127,0.12) 0%, rgba(43,188,185,0.05) 100%)",
    animation: "none",
    badgeLabel: "Racha de 3 Semanas"
  },
  {
    minDays: 14,
    name: "amethyst",
    color: "#7E57C2", // Amatista
    emoji: "🔮",
    bgGradient: "linear-gradient(135deg, rgba(126,87,194,0.12) 0%, rgba(91,156,191,0.05) 100%)",
    animation: "none",
    badgeLabel: "Racha de 2 Semanas"
  },
  {
    minDays: 7,
    name: "fire",
    color: "#FF6B35", // Fuego
    emoji: "🔥",
    bgGradient: "linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(245,166,35,0.08) 100%)",
    animation: "pulse-border 2s ease-in-out infinite",
    badgeLabel: "Racha Semanal"
  },
  {
    minDays: 3,
    name: "golden",
    color: "#F5A623", // Oro
    emoji: "⚡",
    bgGradient: "linear-gradient(135deg, rgba(245,166,35,0.10) 0%, rgba(43,188,185,0.05) 100%)",
    animation: "none",
    badgeLabel: "Racha Dorada"
  },
  {
    minDays: 1,
    name: "standard",
    color: "#2BBCB9", // Teal original
    emoji: "🦦",
    bgGradient: "linear-gradient(135deg, rgba(43,188,185,0.08) 0%, rgba(255,255,255,0.04) 100%)",
    animation: "none",
    badgeLabel: "Racha Inicial"
  }
];

const StreakBadge = () => {
  const [streak, setStreak] = useState(0);
  const [showPop, setShowPop] = useState(false);

  useEffect(() => {
    const s = computeStreak();
    setStreak(s);
    // Pequeño delay para animación de entrada
    setTimeout(() => setShowPop(true), 300);
  }, []);

  if (streak <= 0) return null;

  // Encontrar el tier activo más alto alcanzado
  const activeTier = STREAK_TIERS.find(tier => streak >= tier.minDays) || STREAK_TIERS[STREAK_TIERS.length - 1];

  const messages = {
    1: "¡Día 1! Cada gran viaje comienza así 🦦",
    2: "¡2 días seguidos! Vas muy bien 💪",
    3: "¡3 días de racha! Eres imparable ✨",
    5: "¡5 días! Tu disciplina inspira 🌟",
    7: "¡1 semana completa! NutrIA está orgullosa 🎉",
    14: "¡2 semanas! Tu constancia es ejemplar 🏆",
    21: "¡3 semanas seguidas! Un hábito completamente arraigado 🌿",
    30: "¡1 mes entero! ¡Tu dedicación es de otro nivel! 👑",
    90: "¡3 meses de racha! ¡Tu constancia es legendaria y cósmica! 🌌",
    365: "¡1 año completo! ¡Has alcanzado la trascendencia con NutrIA! ☀️",
  };

  // Encontrar el mensaje más cercano sin pasarse
  const msgKeys = Object.keys(messages).map(Number).sort((a, b) => a - b);
  let msg = messages[1];
  for (const k of msgKeys) {
    if (streak >= k) msg = messages[k];
  }

  return (
    <div
      className="fade-up"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        marginBottom: 10,
        borderRadius: 14,
        background: activeTier.bgGradient,
        border: `1.5px solid ${activeTier.color}35`,
        boxShadow: `0 3px 14px ${activeTier.color}15`,
        transform: showPop ? "scale(1)" : "scale(0.92)",
        opacity: showPop ? 1 : 0,
        transition: "all 0.4s cubic-bezier(.22,.68,0,1.15)",
      }}
    >
      {/* Ícono de racha animado con color y efecto correspondiente a su rango */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: `${activeTier.color}18`,
          border: `1px solid ${activeTier.color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 24,
          flexShrink: 0,
          animation: activeTier.animation,
        }}
      >
        {activeTier.emoji}
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 6,
            marginBottom: 2,
          }}
        >
          <span
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 22,
              fontWeight: 700,
              color: activeTier.color,
              lineHeight: 1,
            }}
          >
            {streak}
          </span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: activeTier.color,
              textTransform: "uppercase",
              letterSpacing: ".6px",
            }}
          >
            {streak === 1 ? "día" : "días"} ({(activeTier.badgeLabel).toLowerCase()})
          </span>
        </div>
        <div
          style={{
            fontSize: 12,
            color: T.textSecondary,
            lineHeight: 1.4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {msg}
        </div>
      </div>

      {/* Avatar de la mascota correspondiente a su rango de racha */}
      <div style={{ flexShrink: 0, textAlign: "center" }}>
        <img
          src={MASCOT.streak[activeTier.name] || MASCOT.logo}
          alt={`NutrIA ${activeTier.badgeLabel}`}
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            objectFit: "cover",
            border: `1.5px solid ${activeTier.color}35`,
            animation: activeTier.animation !== "none" ? activeTier.animation : "float 4s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
};

export default StreakBadge;

