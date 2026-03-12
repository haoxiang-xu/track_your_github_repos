import { useContext } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";

/* ── Minimalist popular paths table ──────────────────────── */

const PopularPathsTable = ({ data = [] }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const fontFamily = theme?.font?.fontFamily || "Jost, sans-serif";

  const baseColor = isDark ? "#e0e0e0" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.38)" : "rgba(0,0,0,0.38)";
  const headerColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";
  const divider = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  const sorted = [...data].sort((a, b) => b.count - a.count);
  const maxCount = Math.max(...sorted.map((p) => p.count), 1);

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
        No path data
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
        Popular Content
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
          Path
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
      {sorted.map((p, i) => (
        <div
          key={p.path}
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
          {/* bar */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 2,
              bottom: 2,
              width: `${(p.count / maxCount) * 100}%`,
              background: isDark
                ? "rgba(167,139,250,0.06)"
                : "rgba(139,92,246,0.05)",
              borderRadius: 4,
              transition: "width 0.3s",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              paddingLeft: 6,
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontFamily,
                fontSize: 13,
                color: baseColor,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={p.path}
            >
              {p.path}
            </div>
            {p.title && (
              <div
                style={{
                  fontFamily,
                  fontSize: 11,
                  color: mutedColor,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.title}
              </div>
            )}
          </div>
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
            {p.count}
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
            {p.uniques}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PopularPathsTable;
