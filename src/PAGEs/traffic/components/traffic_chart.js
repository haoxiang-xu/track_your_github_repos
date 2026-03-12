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

/* ── Weight-Simple-style area chart ─────────────────────── */

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

/* ── main chart ──────────────────────────────────────────── */

const TrafficChart = ({
  data = [], // [{ timestamp, count, uniques }]
  title = "",
  height = 260,
  color1, // override total color
  color2, // override uniques color
  range, // "7d" | "30d" | "90d" | "all"
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
  const chartData = useMemo(() => {
    if (!data?.length) return [];
    const sorted = [...data].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
    );
    if (!range || range === "all") return sorted;
    const days =
      range === "7d"
        ? 7
        : range === "30d"
          ? 30
          : range === "90d"
            ? 90
            : Infinity;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return sorted.filter((d) => new Date(d.timestamp) >= cutoff);
  }, [data, range]);

  if (!chartData.length) {
    return (
      <div
        style={{
          height,
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
    );
  }

  /* ── y-axis domain — let recharts auto-scale with a tiny padding ── */
  const maxVal = Math.max(
    ...chartData.map((d) => Math.max(d.count || 0, d.uniques || 0)),
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
      <ResponsiveContainer width="100%" height={height}>
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
              <stop offset="100%" stopColor={totalColor} stopOpacity={0.0} />
            </linearGradient>
            <linearGradient
              id={`grad-unique-${title}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={uniqueColor} stopOpacity={0.2} />
              <stop offset="100%" stopColor={uniqueColor} stopOpacity={0.0} />
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
            content={<CustomTooltip fontFamily={fontFamily} isDark={isDark} />}
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
    </div>
  );
};

export default TrafficChart;
