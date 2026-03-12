import { useContext } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";

/* ── Minimalist referrer table ───────────────────────────── */

const ReferrersTable = ({ data = [] }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const fontFamily = theme?.font?.fontFamily || "Jost, sans-serif";

  const baseColor = isDark ? "#e0e0e0" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const headerColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const sorted = [...data].sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...sorted.map((r) => r.count), 1);

  if (!sorted.length) {
    return (
      <div
        style={{
          fontFamily,
          fontSize: 13,
          color: mutedColor,
          padding: "12px 0",
        }}
      >
        No referrer data
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div
        style={{
          fontFamily,
          fontSize: 12,
          fontWeight: 500,
          color: baseColor,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          marginBottom: 12,
        }}
      >
        Top Referrers
      </div>

      {/* header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 72px 72px",
          gap: 8,
          padding: "0 0 6px",
          borderBottom: `1px solid ${divider}`,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            fontFamily,
            fontSize: 11,
            color: headerColor,
            fontWeight: 500,
          }}
        >
          Source
        </span>
        <span
          style={{
            fontFamily,
            fontSize: 11,
            color: headerColor,
            fontWeight: 500,
            textAlign: "right",
          }}
        >
          Views
        </span>
        <span
          style={{
            fontFamily,
            fontSize: 11,
            color: headerColor,
            fontWeight: 500,
            textAlign: "right",
          }}
        >
          Unique
        </span>
      </div>

      {/* rows */}
      {sorted.map((r, i) => (
        <div
          key={r.referrer}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 72px 72px",
            gap: 8,
            padding: "8px 0",
            borderBottom:
              i < sorted.length - 1 ? `1px solid ${divider}` : "none",
            position: "relative",
          }}
        >
          {/* bar background */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 2,
              bottom: 2,
              width: `${(r.count / maxCount) * 100}%`,
              background: isDark
                ? "rgba(147,197,253,0.06)"
                : "rgba(59,130,246,0.05)",
              borderRadius: 4,
              transition: "width 0.3s",
              pointerEvents: "none",
            }}
          />
          <span
            style={{
              fontFamily,
              fontSize: 13,
              color: baseColor,
              position: "relative",
              zIndex: 1,
              paddingLeft: 6,
            }}
          >
            {r.referrer}
          </span>
          <span
            style={{
              fontFamily,
              fontSize: 13,
              fontWeight: 500,
              color: baseColor,
              textAlign: "right",
              position: "relative",
              zIndex: 1,
            }}
          >
            {r.count}
          </span>
          <span
            style={{
              fontFamily,
              fontSize: 13,
              color: mutedColor,
              textAlign: "right",
              position: "relative",
              zIndex: 1,
            }}
          >
            {r.uniques}
          </span>
        </div>
      ))}
    </div>
  );
};

export default ReferrersTable;
