// ─── API Configuration ──────────────────────────────────────────────────────
// En desarrollo usa localhost:8000. En producción usa la variable de entorno.
// Para desplegar: crear .env con VITE_API_URL=https://tu-backend.onrender.com
export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
