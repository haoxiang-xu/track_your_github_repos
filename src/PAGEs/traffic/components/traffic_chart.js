import { useContext, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import { filterSeriesByRange } from "../services/traffic_data";

/* ── Weight-Simple-style area chart ─────────────────────── */

const PLACEHOLDER_HEIGHTS = [38, 58, 46, 74, 52, 62, 42];

const formatDate = (iso) => {
  const d = new Date(iso);
  const month = d.toLocaleString("en", { month: "short" });
  const day = d.getDate();
  return `${month} ${day}`;
};

const formatDateFull = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* ── custom tooltip ──────────────────────────────────────── */
const CustomTooltip = ({ active, payload, fontFamily, isDark }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;

  const bg = isDark ? "rgba(30,30,30,0.92)" : "rgba(255,255,255,0.96)";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#e0e0e0" : "#1a1a1a";
  const mutedColor = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.45)";

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${borderColor}`,
        borderRadius: 10,
        padding: "10px 14px",
        fontFamily,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.4)"
          : "0 8px 32px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 11, color: mutedColor, marginBottom: 6 }}>
        {formatDateFull(data.timestamp)}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 500,
            color: textColor,
            marginBottom: i < payload.length - 1 ? 3 : 0,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: mutedColor, fontWeight: 400, fontSize: 12 }}>
            {p.name}
          </span>
          <span style={{ marginLeft: "auto" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

const ChartPlaceholder = ({ isDark, fontFamily, overlay = false }) => {
  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const overlaySurface = isDark
    ? "rgba(15,15,15,0.72)"
    : "rgba(250,250,250,0.78)";
  const border = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const labelColor = isDark ? "rgba(255,255,255,0.52)" : "rgba(0,0,0,0.42)";

  return (
    <div
      data-testid={
        overlay
          ? "traffic-chart-loading-overlay"
          : "traffic-chart-loading-placeholder"
      }
      style={{
        position: overlay ? "absolute" : "relative",
        inset: overlay ? 0 : undefined,
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 16,
        padding: overlay ? 16 : "16px 14px 12px",
        borderRadius: 12,
        background: overlay ? overlaySurface : surface,
        border: `1px solid ${border}`,
        backdropFilter: overlay ? "blur(4px)" : undefined,
        WebkitBackdropFilter: overlay ? "blur(4px)" : undefined,
        pointerEvents: "none",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          maxWidth: overlay ? 120 : 180,
        }}
      >
        <div
          className="traffic-chart-shimmer"
          style={{
            width: overlay ? "58%" : "72%",
            height: 9,
            borderRadius: 999,
            backgroundColor: surface,
          }}
        />
        {!overlay && (
          <div
            style={{
              fontFamily,
              fontSize: 12,
              color: labelColor,
            }}
          >
            Updating traffic data...
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 8,
          alignItems: "end",
          minHeight: 0,
        }}
      >
        {PLACEHOLDER_HEIGHTS.map((barHeight, index) => (
          <div
            key={`${barHeight}-${index}`}
            className="traffic-chart-shimmer"
            style={{
              height: `${barHeight}%`,
              minHeight: overlay ? 38 : 50,
              borderRadius: 10,
              backgroundColor: surface,
              opacity: overlay ? 0.68 : 1,
            }}
          />
        ))}
      </div>
    </div>
  );
};

/* ── main chart ──────────────────────────────────────────── */

const TrafficChart = ({
  data = [], // [{ timestamp, count, uniques }]
  title = "",
  height = 260,
  color1, // override total color
  color2, // override uniques color
  range, // "7d" | "14d" | "30d" | "90d" | "all"
  isLoading = false,
}) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const fontFamily = theme?.font?.fontFamily || "Jost, sans-serif";

  /* ── palette ─────────────────────────────────────────── */
  const totalColor = color1 || (isDark ? "#93c5fd" : "#3b82f6");
  const uniqueColor = color2 || (isDark ? "#a78bfa" : "#8b5cf6");
  const axisColor = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.35)";
  const baseColor = isDark ? "#e0e0e0" : "#1a1a1a";

  /* ── filter by range ─────────────────────────────────── */
  const chartData = useMemo(
    () => filterSeriesByRange(data, range),
    [data, range],
  );

  /* ── y-axis domain — let recharts auto-scale with a tiny padding ── */
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.count || 0, d.uniques || 0)),
    0,
  );
  const yMax = Math.ceil(maxVal * 1.15) || 10;

  return (
    <div style={{ width: "100%" }}>
      {title && (
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
          {title}
        </div>
      )}
      <div
        style={{ position: "relative", width: "100%", height }}
        aria-busy={isLoading}
      >
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient
                  id={`grad-total-${title}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={totalColor} stopOpacity={0.25} />
                  <stop
                    offset="100%"
                    stopColor={totalColor}
                    stopOpacity={0.0}
                  />
                </linearGradient>
                <linearGradient
                  id={`grad-unique-${title}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={uniqueColor} stopOpacity={0.2} />
                  <stop
                    offset="100%"
                    stopColor={uniqueColor}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                horizontal={true}
                vertical={false}
                strokeDasharray="3 4"
                stroke={axisColor}
              />

              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: labelColor, fontFamily }}
                axisLine={false}
                tickLine={false}
                dy={8}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, yMax]}
                tick={{ fontSize: 11, fill: labelColor, fontFamily }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={40}
              />

              <Tooltip
                content={
                  <CustomTooltip fontFamily={fontFamily} isDark={isDark} />
                }
                cursor={{
                  stroke: axisColor,
                  strokeWidth: 1,
                  strokeDasharray: "4 3",
                }}
              />

              <Area
                type="monotone"
                dataKey="count"
                name="Total"
                stroke={totalColor}
                strokeWidth={2}
                fill={`url(#grad-total-${title})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: totalColor,
                  stroke: isDark ? "#1a1a1a" : "#fff",
                  strokeWidth: 2,
                }}
              />
              <Area
                type="monotone"
                dataKey="uniques"
                name="Unique"
                stroke={uniqueColor}
                strokeWidth={2}
                fill={`url(#grad-unique-${title})`}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: uniqueColor,
                  stroke: isDark ? "#1a1a1a" : "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : isLoading ? (
          <ChartPlaceholder isDark={isDark} fontFamily={fontFamily} />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily,
              fontSize: 13,
              color: labelColor,
            }}
          >
            No data yet
          </div>
        )}

        {isLoading && chartData.length > 0 && (
          <ChartPlaceholder
            isDark={isDark}
            fontFamily={fontFamily}
            overlay={true}
          />
        )}
      </div>
    </div>
  );
};

export default TrafficChart;
