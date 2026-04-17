/**
 * SplashPreloader.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Precarga todas las imágenes de NutrIA ANTES de mostrar la app.
 * Así eliminamos el efecto "se va imprimiendo" al navegar entre pantallas.
 *
 * Muestra una pantalla de splash animada mientras cargan.
 * Una vez cargadas (o tras un timeout de seguridad de 5s), revela la app.
 */
import { useEffect, useState } from "react";
import MASCOT from "../../constants/mascotImages";
import T from "../../tokens/T";

// ── Todas las URLs de imagen que queremos precargar ──────────────────────────
const IMAGE_URLS = [
  MASCOT.logo,
  MASCOT.fullBody,
  MASCOT.somatotype.slim,
  MASCOT.somatotype.athletic,
  MASCOT.somatotype.robust,
  MASCOT.training.gym,
  MASCOT.training.home,
  MASCOT.training.outdoor,
  MASCOT.loading.frame1,
  MASCOT.loading.frame2,
  MASCOT.detective,
].filter(Boolean);

const TIMEOUT_MS = 6000; // Si tarda más de 6s, arrancamos igual

const preloadImage = (url) =>
  new Promise((resolve) => {
    const img = new window.Image();
    img.onload  = () => resolve({ url, ok: true  });
    img.onerror = () => resolve({ url, ok: false }); // no bloqueamos si falla
    img.src = url;
  });

// ── Animación frame-by-frame de la nutria ────────────────────────────────────
const SplashScreen = ({ progress }) => {
  const [frame, setFrame] = useState(0);
  const frames = [MASCOT.loading.frame1, MASCOT.loading.frame2];

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => (f + 1) % 2), 900);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: T.bg,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 0,
    }}>
      {/* Logo + nombre */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
        <img
          src={MASCOT.logo}
          alt="NutrIA"
          style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover", boxShadow: `0 2px 12px rgba(43,188,185,0.28)` }}
        />
        <span style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
          fontSize: 28, color: "var(--t-text-primary)", letterSpacing: "-1px",
        }}>
          Nutr<span style={{ color: "var(--t-teal)" }}>IA</span>
        </span>
      </div>

      {/* Mascota alternando */}
      <div style={{ position: "relative", marginBottom: 28 }}>
        {[0, 1].map(i => (
          <div key={i} style={{
            position: "absolute", inset: -(i + 1) * 18, borderRadius: "35%",
            border: `1.5px solid var(--t-teal)`,
            opacity: 0.10,
            animation: `breatheRing ${1.8 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.25}s`,
          }} />
        ))}
        <img
          src={frames[frame]}
          alt="NutrIA preparando tu plan..."
          style={{
            width: 140, height: 140, borderRadius: 32, objectFit: "cover",
            position: "relative", zIndex: 1,
            boxShadow: `0 8px 36px rgba(43,188,185,0.25)`,
            transition: "opacity 0.25s ease",
          }}
          onError={e => { e.target.src = MASCOT.logo; }}
        />
      </div>

      {/* Texto de estado */}
      <p style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600,
        fontSize: 15, color: "var(--t-text-primary)", marginBottom: 6,
        textAlign: "center",
      }}>
        Preparando tu espacio…
      </p>
      <p style={{
        fontSize: 12.5, color: "var(--t-text-muted)",
        marginBottom: 28, textAlign: "center",
        fontFamily: "'Nunito Sans', sans-serif",
      }}>
        NutrIA está cargando todo lo que necesitas
      </p>

      {/* Barra de progreso */}
      <div style={{ width: 220, height: 4, background: "var(--t-border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: `linear-gradient(90deg, var(--t-teal), var(--t-teal-dark))`,
          borderRadius: 2,
          transition: "width 0.3s ease",
        }} />
      </div>
      <span style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10.5, color: "var(--t-text-muted)", marginTop: 8,
      }}>
        {Math.round(progress)}%
      </span>
    </div>
  );
};

// ── Componente principal ──────────────────────────────────────────────────────
const SplashPreloader = ({ children }) => {
  const [ready,    setReady]    = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let done = false;

    // Timeout de seguridad — nunca bloquear la app indefinidamente
    const timeout = setTimeout(() => {
      if (!done) { done = true; setProgress(100); setReady(true); }
    }, TIMEOUT_MS);

    const total = IMAGE_URLS.length;
    if (total === 0) { clearTimeout(timeout); setReady(true); return; }

    let loaded = 0;
    const promises = IMAGE_URLS.map(url =>
      preloadImage(url).then(result => {
        loaded++;
        setProgress(Math.round((loaded / total) * 100));
        return result;
      })
    );

    Promise.all(promises).then(() => {
      clearTimeout(timeout);
      if (!done) {
        done = true;
        setProgress(100);
        // Pequeño delay para que la barra llegue a 100% visualmente
        setTimeout(() => setReady(true), 350);
      }
    });

    return () => { clearTimeout(timeout); done = true; };
  }, []);

  if (!ready) return <SplashScreen progress={progress} />;
  return children;
};

export default SplashPreloader;
