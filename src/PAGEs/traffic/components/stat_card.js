import { useContext } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";

/* ── Weight-Simple stat card ─────────────────────────────── */

const StatCard = ({
  label,
  value,
  delta, // number – positive = up, negative = down
  deltaLabel, // e.g. "vs last 14d"
  icon, // optional emoji / character
  accentColor, // override accent
}) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const fontFamily = theme?.font?.fontFamily || "Jost, sans-serif";

  const bg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";
  const borderColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const baseColor = isDark ? "#e0e0e0" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.38)";
  const upColor = isDark ? "#86efac" : "#22c55e";
  const downColor = "#f87171";

  const formattedValue =
    typeof value === "number"
      ? value >= 1000
        ? `${(value / 1000).toFixed(1)}k`
        : String(value)
      : (value ?? "—");

  const deltaUp = typeof delta === "number" && delta > 0;
  const deltaDown = typeof delta === "number" && delta < 0;
  const deltaStr =
    typeof delta === "number"
      ? `${deltaUp ? "+" : ""}${delta >= 1000 ? `${(delta / 1000).toFixed(1)}k` : delta}`
      : null;

  return (
    <div
      style={{
        flex: "1 1 160px",
        minWidth: 140,
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 14,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "background 0.2s",
      }}
    >
      {/* top row: label + icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {icon && <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>}
        <span
          style={{
            fontFamily,
            fontSize: 12,
            fontWeight: 500,
            color: mutedColor,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      </div>

      {/* big number */}
      <span
        style={{
          fontFamily,
          fontSize: 32,
          fontWeight: 600,
          color: baseColor,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {formattedValue}
      </span>

      {/* delta row */}
      {deltaStr !== null && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span
            style={{
              fontFamily,
              fontSize: 12,
              fontWeight: 500,
              color: deltaUp ? upColor : deltaDown ? downColor : mutedColor,
            }}
          >
            {deltaUp ? "↑" : deltaDown ? "↓" : ""}
            {deltaStr}
          </span>
          {deltaLabel && (
            <span style={{ fontFamily, fontSize: 11, color: mutedColor }}>
              {deltaLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
