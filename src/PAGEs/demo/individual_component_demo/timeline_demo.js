import { useContext, useState } from "react";

/* { Contexts } ----------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } ----------------------------------------------------------------------------------------------------------- */

/* { Components } --------------------------------------------------------------------------------------------------------- */
import Timeline from "../../../BUILTIN_COMPONENTs/timeline/timeline";
import { Slider } from "../../../BUILTIN_COMPONENTs/input/slider";
import { CustomizedTooltip } from "../demo";
/* { Components } --------------------------------------------------------------------------------------------------------- */

/* ── shared demo wrapper ── */
const DemoCard = ({ children }) => {
  const { theme } = useContext(ConfigContext);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "20px 24px",
        borderRadius: 12,
        border: `1px solid ${theme?.modal?.border ?? "rgba(0,0,0,0.07)"}`,
        background: "transparent",
        flex: "1 1 0",
        minWidth: 220,
      }}
    >
      {children}
    </div>
  );
};

const DemoLabel = ({ children }) => {
  const { theme } = useContext(ConfigContext);
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: theme?.timeline?.spanColor ?? "rgba(0,0,0,0.35)",
        marginBottom: 8,
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      {children}
    </div>
  );
};

const FILTERABLE_TIMELINE_ITEMS = [
  {
    title: "Start",
    span: "Workflow started",
    status: "done",
    point: "start",
  },
  {
    title: "Node A",
    span: "Requirements synced",
    status: "done",
  },
  {
    title: "Current node",
    span: "Running model inference",
    status: "active",
    point: "loading",
  },
  {
    title: "Node B",
    span: "Waiting for approval",
    status: "pending",
  },
  {
    title: "End",
    span: "Final output",
    status: "pending",
    point: "end",
  },
];

/* ─────────────────────────────────────────────────────────────────────────── */

const TimelineDemo = () => {
  const { theme } = useContext(ConfigContext);

  /* controlled demo state */
  const [controlledExpanded, setControlledExpanded] = useState([0]);
  const [selectedNodeIndices, setSelectedNodeIndices] = useState([0, 2, 4]);
  const [disconnectLine, setDisconnectLine] = useState(true);
  const [disconnectGap, setDisconnectGap] = useState(8);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "10px",
      }}
    >
      {/* ── Section heading ── */}
      <span
        style={{
          textAlign: "left",
          fontSize: "48px",
          fontFamily: "Jost",
          color: theme?.color || "black",
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        Timeline
      </span>

      {/* ── Demo cards row ── */}
      <div
        className="scrollable"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          gap: "24px",
          overflowX: "auto",
          paddingBottom: "8px",
        }}
      >
        {/* ══ 1. Basic — title + span ══════════════════════════════════════════ */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Timeline
  items={[
    { title: "Order placed",    span: "25 Jan 2023, 16:28",  status: "done" },
    { title: "Payment verified",span: "25 Jan 2023, 16:30",  status: "done" },
    { title: "Processing",      span: "25 Jan 2023, 16:31",  status: "active" },
    { title: "Delivery",        span: "Estimated 27 Jan",    status: "pending" },
  ]}
/>
\`\`\`
        `}
        >
          <DemoCard>
            <DemoLabel>Basic</DemoLabel>
            <Timeline
              items={[
                {
                  title: "Order placed",
                  span: "25 Jan 2023, 16:28",
                  status: "done",
                },
                {
                  title: "Payment verified",
                  span: "25 Jan 2023, 16:30",
                  status: "done",
                },
                {
                  title: "Processing",
                  span: "25 Jan 2023, 16:31",
                  status: "active",
                },
                {
                  title: "Delivery",
                  span: "Estimated 27 Jan",
                  status: "pending",
                },
              ]}
            />
          </DemoCard>
        </CustomizedTooltip>

        {/* ══ 2. With "See details" ════════════════════════════════════════════ */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Timeline
  default_expanded_indices={[2]}
  items={[
    {
      title: "Request",
      span: "25 Jan 2023, 16:30:40",
      status: "done",
      point: "start",
      details: "POST /api/payments  —  200 OK",
    },
    {
      title: "3DS raised due to pre-auth fraud check",
      span: "25 Jan 2023, 16:30:42",
      status: "done",
    },
    {
      title: "3DS challenge issued",
      span: "25 Jan 2023, 16:30:42",
      status: "active",
      details: (
        <span>A 3DS challenge has been issued.<br/>Waiting for the user to complete.</span>
      ),
    },
    {
      title: "Waiting",
      span: "25 Jan 2023, 16:30:43",
      status: "pending",
      point: "loading",
    },
  ]}
/>
\`\`\`
        `}
        >
          <DemoCard>
            <DemoLabel>See details</DemoLabel>
            <Timeline
              default_expanded_indices={[2]}
              items={[
                {
                  title: "Request",
                  span: "25 Jan 2023, 16:30:40",
                  status: "done",
                  point: "start",
                  details: "POST /api/payments  ·  200 OK",
                },
                {
                  title: "3DS raised due to pre-auth fraud check",
                  span: "25 Jan 2023, 16:30:42",
                  status: "done",
                },
                {
                  title: "3DS challenge issued",
                  span: "25 Jan 2023, 16:30:42",
                  status: "active",
                  details: (
                    <span>
                      A 3DS challenge has been issued.
                      <br />
                      Waiting for the user to complete.
                    </span>
                  ),
                },
                {
                  title: "Waiting",
                  span: "25 Jan 2023, 16:30:43",
                  status: "pending",
                  point: "loading",
                },
              ]}
            />
          </DemoCard>
        </CustomizedTooltip>

        {/* ══ 3. Preset points ════════════════════════════════════════════════ */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Timeline
  items={[
    { title: "Start",   status: "done",    point: "start"   },
    { title: "Step 1",  status: "done"                      },
    { title: "Loading", status: "active",  point: "loading" },
    { title: "Step 3",  status: "pending"                   },
    { title: "End",     status: "pending", point: "end"     },
  ]}
/>
\`\`\`
        `}
        >
          <DemoCard>
            <DemoLabel>Preset points</DemoLabel>
            <Timeline
              items={[
                { title: "Start", status: "done", point: "start" },
                { title: "Step 1", status: "done" },
                { title: "Loading", status: "active", point: "loading" },
                { title: "Step 3", status: "pending" },
                { title: "End", status: "pending", point: "end" },
              ]}
            />
          </DemoCard>
        </CustomizedTooltip>

        {/* ══ 4. Node visibility + line break control ═════════════════════════ */}
        <CustomizedTooltip
          code={`
\`\`\`js
const [visibleNodeIndices, setVisibleNodeIndices] = useState([0, 2, 4]); // start + current + end
const [disconnectLine, setDisconnectLine] = useState(true);
const [disconnectGap, setDisconnectGap] = useState(8);

<Timeline
  items={FILTERABLE_TIMELINE_ITEMS}
  visible_indices={visibleNodeIndices}
  disconnect_line={disconnectLine}
  disconnect_gap={disconnectGap}
/>

<Slider
  value={disconnectGap}
  set_value={setDisconnectGap}
  min={0}
  max={20}
  step={1}
  disabled={!disconnectLine}
/>
\`\`\`
        `}
        >
          <DemoCard>
            <DemoLabel>Node filter + line break</DemoLabel>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 10,
              }}
            >
              {FILTERABLE_TIMELINE_ITEMS.map((item, i) => {
                const active = selectedNodeIndices.includes(i);
                return (
                  <button
                    key={`${item.title}-${i}`}
                    onClick={() => {
                      setSelectedNodeIndices((prev) => {
                        const next = prev.includes(i)
                          ? prev.filter((x) => x !== i)
                          : [...prev, i];
                        return next.sort((a, b) => a - b);
                      });
                    }}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      border: `1px solid ${active ? "rgba(10,186,181,0.7)" : "rgba(0,0,0,0.12)"}`,
                      background: active
                        ? "rgba(10,186,181,0.10)"
                        : "transparent",
                      color: active
                        ? "rgba(10,186,181,1)"
                        : (theme?.timeline?.spanColor ?? "rgba(0,0,0,0.45)"),
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.18s",
                    }}
                  >
                    {active ? "✓" : "○"} {item.title}
                  </button>
                );
              })}
              <button
                onClick={() => setSelectedNodeIndices([0, 2, 4])}
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: "1px dashed rgba(10,186,181,0.45)",
                  background: "transparent",
                  color: "rgba(10,186,181,1)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Preset: start + current + end
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 8,
              }}
            >
              <button
                onClick={() => setDisconnectLine((prev) => !prev)}
                style={{
                  padding: "3px 10px",
                  borderRadius: 20,
                  border: `1px solid ${disconnectLine ? "rgba(10,186,181,0.7)" : "rgba(0,0,0,0.12)"}`,
                  background: disconnectLine
                    ? "rgba(10,186,181,0.10)"
                    : "transparent",
                  color: disconnectLine
                    ? "rgba(10,186,181,1)"
                    : (theme?.timeline?.spanColor ?? "rgba(0,0,0,0.45)"),
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Line break: {disconnectLine ? "ON" : "OFF"}
              </button>
              <span
                style={{
                  fontSize: 12,
                  color: theme?.timeline?.spanColor ?? "rgba(0,0,0,0.45)",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                }}
              >
                Gap: {disconnectGap}px
              </span>
              <Slider
                value={disconnectGap}
                set_value={setDisconnectGap}
                min={0}
                max={20}
                step={1}
                disabled={!disconnectLine}
                show_tooltip={false}
                label_format={(value) => `${value}px`}
                style={{
                  width: 140,
                  height: 20,
                  gapWidth: 18,
                  trackThickness: 2,
                  thumbSize: 10,
                  fontSize: 10,
                }}
              />
            </div>

            {selectedNodeIndices.length > 0 ? (
              <Timeline
                items={FILTERABLE_TIMELINE_ITEMS}
                visible_indices={selectedNodeIndices}
                disconnect_line={disconnectLine}
                disconnect_gap={disconnectGap}
              />
            ) : (
              <div
                style={{
                  fontSize: 12,
                  color: theme?.timeline?.spanColor ?? "rgba(0,0,0,0.45)",
                  lineHeight: "18px",
                }}
              >
                No visible node selected.
              </div>
            )}
          </DemoCard>
        </CustomizedTooltip>

        {/* ══ 5. Externally controlled expansion ══════════════════════════════ */}
        <CustomizedTooltip
          code={`
\`\`\`js
const [expanded, setExpanded] = useState([0]);

<Timeline
  expanded_indices={expanded}
  on_expand_change={setExpanded}
  items={[ ... ]}
/>
\`\`\`
        `}
        >
          <DemoCard>
            <DemoLabel>Controlled</DemoLabel>
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              {[0, 1, 2].map((i) => {
                const active = controlledExpanded.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setControlledExpanded((prev) =>
                        prev.includes(i)
                          ? prev.filter((x) => x !== i)
                          : [...prev, i],
                      );
                    }}
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      border: `1px solid ${active ? "rgba(10,186,181,0.7)" : "rgba(0,0,0,0.12)"}`,
                      background: active
                        ? "rgba(10,186,181,0.10)"
                        : "transparent",
                      color: active
                        ? "rgba(10,186,181,1)"
                        : (theme?.timeline?.spanColor ?? "rgba(0,0,0,0.45)"),
                      fontSize: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.18s",
                    }}
                  >
                    {active ? "▾" : "▸"} Node {i + 1}
                  </button>
                );
              })}
            </div>
            <Timeline
              expanded_indices={controlledExpanded}
              on_expand_change={setControlledExpanded}
              items={[
                {
                  title: "Authentication",
                  span: "Token issued at 09:00",
                  status: "done",
                  details: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
                {
                  title: "Data fetch",
                  span: "GET /api/data",
                  status: "done",
                  details: '{ "records": 142, "page": 1, "total": 3 }',
                },
                {
                  title: "Processing",
                  span: "Running pipeline",
                  status: "active",
                  point: "loading",
                  details: "Step 2 of 5 — normalising records",
                },
              ]}
            />
          </DemoCard>
        </CustomizedTooltip>
      </div>
    </div>
  );
};

export default TimelineDemo;
