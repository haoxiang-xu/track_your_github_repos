import { useContext } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";

/* ── Weight-Simple stat card ─────────────────────────────── */

const StatCard = ({
  label,
  value,
  delta, // number – positive = up, negative = down
  deltaLabel, // e.g. "vs last 14d"
  accentColor, // override accent
}) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const fontFamily = theme?.font?.fontFamily || "Jost, sans-serif";

  const baseColor = isDark ? "#f5f5f7" : "#151821";
  const mutedColor = isDark ? "rgba(255,255,255,0.48)" : "rgba(21,24,33,0.44)";
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
        minWidth: 160,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span
        style={{
          fontFamily,
          fontSize: 12,
          fontWeight: 500,
          color: mutedColor,
          letterSpacing: "0.02em",
        }}
      >
        {label}
      </span>

      {/* big number */}
      <span
        style={{
          fontSize: 34,
          fontWeight: 600,
          color: baseColor,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          fontFamily: "NunitoSans, sans-serif",
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
