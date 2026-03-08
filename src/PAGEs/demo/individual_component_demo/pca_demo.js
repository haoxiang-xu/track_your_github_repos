import { useCallback, useContext, useMemo, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import { PCAScatter, usePCA } from "../../../BUILTIN_COMPONENTs/pca";
import SegmentedButton from "../../../BUILTIN_COMPONENTs/input/segmented_button";
import Slider from "../../../BUILTIN_COMPONENTs/input/slider";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Synthetic embedding generator                                          */
/*                                                                         */
/*  Simulates UMAP/embedding vectors from a chat memory system:           */
/*   - Each cluster = a topic the user talked about in one conversation   */
/*   - Cluster centroids are well-separated in high-dim space             */
/*   - Each point = one Q&A turn, with realistic noise around centroid    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const CLUSTER_DEFS = [
  {
    group: "code",
    color_hint: "#2563eb",
    turns: [
      "How do I implement a binary search tree in JavaScript?",
      "Fix the memory leak in my event listener cleanup",
      "Refactor this class component to use hooks",
      "Optimize this SQL query — it's running in 4s on 1M rows",
      "Why is my async function not awaiting properly?",
      "Add retry logic with exponential backoff to this fetch",
      "Set up ESLint and Prettier for this monorepo",
      "Explain the difference between == and === in JS",
      "How do I debounce a search input in React?",
      "Convert this callback hell to async/await",
      "Write unit tests for this validation helper",
      "How do I prevent SQL injection in this raw query?",
      "Reduce re-renders in this list component",
      "Set up GitHub Actions CI with pnpm caching",
      "Explain what a closure is with a real example",
      "Migrate from CRA to Vite without breaking things",
      "Why does this useState not update immediately?",
      "Implement drag-and-drop sorting with dnd-kit",
      "Add dark mode to this Tailwind app",
      "How do I profile performance in React DevTools?",
    ],
  },
  {
    group: "conversation",
    color_hint: "#22c55e",
    turns: [
      "What should I have for dinner tonight?",
      "Can you recommend a good podcast for learning Spanish?",
      "Help me write a birthday message for my coworker",
      "What are the pros and cons of remote work?",
      "How do I politely decline a meeting invitation?",
      "Write a short introduction email to my new team",
      "What's a good gift for someone who likes cooking?",
      "Help me rephrase this feedback to sound less harsh",
      "What questions should I ask in a job interview?",
      "How do I deal with imposter syndrome at work?",
      "Write a thank-you note after a client meeting",
      "What are some good icebreakers for a team lunch?",
      "Help me plan a weekend trip for two people",
      "How should I structure a difficult conversation with my manager?",
      "What's the best way to negotiate a salary?",
      "Draft an apology email for missing a deadline",
      "Recommend a movie for a quiet Friday night",
      "Write a LinkedIn summary for a software engineer",
    ],
  },
  {
    group: "technical",
    color_hint: "#8b5cf6",
    turns: [
      "Explain how vector databases work under the hood",
      "What's the difference between HNSW and IVF-Flat indexes?",
      "How does attention mechanism work in transformers?",
      "What is RAG and when should I use it?",
      "Explain cosine similarity vs dot product for search",
      "How do I choose the right chunk size for RAG?",
      "What is quantization and how does it reduce model size?",
      "Explain the difference between fine-tuning and RAG",
      "How does UMAP preserve local structure in 2D projections?",
      "What are the tradeoffs between PCA and t-SNE for visualization?",
      "How does BM25 compare to dense retrieval?",
      "Explain the sliding window attention pattern",
      "What is a KV cache and why does it matter for inference?",
      "How do LLMs handle tokenization for non-English languages?",
      "What is LoRA and how does it enable efficient fine-tuning?",
      "Explain how beam search differs from greedy decoding",
      "What is embedding drift and how do I detect it?",
      "How does the RLHF training process work at a high level?",
    ],
  },
  {
    group: "tasks",
    color_hint: "#f59e0b",
    turns: [
      "Write a Python script to rename files by date created",
      "Create a cron job that runs every Monday at 9am",
      "Generate a weekly report template in Markdown",
      "Write a bash script to back up my project folders",
      "Create a checklist for launching a new product feature",
      "Write SQL to find duplicate records in a users table",
      "Draft a project status update for stakeholders",
      "Create a template for writing engineering RFCs",
      "Write a script to parse CSV and output JSON",
      "Generate a test matrix for browser compatibility",
      "Create a structured onboarding doc for new engineers",
      "Write a Makefile for this Python project",
      "Draft a postmortem template after an incident",
      "Create a simple budget tracker in a spreadsheet formula",
      "Write a regex to validate email addresses",
      "Generate mock API response data in JSON",
      "Write a Docker Compose file for a Flask + Redis app",
    ],
  },
  {
    group: "creative",
    color_hint: "#ec4899",
    turns: [
      "Write a short story about an AI that forgets everything",
      "Generate five tagline options for a productivity app",
      "Write a haiku about debugging at 2am",
      "Create names for a new developer tool that handles logs",
      "Write a satirical blog post about yet another JS framework",
      "Come up with metaphors to explain machine learning to a 10-year-old",
      "Write a poem about the feeling of finally fixing a bug",
      "Generate a fun bio for my GitHub profile",
      "Write a brief fairy tale where the hero is a rubber duck",
      "Create three different product descriptions for the same feature",
      "Write a motivational speech for a team that just shipped something",
      "Brainstorm 10 names for a startup that builds AI memory tools",
      "Write a short comic strip script about a developer and their linter",
      "Create a fictional error message that is both helpful and poetic",
    ],
  },
  {
    group: "facts",
    color_hint: "#06b6d4",
    turns: [
      "What is the capital of New Zealand?",
      "How does photosynthesis work?",
      "What causes the Northern Lights?",
      "How many bones are in the human body?",
      "What is the speed of light in a vacuum?",
      "Who invented the World Wide Web?",
      "What's the difference between a hurricane and a typhoon?",
      "How do vaccines train the immune system?",
      "What is the Dunning-Kruger effect?",
      "Why does the sky appear blue?",
      "What is the largest prime number currently known?",
      "How does GPS determine your location?",
      "What is the difference between machine learning and AI?",
      "How do noise-cancelling headphones work?",
      "What causes a sonic boom?",
    ],
  },
];

function generate_embeddings(dim, noise, seed_offset = 0) {
  /* Generate a random unit-ish centroid for each cluster */
  const centroids = CLUSTER_DEFS.map((_, ci) => {
    const r = seeded(ci * 1000 + seed_offset + 1);
    return Array.from({ length: dim }, () => (r() - 0.5) * 3);
  });

  const vectors = [];
  const metadata = [];

  for (let ci = 0; ci < CLUSTER_DEFS.length; ci++) {
    const def = CLUSTER_DEFS[ci];
    const c = centroids[ci];
    const r = seeded(ci * 777 + seed_offset + 2);

    for (let pi = 0; pi < def.turns.length; pi++) {
      const vec = c.map((v) => v + (r() - 0.5) * noise * 2);
      vectors.push(vec);
      metadata.push({
        id: `${def.group}_${pi}`,
        group: def.group,
        label: def.turns[pi].slice(0, 50) + (def.turns[pi].length > 50 ? "…" : ""),
        content: def.turns[pi],
      });
    }
  }

  return { vectors, metadata };
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Live hook demo — lets us inspect { points, variance } directly        */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const COLOR_BY_OPTIONS = ["group", "index"];

function PCADemoInner({ vectors, metadata, dim, noise }) {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const color = theme?.color || "#222";
  const fontFamily = theme?.font?.fontFamily || "Jost";

  const [color_by, set_color_by] = useState("group");
  const [selected, set_selected] = useState(null);

  /* index-based colour — shows chronological / positional gradient */
  const color_fn = useCallback(
    (pt) => {
      const idx = metadata.findIndex((m) => m.id === pt.id);
      const t = idx / Math.max(1, metadata.length - 1);
      return [0.1 + t * 0.8, 0.3 + (1 - t) * 0.4, 0.9 - t * 0.5];
    },
    [metadata],
  );

  const { variance } = usePCA(vectors, metadata);

  const meta_color = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  const tag_bg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const card_bg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";
  const card_border = isDark
    ? "1px solid rgba(255,255,255,0.06)"
    : "1px solid rgba(0,0,0,0.06)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
      }}
    >
      {/* ── Controls ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
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

        {/* Stats */}
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 12,
            alignItems: "center",
          }}
        >
          {[
            { label: "dims", value: dim },
            { label: "points", value: vectors.length },
            { label: "PC1", value: `${(variance[0] * 100).toFixed(1)}%` },
            { label: "PC2", value: `${(variance[1] * 100).toFixed(1)}%` },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "Menlo, Monaco, Consolas, monospace",
                  color: meta_color,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "Menlo, Monaco, Consolas, monospace",
                  color,
                  opacity: 0.7,
                }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Canvas ── */}
      <div
        style={{ width: "100%", height: 480, borderRadius: 12, overflow: "hidden" }}
      >
        <PCAScatter
          vectors={vectors}
          metadata={metadata}
          color_by={color_by === "index" ? color_fn : "group"}
          point_size={9}
          show_legend={color_by === "group"}
          show_variance={false} /* we show stats in the header row */
          on_point_click={set_selected}
        />
      </div>

      {/* ── Selected point detail ── */}
      {selected ? (
        <div
          style={{
            backgroundColor: card_bg,
            border: card_border,
            borderRadius: 10,
            padding: "14px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 7,
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
              {selected.id}
            </span>
            {selected.group && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily,
                  color: meta_color,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  background: tag_bg,
                  borderRadius: 4,
                  padding: "2px 7px",
                }}
              >
                {selected.group}
              </span>
            )}
            <span
              style={{
                fontSize: 10,
                fontFamily: "Menlo, Monaco, Consolas, monospace",
                color: meta_color,
                marginLeft: "auto",
              }}
            >
              ({selected.x?.toFixed(3)}, {selected.y?.toFixed(3)})
            </span>
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
            {selected.content}
          </p>
        </div>
      ) : (
        <div
          style={{
            fontSize: 13,
            fontFamily,
            color,
            opacity: 0.28,
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        >
          Scroll to zoom &nbsp;•&nbsp; Drag to pan &nbsp;•&nbsp; Click a
          point to inspect
        </div>
      )}
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  Demo wrapper — exposes dim + noise sliders                            */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const PCADemo = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const color = theme?.color || "#222";
  const fontFamily = theme?.font?.fontFamily || "Jost";

  const [dim, set_dim] = useState(64);
  const [noise, set_noise] = useState(1.2);
  const [seed, set_seed] = useState(0);

  const { vectors, metadata } = useMemo(
    () => generate_embeddings(dim, noise, seed),
    [dim, noise, seed],
  );

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
        PCA Scatter
      </span>

      {/* ── Description ── */}
      <p
        style={{
          margin: 0,
          width: "100%",
          fontSize: 13,
          fontFamily,
          color,
          opacity: 0.45,
          lineHeight: 1.65,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        High-dimensional vectors → PCA (pure JS, zero deps) → 2D scatter.
        Adjust dimensions and cluster noise to see how the projection changes.
        Simulates embedding vectors from a chat memory system.
      </p>

      {/* ── Sliders ── */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* Dimensions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{ fontSize: 12, fontFamily, color, opacity: 0.45, userSelect: "none" }}
          >
            Dimensions — {dim}
          </span>
          <Slider
            value={dim}
            set_value={set_dim}
            min={4}
            max={768}
            step={4}
            label_format={(v) => `${v}`}
            style={{ width: 200 }}
          />
        </div>

        {/* Noise */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{ fontSize: 12, fontFamily, color, opacity: 0.45, userSelect: "none" }}
          >
            Cluster noise — {noise.toFixed(1)}
          </span>
          <Slider
            value={noise}
            set_value={set_noise}
            min={0.1}
            max={4.0}
            step={0.1}
            label_format={(v) => v.toFixed(1)}
            style={{ width: 200 }}
          />
        </div>

        {/* Reseed button */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span
            style={{ fontSize: 12, fontFamily, color, opacity: 0.45, userSelect: "none" }}
          >
            Seed — {seed}
          </span>
          <Slider
            value={seed}
            set_value={set_seed}
            min={0}
            max={20}
            step={1}
            label_format={(v) => `${v}`}
            style={{ width: 140 }}
          />
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          width: "100%",
          height: 1,
          backgroundColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.06)",
        }}
      />

      {/* ── Inner demo ── */}
      <PCADemoInner
        vectors={vectors}
        metadata={metadata}
        dim={dim}
        noise={noise}
      />
    </div>
  );
};

export { PCADemo as default };
