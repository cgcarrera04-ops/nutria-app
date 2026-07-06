import T from "./T";
import { keyframes } from "./animations";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Nunito+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

export const globalStyles = `
  ${FONTS}
  ${keyframes}

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-font-smoothing: antialiased; scroll-behavior: smooth; }
  body {
    background: ${T.bg};
    color: ${T.textPrimary};
    font-family: 'Nunito Sans', sans-serif;
    min-height: 100vh;
  }

  /* Scrollbar cian */
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.teal}; }

  /* Clases de animación escalonadas */
  .fade-up   { animation: fadeUp .45s cubic-bezier(.22,.68,0,1.15) both; }
  .fade-up-1 { animation-delay: .07s; }
  .fade-up-2 { animation-delay: .14s; }
  .fade-up-3 { animation-delay: .21s; }
  .fade-up-4 { animation-delay: .28s; }
  .fade-up-5 { animation-delay: .35s; }
  .scale-in  { animation: scaleIn .35s cubic-bezier(.22,.68,0,1.15) both; }
  .slide-in  { animation: slideIn .38s cubic-bezier(.22,.68,0,1.15) both; }

  /* Inputs */
  input, select, textarea {
    outline: none; background: transparent;
    color: ${T.textPrimary}; font-family: 'Nunito Sans', sans-serif;
  }
  input::placeholder, textarea::placeholder { color: ${T.textMuted}; }

  /* Range slider cian */
  input[type=range] {
    -webkit-appearance: none; width: 100%; height: 3px;
    border-radius: 2px; background: ${T.border}; cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; width: 18px; height: 18px;
    border-radius: 50%; background: ${T.teal}; cursor: pointer;
    box-shadow: 0 0 0 4px ${T.tealLight};
    transition: box-shadow .2s;
  }
  input[type=range]::-webkit-slider-thumb:hover {
    box-shadow: 0 0 0 6px ${T.tealMid};
  }

  /* Botón primario — cian */
  .btn-primary {
    background: ${T.teal}; color: #fff; border: none;
    padding: 13px 28px; border-radius: 12px;
    font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 700;
    font-size: 14px; letter-spacing: .2px; cursor: pointer;
    transition: background .18s, box-shadow .18s, transform .12s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn-primary:hover  { background: ${T.tealDark}; box-shadow: ${T.shadowMd}; }
  .btn-primary:active { transform: scale(.98); }
  .btn-primary:disabled { opacity: 0.42; cursor: not-allowed; transform: none; }

  /* Botón ghost */
  .btn-ghost {
    background: transparent; color: ${T.textSecondary};
    border: 1.5px solid ${T.border}; padding: 11px 22px; border-radius: 12px;
    font-family: 'Nunito Sans', sans-serif; font-size: 14px; cursor: pointer;
    transition: border-color .18s, color .18s, background .18s;
    display: inline-flex; align-items: center; gap: 7px;
  }
  .btn-ghost:hover { border-color: ${T.teal}; color: ${T.teal}; background: ${T.tealLight}; }

  /* Card base */
  .card {
    background: ${T.surface}; border: 1.5px solid ${T.border};
    border-radius: 16px; padding: 20px;
    box-shadow: ${T.shadow}; transition: border-color .2s, box-shadow .2s;
  }
  .card:hover { border-color: ${T.teal}44; box-shadow: ${T.shadowMd}; }

  /* Tag / Badge */
  .tag {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 7px;
    font-family: 'IBM Plex Mono', monospace; font-size: 10px;
    font-weight: 500; letter-spacing: .5px; white-space: nowrap;
  }

  /* Tarjeta del Diario - Estilo Premium Sensible al Tema */
  .diary-card {
    border-radius: 18px;
    padding: 15px 18px;
    display: flex;
    gap: 15px;
    align-items: center;
    cursor: pointer;
    margin-bottom: 22px;
    box-shadow: ${T.shadow};
    transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  [data-theme="light"] .diary-card {
    background: linear-gradient(135deg, ${T.teal} 0%, #1c9b98 100%);
    border: 1.5px solid ${T.teal};
  }
  [data-theme="light"] .diary-card h4 {
    color: #ffffff;
  }
  [data-theme="light"] .diary-card p {
    color: rgba(255, 255, 255, 0.95);
  }
  [data-theme="light"] .diary-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(43,188,185,0.32);
  }
  
  [data-theme="dark"] .diary-card {
    background: linear-gradient(135deg, #071716 0%, #030808 100%);
    border: 1.5px solid ${T.teal};
  }
  [data-theme="dark"] .diary-card h4 {
    color: ${T.teal};
    text-shadow: 0 0 10px rgba(43,188,185,0.3);
  }
  [data-theme="dark"] .diary-card p {
    color: ${T.textSecondary};
  }
  [data-theme="dark"] .diary-card:hover {
    transform: translateY(-3px);
    border-color: #3fe2de;
    box-shadow: 0 8px 28px rgba(43,188,185,0.25);
  }
`;
