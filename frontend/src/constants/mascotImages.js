// ─── MASCOT IMAGES — Central config file ────────────────────────────────────
// Todas las URLs apuntan a postimg.cc CDN para carga rápida y confiable.
// Si una imagen no carga, el fallback automático muestra el logo.

const LOGO = "https://i.postimg.cc/qgfvHSZ8/image.png"; // Cuerpo completo — pantalla de inicio
const LOGO_FACE = "https://i.postimg.cc/qgfvHSZ8/image.png"; // Cara — icono de app

export const MASCOT = {
  // ── Logo principal (cara NutrIA) ─────────────────────────────────────────
  logo:     LOGO_FACE,
  default:  LOGO_FACE,

  // ── Imagen de cuerpo completo (Welcome hero & Dashboard) ─────────────────
  fullBody: LOGO,

  // ── Somatotipos (OnboardBio) ──────────────────────────────────────────────
  somatotype: {
    slim:     "https://i.postimg.cc/bvYb5SnY/image.png", // Delgada — cinta métrica
    athletic: "https://i.postimg.cc/JnGXrwP0/image.png", // Normal — brazos cruzados
    robust:   "https://i.postimg.cc/Y2LFTHvY/image.png", // Gordito — abierto y cálido
  },

  // ── Módulo de Entrenamiento (TrainingScreen / OnboardContext) ─────────────
  training: {
    gym:     "https://i.postimg.cc/nh29qVWs/image.png", // Gym completo — máquinas
    home:    "https://i.postimg.cc/0j7bj9mR/image.png", // Casa — mancuernas
    outdoor: "https://i.postimg.cc/9FjDSq57/image.png", // Calistenia — pushups
    injury:  LOGO_FACE,
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
    celebration: LOGO_FACE,
    empty:       LOGO_FACE,
    cheatMeal:   "https://i.postimg.cc/Gmghc4N3/image.png",
  },
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
