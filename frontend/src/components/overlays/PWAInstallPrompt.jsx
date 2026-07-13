import { useState, useEffect } from "react";
import T from "../../tokens/T";
import MASCOT from "../../constants/mascotImages";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState("unknown"); // "ios" | "android" | "other"

  useEffect(() => {
    // 1. Evitar renderizado si ya está en modo autónomo (standalone / PWA instalada)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      window.navigator.standalone === true;
    
    if (isStandalone) return;

    // 2. Detectar si el usuario está en celular (iOS o Android)
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const isAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isAndroid;

    if (!isMobile) return;

    setPlatform(isIOS ? "ios" : "android");

    // 3. Verificar tiempo de descarte (cooldown de 3 días para no molestar)
    const dismissedTime = localStorage.getItem("nutria_pwa_dismissed");
    if (dismissedTime) {
      const diff = Date.now() - Number(dismissedTime);
      const cooldown = 3 * 24 * 60 * 60 * 1000; 
      if (diff < cooldown) return;
    }

    // 4. Capturar el evento nativo de Chrome en Android
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // En iOS (Safari) no existe beforeinstallprompt, mostramos la instrucción manual tras 3 segundos
    if (isIOS) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // Para Android, si no salta el beforeinstallprompt nativo (por ejemplo, en Firefox o Samsung Internet),
    // mostramos de todas formas el prompt manual con retraso de 5 segundos.
    const fallbackTimer = setTimeout(() => {
      if (isAndroid) {
        setIsVisible(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[NutrIA] Resultado de instalación PWA: ${outcome}`);
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("nutria_pwa_dismissed", Date.now().toString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      padding: "16px 16px 24px",
      background: "transparent",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-end",
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* Fondo de pantalla / Backdrop */}
      <div 
        onClick={handleDismiss}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 1
        }} 
      />

      {/* Drawer / Hoja inferior */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: 460,
        background: T.surface,
        border: `1.5px solid ${T.border}`,
        borderRadius: 24,
        padding: "20px 20px 18px",
        boxShadow: "0 10px 32px rgba(0, 0, 0, 0.25)",
        animation: "fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both"
      }}>
        {/* Botón Cerrar */}
        <button
          onClick={handleDismiss}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            border: "none",
            background: `${T.border}30`,
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            cursor: "pointer",
            color: T.textSecondary,
            transition: "background 0.2s"
          }}
        >
          ✕
        </button>

        {/* Contenido Mascot & Burbuja */}
        <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 16 }}>
          <img 
            src={MASCOT.logo} 
            alt="NutrIA" 
            style={{ 
              width: 52, 
              height: 52, 
              borderRadius: 14, 
              objectFit: "cover",
              border: `1.5px solid ${T.teal}`,
              boxShadow: "0 4px 12px rgba(43, 188, 185, 0.15)",
              flexShrink: 0
            }} 
            onError={(e) => { e.target.src = "https://i.postimg.cc/qgfvHSZ8/image.png"; }}
          />
          <div>
            <span style={{ fontSize: 10, color: T.teal, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, letterSpacing: "1px" }}>
              NUTRIA CONSEJO 🦦
            </span>
            <h4 style={{ margin: "2px 0 6px 0", fontSize: 14.5, fontWeight: 700, color: T.textPrimary }}>
              ¡Lleva a NutrIA en tu bolsillo!
            </h4>
            <p style={{ margin: 0, fontSize: 12.5, color: T.textSecondary, lineHeight: 1.55 }}>
              ¿Te gustaría agregarme a tu pantalla de inicio? Podrás abrir tu plan al instante con un solo toque, a pantalla completa y sin barra de direcciones. ¡Es súper ligero!
            </p>
          </div>
        </div>

        {/* Divisor */}
        <div style={{ height: 1, background: T.border, margin: "14px 0" }} />

        {/* Bloque dinámico de instrucciones según Plataforma */}
        {platform === "ios" ? (
          <div style={{ background: `${T.teal}06`, border: `1px solid ${T.teal}20`, borderRadius: 16, padding: "12px 14px", marginBottom: 16 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: T.teal, display: "block", marginBottom: 8 }}>
              Pasos para instalar en tu iPhone:
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12, color: T.textSecondary }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>1️⃣</span>
                <span>Toca el botón <strong>Compartir</strong> en tu Safari (icono 📤 en la parte inferior).</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>2️⃣</span>
                <span>Desliza las opciones y selecciona <strong>"Agregar a inicio"</strong> (o <em>"Add to Home Screen"</em> ➕).</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>3️⃣</span>
                <span>Presiona <strong>Agregar</strong> arriba a la derecha. ¡Y listo! 🦦</span>
              </div>
            </div>
          </div>
        ) : deferredPrompt ? (
          /* Botón directo de instalación para Chrome Android */
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={handleInstallClick}
              style={{
                width: "100%",
                padding: "13px",
                background: T.teal,
                color: "#fff",
                border: "none",
                borderRadius: 14,
                fontWeight: 700,
                fontSize: 13.5,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(43, 188, 185, 0.25)",
                transition: "transform 0.15s ease"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              Instalar Aplicación en 1-clic ⚡
            </button>
            <p style={{ textAlign: "center", margin: 0, fontSize: 11, color: T.textMuted }}>
              Presiona el botón para instalarla automáticamente en tu pantalla.
            </p>
          </div>
        ) : (
          /* Instrucciones manuales para navegadores Android que no tienen Prompt Nativo */
          <div style={{ background: `${T.teal}06`, border: `1px solid ${T.teal}20`, borderRadius: 16, padding: "12px 14px", marginBottom: 16 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: T.teal, display: "block", marginBottom: 8 }}>
              Cómo agregar NutrIA a tu inicio:
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, fontSize: 12, color: T.textSecondary }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>1️⃣</span>
                <span>Toca el menú de opciones de tu navegador (los <strong>tres puntos ⁝</strong> o líneas ☰).</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>2️⃣</span>
                <span>Elige <strong>"Agregar a la pantalla principal"</strong> (o <em>"Instalar aplicación"</em>).</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 15 }}>3️⃣</span>
                <span>Confirma en tu pantalla. ¡Tu NutrIA ya estará contigo! 🦦</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón descartar para no intrusión */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button 
            onClick={handleDismiss} 
            style={{ 
              background: "none", 
              border: "none", 
              fontSize: 12, 
              color: T.textMuted, 
              textDecoration: "underline", 
              cursor: "pointer" 
            }}
          >
            Quizás más tarde, gracias
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
