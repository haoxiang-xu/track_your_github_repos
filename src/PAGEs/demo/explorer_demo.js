import { useContext, useState, useCallback } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Explorer from "../../BUILTIN_COMPONENTs/explorer/explorer";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const SAMPLE_TREE = [
  {
    id: "src",
    label: "src",
    prefix_icon: "draft",
    children: [
      {
        id: "components",
        label: "components",
        prefix_icon: "draft",
        children: [
          {
            id: "button.js",
            label: "button.js",
            postfix: "2.1 KB",
          },
          {
            id: "input.js",
            label: "input.js",
            postfix: "1.8 KB",
          },
          {
            id: "explorer.js",
            label: "explorer.js",
            postfix: "5.4 KB",
          },
          {
            id: "segmented_button_with_a_very_long_name.js",
            label: "segmented_button_with_a_very_long_name.js",
            postfix: "3.2 KB",
          },
        ],
      },
      {
        id: "pages",
        label: "pages",
        prefix_icon: "draft",
        children: [
          { id: "home.js", label: "home.js" },
          { id: "about.js", label: "about.js" },
          {
            id: "settings",
            label: "settings",
            prefix_icon: "settings",
            children: [
              { id: "general.js", label: "general.js" },
              { id: "profile.js", label: "profile.js" },
              { id: "security.js", label: "security.js" },
            ],
          },
        ],
      },
      { id: "app.js", label: "App.js", prefix_icon: "home" },
      { id: "index.js", label: "index.js" },
    ],
  },
  {
    id: "public",
    label: "public",
    prefix_icon: "draft",
    children: [
      { id: "index.html", label: "index.html" },
      { id: "favicon.ico", label: "favicon.ico" },
    ],
  },
  { id: "package.json", label: "package.json", prefix_icon: "link" },
  { id: "README.md", label: "README.md", prefix_icon: "edit" },
];

const ExplorerDemo = () => {
  const { theme } = useContext(ConfigContext);
  const color = theme?.color || "black";

  const [treeData, setTreeData] = useState(SAMPLE_TREE);

  const handleReorder = useCallback((newData) => {
    setTreeData(newData);
  }, []);

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
      <span
        style={{
          width: "100%",
          textAlign: "left",
          fontSize: "48px",
          fontFamily: "Jost",
          color,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        Explorer
      </span>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* ── Basic tree ────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontFamily: "Jost, sans-serif",
              color,
              opacity: 0.5,
            }}
          >
            Default
          </span>
          <Explorer
            data={SAMPLE_TREE}
            default_expanded={["src", "components"]}
            style={{ width: 240 }}
          />
        </div>

        {/* ── Fully expanded ────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontSize: 13,
              fontFamily: "Jost, sans-serif",
              color,
              opacity: 0.5,
            }}
          >
            Expanded + Draggable
          </span>
          <Explorer
            data={treeData}
            default_expanded={true}
            draggable
            on_reorder={handleReorder}
            style={{ width: 280 }}
          />
        </div>
      </div>
    </div>
  );
};

export default ExplorerDemo;
