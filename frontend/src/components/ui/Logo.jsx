import T from "../../tokens/T";

// ─── Logo con mascota nutria ──────────────────────────────────────────────────
export const LOGO_URL = "https://i.postimg.cc/FsNKHJ22/1776015778388.png";

const Logo = ({ size = 36, showText = true }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <img
      src={LOGO_URL}
      alt="NutrIA mascota"
      style={{
        width: size, height: size,
        borderRadius: size * 0.27,
        objectFit: "cover",
        boxShadow: `0 2px 10px rgba(43,188,185,0.25)`,
      }}
    />
    {showText && (
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 800,
        fontSize: size * 0.5,
        color: T.textPrimary,
        letterSpacing: "-0.4px",
      }}>
        Nutr<span style={{ color: T.teal }}>IA</span>
      </span>
    )}
  </div>
);

export default Logo;
