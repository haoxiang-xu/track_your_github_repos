import { useCallback, useContext, useMemo, useState } from "react";

/* { Contexts } ----------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } ----------------------------------------------------------------------------------------------------------- */

/* { Components } --------------------------------------------------------------------------------------------------------- */
import AnimatedChildren from "../class/animated_children";
import ArcSpinner from "../spinner/arc_spinner";
/* { Components } --------------------------------------------------------------------------------------------------------- */

/* ── layout constants ─────────────────────────────────────────────────────────────────────────────────────────────────────── */
const TRACK_WIDTH = 24; // px — width of the left column (line + point)
const LINE_WIDTH = 1.5; // px — connecting line stroke width
const TITLE_LINE_H = 20; // px — explicit line-height of title text
const TITLE_CY = TITLE_LINE_H / 2; // 10px — vertical center of first title line

// Point radii — used to align the vertical center of each point with TITLE_CY
const DEFAULT_DOT_R = 4; // default 8 × 8 dot
const PRESET_DOT_R = 6; // start/end   12 × 12 dot
const LOADING_R = 8; // ArcSpinner  16 × 16
/* ── layout constants ─────────────────────────────────────────────────────────────────────────────────────────────────────── */

/* ── helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────────────── */
const resolveLineColor = (status, tl) => {
  if (status === "done") return tl.lineDoneColor ?? "rgba(10,186,181,0.85)";
  if (status === "active") return "rgba(10,186,181,0.38)";
  return tl.lineColor ?? "rgba(0,0,0,0.12)";
};

const resolvePointColor = (status, tl) => {
  if (status === "done" || status === "active")
    return tl.pointColor ?? "rgba(10,186,181,1)";
  return tl.pointPendingColor ?? "rgba(0,0,0,0.18)";
};

const getPointRadius = (point) => {
  if (point === "start" || point === "end") return PRESET_DOT_R;
  if (point === "loading") return LOADING_R;
  if (point != null && typeof point !== "string") return PRESET_DOT_R; // custom element — reasonable guess
  return DEFAULT_DOT_R;
};
/* ── helpers ──────────────────────────────────────────────────────────────────────────────────────────────────────────────── */

/* ── preset point shapes ──────────────────────────────────────────────────────────────────────────────────────────────────── */
const DotDefault = ({ status, tl }) => (
  <div
    style={{
      width: DEFAULT_DOT_R * 2,
      height: DEFAULT_DOT_R * 2,
      borderRadius: "50%",
      background: resolvePointColor(status, tl),
      flexShrink: 0,
      transition: "background 0.25s",
    }}
  />
);

const DotStart = ({ tl }) => {
  const color = tl.pointColor ?? "rgba(10,186,181,1)";
  return (
    <div
      style={{
        width: PRESET_DOT_R * 2,
        height: PRESET_DOT_R * 2,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 0 3px ${color}28`,
        transition: "box-shadow 0.25s",
      }}
    />
  );
};

const DotEnd = ({ status, tl }) => {
  const color = resolvePointColor(status, tl);
  const glowing = status === "done" || status === "active";
  return (
    <div
      style={{
        width: PRESET_DOT_R * 2,
        height: PRESET_DOT_R * 2,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        boxShadow: glowing ? `0 0 0 3px ${color}28` : "none",
        transition: "background 0.25s, box-shadow 0.25s",
      }}
    />
  );
};
/* ── preset point shapes ──────────────────────────────────────────────────────────────────────────────────────────────────── */

/* ── TimelineNode (private) ───────────────────────────────────────────────────────────────────────────────────────────────── */
const TimelineNode = ({
  item,
  index,
  total,
  isExpanded,
  onToggle,
  prevStatus, // null for first item; used to color the top line segment
  disconnect_line,
  disconnect_gap,
  tl,
}) => {
  const { title, span, details, point, status = "pending" } = item;

  /* ── resolve point element ── */
  const pointEl = useMemo(() => {
    if (point === "start") return <DotStart tl={tl} />;
    if (point === "end") return <DotEnd status={status} tl={tl} />;
    if (point === "loading")
      return (
        <ArcSpinner
          size={LOADING_R * 2}
          stroke_width={2}
          color={tl.pointColor ?? "rgba(10,186,181,1)"}
        />
      );
    if (point != null && typeof point !== "string") return point;
    return <DotDefault status={status} tl={tl} />;
  }, [point, status, tl]);

  const topDisconnectGap = disconnect_line && index !== 0 ? disconnect_gap : 0;
  const bottomDisconnectGap =
    disconnect_line && index !== total - 1 ? disconnect_gap : 0;

  /* ── top-line height: aligns point center with first title-line center ── */
  const topLineH = Math.max(0, TITLE_CY - getPointRadius(point) - topDisconnectGap);

  /* ── line colors ── */
  const topLineColor =
    index === 0 || prevStatus === null
      ? "transparent"
      : resolveLineColor(prevStatus, tl);
  const bottomLineColor =
    index === total - 1 ? "transparent" : resolveLineColor(status, tl);

  const hasDetails = details != null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
      }}
    >
      {/* ══ Track column ══════════════════════════════════════════════════════ */}
      <div
        style={{
          width: TRACK_WIDTH,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* top line segment */}
        <div
          style={{
            width: LINE_WIDTH,
            height: topLineH,
            flexShrink: 0,
            background: topLineColor,
            transition: "background 0.3s",
          }}
        />
        {/* optional disconnection gap above point */}
        {topDisconnectGap > 0 && (
          <div
            style={{
              width: LINE_WIDTH,
              height: topDisconnectGap,
              flexShrink: 0,
            }}
          />
        )}
        {/* point */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {pointEl}
        </div>
        {/* optional disconnection gap below point */}
        {bottomDisconnectGap > 0 && (
          <div
            style={{
              width: LINE_WIDTH,
              height: bottomDisconnectGap,
              flexShrink: 0,
            }}
          />
        )}
        {/* bottom line segment — stretches to fill remaining node height */}
        <div
          style={{
            flex: "1 1 auto",
            width: LINE_WIDTH,
            minHeight: index === total - 1 ? 0 : 16,
            background: bottomLineColor,
            transition: "background 0.3s",
          }}
        />
      </div>

      {/* ══ Content column ════════════════════════════════════════════════════ */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          paddingLeft: 14,
          paddingBottom: index === total - 1 ? 4 : 22,
        }}
      >
        {/* title */}
        {title != null && (
          <div
            style={{
              fontSize: tl.titleFontSize ?? "14px",
              fontWeight: 500,
              color: tl.titleColor ?? "#222222",
              lineHeight: `${TITLE_LINE_H}px`,
              letterSpacing: "0.01em",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {title}
          </div>
        )}

        {/* span */}
        {span != null && (
          <div
            style={{
              fontSize: tl.fontSize ?? "13px",
              color: tl.spanColor ?? "rgba(0,0,0,0.45)",
              lineHeight: "18px",
              marginTop: title != null ? 2 : 0,
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            {span}
          </div>
        )}

        {/* see details toggle button */}
        {hasDetails && (
          <button
            onClick={onToggle}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              marginTop: 6,
              padding: "0",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: tl.fontSize ?? "13px",
              color: tl.seeDetailsColor ?? "rgba(10,186,181,1)",
              fontFamily: "inherit",
              letterSpacing: "0.01em",
              outline: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.75";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            {isExpanded ? "Hide details" : "See details"}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              style={{
                transition: "transform 0.22s cubic-bezier(0.32,1,0.32,1)",
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                flexShrink: 0,
              }}
            >
              <path
                d="M2 3.5 L5 6.5 L8 3.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* animated details content */}
        {hasDetails && (
          <AnimatedChildren open={isExpanded}>
            <div
              style={{
                marginTop: 8,
                padding: "10px 12px",
                borderRadius: 8,
                background: tl.detailsBackground ?? "rgba(0,0,0,0.025)",
                fontSize: tl.fontSize ?? "13px",
                color: tl.spanColor ?? "rgba(0,0,0,0.45)",
              }}
            >
              {details}
            </div>
          </AnimatedChildren>
        )}
      </div>
    </div>
  );
};
/* ── TimelineNode (private) ───────────────────────────────────────────────────────────────────────────────────────────────── */

/* ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Timeline
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
   Props
   ─────
   items                  {Array}     Array of item objects (see below)
   expanded_indices       {number[]}  Controlled: which indices are expanded.  Opt in by passing this prop.
   default_expanded_indices {number[]} Uncontrolled initial expanded indices.  Defaults to [].
   on_expand_change       {Function}  Called with the new indices array on every toggle.
   visible_indices        {number[]}  Restrict visible nodes to these original item indices.
   node_filter            {Function}  (item, index, items) => boolean. Return false to hide this node.
   disconnect_line        {boolean}   Add a gap around points so connector lines do not touch the node marker.
   disconnect_gap         {number}    Gap size in px when disconnect_line=true. Defaults to 6.
   style                  {object}    Style override for the root container.

   Item shape
   ──────────
   {
     title   : string | ReactNode          — main label (aligned with the point)
     span    : string | ReactNode          — secondary text / timestamp
     details : ReactNode                   — collapsible content; enables "See details" button
     point   : "start"|"end"|"loading"|ReactNode  — custom point marker; omit for default dot
     status  : "done"|"active"|"pending"   — drives line + dot color; defaults to "pending"
   }
   ════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════ */
const Timeline = ({
  items = [],
  expanded_indices,
  default_expanded_indices = [],
  on_expand_change = () => {},
  visible_indices,
  node_filter,
  disconnect_line = false,
  disconnect_gap = 6,
  style,
}) => {
  const { theme } = useContext(ConfigContext);
  const tl = useMemo(() => theme?.timeline ?? {}, [theme]);

  /* ── controlled / uncontrolled expanded state ── */
  const isControlled = expanded_indices !== undefined;

  const [internalExpanded, setInternalExpanded] = useState(
    () => new Set(default_expanded_indices),
  );

  const expandedSet = useMemo(
    () => (isControlled ? new Set(expanded_indices) : internalExpanded),
    [isControlled, expanded_indices, internalExpanded],
  );

  const handleToggle = useCallback(
    (index) => {
      const next = new Set(expandedSet);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      const arr = [...next].sort((a, b) => a - b);
      if (!isControlled) setInternalExpanded(next);
      on_expand_change(arr);
    },
    [expandedSet, isControlled, on_expand_change],
  );

  const visibleIndexSet = useMemo(() => {
    if (!Array.isArray(visible_indices)) return null;
    return new Set(visible_indices.filter((index) => Number.isInteger(index)));
  }, [visible_indices]);

  const visibleItems = useMemo(() => {
    return items
      .map((item, originalIndex) => ({ item, originalIndex }))
      .filter(({ item, originalIndex }) => {
        if (visibleIndexSet && !visibleIndexSet.has(originalIndex)) return false;
        if (typeof node_filter === "function") {
          return node_filter(item, originalIndex, items);
        }
        return true;
      });
  }, [items, node_filter, visibleIndexSet]);

  const safeDisconnectGap = useMemo(() => {
    const n = Number(disconnect_gap);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }, [disconnect_gap]);

  if (!visibleItems.length) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", ...style }}>
      {visibleItems.map(({ item, originalIndex }, i) => {
        const prevVisibleItem = i > 0 ? visibleItems[i - 1].item : null;
        return (
          <TimelineNode
            key={originalIndex}
            item={item}
            index={i}
            total={visibleItems.length}
            isExpanded={expandedSet.has(originalIndex)}
            onToggle={() => handleToggle(originalIndex)}
            prevStatus={prevVisibleItem ? (prevVisibleItem.status ?? "pending") : null}
            disconnect_line={disconnect_line}
            disconnect_gap={safeDisconnectGap}
            tl={tl}
          />
        );
      })}
    </div>
  );
};

export default Timeline;
