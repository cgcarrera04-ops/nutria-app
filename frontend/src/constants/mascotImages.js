// ─── MASCOT IMAGES — Central config file ────────────────────────────────────
// Todas las URLs apuntan a postimg.cc CDN para carga rápida y confiable.
// Si una imagen no carga, el fallback automático muestra el logo.

const LOGO_FACE  = "https://i.postimg.cc/FsNKHJ22/1776015778388.png"; // Logo oficial NutrIA (nuevo)
const LOGO_WAVE  = "https://i.postimg.cc/HkWxnv71/image.png";            // Nutria saludando efusivamente — hero bienvenida
const LOGO       = LOGO_WAVE;                                               // Hero fullBody usa la que saluda

export const MASCOT = {
  // ── Logo principal — nuevo logo oficial ─────────────────────────────────
  logo:     LOGO_FACE,
  default:  LOGO_FACE,

  // ── Hero de bienvenida — nutria saludando efusivamente ───────────────────
  fullBody: LOGO_WAVE,
  wave:     LOGO_WAVE,

  // ── Somatotipos (OnboardBio) ──────────────────────────────────────────────
  somatotype: {
    slim:     "https://i.postimg.cc/bvYb5SnY/image.png", // Delgada — cinta métrica
    athletic: "https://i.postimg.cc/JnGXrwP0/image.png", // Normal — brazos cruzados
    robust:   "https://i.postimg.cc/Y2LFTHvY/image.png", // Gordito — abierto y cálido
    unknown:  "https://i.postimg.cc/W3fJNv1k/Biotipo-No-estoy-seguro.png", // No estoy seguro (nuevo)
  },

  // ── Módulo de Entrenamiento (TrainingScreen / OnboardContext) ─────────────
  training: {
    gym:     "https://i.postimg.cc/nh29qVWs/image.png", // Gym completo — máquinas
    home:    "https://i.postimg.cc/0j7bj9mR/image.png", // Casa — mancuernas
    outdoor: "https://i.postimg.cc/9FjDSq57/image.png", // Calistenia — pushups
    injury:  "https://i.postimg.cc/26t0LgSg/Alerta-de-lesiones.png", // Alerta de lesiones (nuevo)
  },

  // ── Pantalla de Carga — alternancia frame1 ↔ frame2 cada 1 segundo ────────
  loading: {
    frame1: "https://i.postimg.cc/pdyr8f8C/image.png", // Tecleando frenéticamente
    frame2: "https://i.postimg.cc/vT7ZM3RJ/image.png", // Cara de "¡Encontré algo!"
    frame3: "https://i.postimg.cc/vT7ZM3RJ/image.png", // (mismo eureka para el 3er tercio)
  },

  // ── Buscador / Detective ──────────────────────────────────────────────────
  detective: "https://i.postimg.cc/Gmghc4N3/image.png", // Vestida de detective

  // ── Empty States ──────────────────────────────────────────────────────────
  emptyState: {
    celebration: "https://i.postimg.cc/GtW8DxYb/Celebracion.png", // Celebración (nuevo)
    empty:       "https://i.postimg.cc/7ZMGC7Zj/Estado-vacio.png", // Estado vacío (nuevo)
    cheatMeal:   "https://i.postimg.cc/Gmghc4N3/image.png",
  },

  // ── Rachas Gamificadas (StreakBadge) ──────────────────────────────────────
  streak: {
    standard:  "https://i.postimg.cc/L6PxnHZp/Nutr-IA-Principiante.png",  // Días 1 a 2
    golden:    "https://i.postimg.cc/xdfkLCkb/Nutr-IA-Activa.png",        // Días 3 a 6
    fire:      "https://i.postimg.cc/BbKtJPzx/Nutr-IA-de-Fuego.png",      // Días 7 a 13
    amethyst:  "https://i.postimg.cc/wv37bGcf/Nutr-IA-Amatista.png",      // Días 14 a 20
    emerald:   "https://i.postimg.cc/MZNs6cHq/Nutr-IA-Esmeralda.png",      // Días 21 a 29
    royal:     "https://i.postimg.cc/NLvFFfqY/Nutr-IA-de-la-Realeza.png", // Días 30 a 89
    cosmic:    "https://i.postimg.cc/QtPHLJfh/Nutr-IA-Astronauta.png",   // Días 90 a 364
    celestial: "https://i.postimg.cc/T2FWBfsB/Deidad-Nutr-IA.png",       // Días 365+
  },

  // ── Gamificación del Agua (Piscina de NutrIA) ─────────────────────────────
  water: {
    thirsty: "https://i.postimg.cc/Jn4kCQjM/image.png", // Sedienta en desierto
    floatie: "https://i.postimg.cc/RFFNDZz0/image.png", // Con flotador
    coco:    "https://i.postimg.cc/8Cs7yCSn/image.png", // Feliz tomando coco
  }
};

// Helper con fallback automático
export const getMascotSrc = (path, fallback = LOGO_FACE) => {
  try {
    const keys = path.split(".");
    let val = MASCOT;
    for (const k of keys) val = val[k];
    return val && val !== LOGO_FACE ? val : fallback;
  } catch {
    return fallback;
  }
};

export default MASCOT;
