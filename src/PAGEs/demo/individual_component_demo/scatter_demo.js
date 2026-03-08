import { useCallback, useContext, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import { Scatter } from "../../../BUILTIN_COMPONENTs/scatter";
import SegmentedButton from "../../../BUILTIN_COMPONENTs/input/segmented_button";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Mock data  —  simulates UMAP-projected chat memory chunks             */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const seeded = (seed) => {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
};

const CLUSTERS = [
  {
    group: "code",
    cx: -0.55, cy:  0.50,
    spread: 0.22,
    snippets: [
      "Implemented async pagination with cursor-based navigation",
      "Fixed memory leak in WebSocket connection cleanup",
      "Refactored auth middleware to support OAuth2 flows",
      "Added rate limiting with sliding window algorithm",
      "Optimized SQL query using composite index on (user_id, created_at)",
      "Wrote unit tests for edge cases in the parser module",
      "Debugged race condition in concurrent file uploads",
      "Set up GitHub Actions CI pipeline with caching",
      "Migrated from class components to hooks",
      "Implemented retry logic with exponential backoff",
      "Created custom hook for debounced search input",
      "Added TypeScript strict mode to the project",
      "Resolved circular dependency in the module graph",
      "Profiled render performance and reduced rerenders by 40%",
      "Extracted shared validation logic into a utility library",
    ],
  },
  {
    group: "conversation",
    cx:  0.55, cy:  0.50,
    spread: 0.20,
    snippets: [
      "Discussed project timeline and sprint goals with the team",
      "Reviewed feedback on the onboarding flow redesign",
      "Agreed to use Figma for design handoff going forward",
      "Explored pros and cons of monorepo vs polyrepo approach",
      "Talked through API versioning strategy for v3",
      "Debated whether to adopt GraphQL or stick with REST",
      "Aligned on naming conventions for new service endpoints",
      "Discussed user research findings from recent interviews",
      "Planned the Q2 roadmap with stakeholders",
      "Resolved disagreement on error handling philosophy",
      "Scheduled architecture review for the payment module",
      "Clarified requirements for the notification system",
      "Agreed on accessibility targets (WCAG 2.1 AA)",
      "Discussed mobile-first vs responsive-first strategy",
    ],
  },
  {
    group: "facts",
    cx: -0.55, cy: -0.50,
    spread: 0.21,
    snippets: [
      "React 19 introduces the new use() hook for async resources",
      "WebAssembly can run at near-native speed in modern browsers",
      "HTTP/3 uses QUIC instead of TCP for reduced latency",
      "CSS container queries allow component-level responsive design",
      "V8 engine uses hidden classes to optimize object property access",
      "TLS 1.3 reduces handshake round-trips from 2 to 1",
      "IndexedDB can store structured data up to browser quota limits",
      "Service Workers intercept network requests for offline support",
      "CRDT structures enable conflict-free distributed state merging",
      "WebRTC uses ICE/STUN/TURN for NAT traversal",
      "LSM trees optimize write throughput at the cost of read amplification",
      "Bloom filters trade false positives for space efficiency",
      "Git objects are content-addressed SHA-1 hashes",
      "CORS preflight requests use the OPTIONS method",
    ],
  },
  {
    group: "tasks",
    cx:  0.55, cy: -0.50,
    spread: 0.19,
    snippets: [
      "Write migration script for the legacy user table",
      "Update dependencies flagged in the security audit",
      "Add dark mode support to the settings page",
      "Investigate slow cold start times on Lambda functions",
      "Document the internal plugin API for third-party devs",
      "Set up Sentry error tracking in the staging environment",
      "Create end-to-end tests for the checkout flow",
      "Review open PRs before the Friday release freeze",
      "Archive deprecated API endpoints after the v2 sunset",
      "Onboard two new engineers to the codebase",
      "Benchmark database query performance under load",
      "Consolidate duplicate utility functions across packages",
      "Ship the CSV export feature by end of sprint",
    ],
  },
  {
    group: "creative",
    cx:  0.00, cy:  0.72,
    spread: 0.18,
    snippets: [
      "Brainstormed names for the new AI assistant feature",
      "Drafted copy for the product launch landing page",
      "Designed an animation concept for the loading state",
      "Wrote a blog post about building with local LLMs",
      "Explored color palettes for the rebrand",
      "Came up with metaphors for explaining vector search to users",
      "Sketched a comic strip for the company newsletter",
      "Ideated on gamification mechanics for the onboarding flow",
      "Wrote a short story about a developer and their rubber duck",
      "Generated tagline variations for the summer campaign",
      "Designed a custom icon set for the settings panel",
    ],
  },
  {
    group: "technical",
    cx:  0.00, cy: -0.72,
    spread: 0.20,
    snippets: [
      "Evaluated pgvector vs Qdrant for production embedding search",
      "Researched chunking strategies for long-document RAG pipelines",
      "Compared HNSW and IVF-Flat index types for recall vs latency",
      "Studied attention mechanism scaling laws in transformer models",
      "Analyzed memory footprint of different embedding model sizes",
      "Reviewed UMAP vs t-SNE for interactive vector visualization",
      "Benchmarked cosine similarity vs dot product for search accuracy",
      "Explored hybrid search combining BM25 with dense retrieval",
      "Investigated context window utilization patterns in long chats",
      "Compared quantization methods: int8 vs fp16 vs GGUF",
      "Studied retrieval-augmented generation evaluation metrics",
      "Reviewed LangChain memory modules and their persistence models",
      "Analyzed token budget allocation strategies for multi-turn agents",
    ],
  },
];

function generate_mock_points() {
  const rand = seeded(42);
  const points = [];
  let id_counter = 0;

  for (const cluster of CLUSTERS) {
    for (const snippet of cluster.snippets) {
      points.push({
        id:      `mem_${id_counter++}`,
        x:       cluster.cx + (rand() - 0.5) * cluster.spread * 2,
        y:       cluster.cy + (rand() - 0.5) * cluster.spread * 2,
        group:   cluster.group,
        label:   snippet.length > 48 ? snippet.slice(0, 46) + "…" : snippet,
        content: snippet,
      });
    }
  }

  return points;
}

const MOCK_POINTS = generate_mock_points();

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Demo                                                                   */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const COLOR_BY_OPTIONS = ["group", "index"];

const ScatterDemo = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark    = onThemeMode === "dark_mode";
  const color     = theme?.color     || "#222";
  const fontFamily = theme?.font?.fontFamily || "Jost";

  const [color_by,      set_color_by]      = useState("group");
  const [selected_point, set_selected_point] = useState(null);

  const on_click = useCallback((pt) => {
    set_selected_point(pt);
  }, []);

  /* index-based color: gradient from blue → pink across all points */
  const color_fn = useCallback(
    (pt) => {
      const idx = MOCK_POINTS.findIndex((p) => p.id === pt.id);
      const t   = idx / Math.max(1, MOCK_POINTS.length - 1);
      return [
        0.15 + t * 0.75,
        0.22 + (1 - t) * 0.35,
        0.85 - t * 0.45,
      ];
    },
    [],
  );

  const active_color_by = color_by === "index" ? color_fn : "group";

  const meta_color = isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)";
  const card_bg    = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";
  const card_border = isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.06)";

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        padding: "10px",
      }}
    >
      {/* ── Section title ── */}
      <span
        style={{
          width: "100%",
          textAlign: "left",
          fontSize: "48px",
          fontFamily,
          color,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        Scatter
      </span>

      {/* ── Controls bar ── */}
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontFamily,
            color,
            opacity: 0.45,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          Color by
        </span>
        <SegmentedButton
          options={COLOR_BY_OPTIONS}
          value={color_by}
          on_change={set_color_by}
          style={{ fontSize: 12, borderRadius: 7, padding: 2, gap: 2 }}
          button_style={{ padding: "3px 12px" }}
        />
      </div>

      {/* ── Main canvas ── */}
      <div style={{ width: "100%", height: 480, borderRadius: 12, overflow: "hidden" }}>
        <Scatter
          points={MOCK_POINTS}
          color_by={active_color_by}
          point_size={9}
          show_legend={color_by === "group"}
          on_point_click={on_click}
        />
      </div>

      {/* ── Selected point detail card ── */}
      {selected_point ? (
        <div
          style={{
            width: "100%",
            backgroundColor: card_bg,
            border: card_border,
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontFamily: "Menlo, Monaco, Consolas, monospace",
                color: meta_color,
              }}
            >
              {selected_point.id}
            </span>
            {selected_point.group && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily,
                  color: meta_color,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  background: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
                  borderRadius: 4,
                  padding: "2px 7px",
                }}
              >
                {selected_point.group}
              </span>
            )}
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              fontFamily,
              color,
              lineHeight: 1.55,
            }}
          >
            {selected_point.content}
          </p>
        </div>
      ) : (
        <div
          style={{
            width: "100%",
            fontSize: 13,
            fontFamily,
            color,
            opacity: 0.28,
            userSelect: "none",
            WebkitUserSelect: "none",
            lineHeight: 1.6,
          }}
        >
          Scroll to zoom &nbsp;•&nbsp; Drag to pan &nbsp;•&nbsp; Click a point to inspect its content
        </div>
      )}
    </div>
  );
};

export { ScatterDemo as default };
