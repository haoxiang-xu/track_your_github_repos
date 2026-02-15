import { useContext, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Card from "../../BUILTIN_COMPONENTs/card/card";
import AuroraBackground from "../../BUILTIN_COMPONENTs/background/aurora_background/aurora_background";
import GrainyBackground from "../../BUILTIN_COMPONENTs/background/grainy_background/grainy_background";
import Markdown from "../../BUILTIN_COMPONENTs/markdown/markdown";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* ---- helper: aurora card with inline code panel ---- */
const AuroraCard = ({ children, code, isDark, height = 200 }) => {
  const [hovered, setHovered] = useState(false);
  const codeHeight = height - 64; /* top 32 + bottom 32 */

  return (
    <Card
      width="100%"
      style={{ padding: 0, overflow: "hidden" }}
      body_style={{ padding: 0 }}
      max_tilt={0}
    >
      <div
        style={{ position: "relative", width: "100%", height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}

        {/* ---- code block: right 16, top 16, width 30% ---- */}
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            bottom: 24,
            width: "40%",
            opacity: hovered ? 1 : 0,
            transition:
              "opacity 0.28s cubic-bezier(0.32, 1, 0.32, 1), transform 0.28s cubic-bezier(0.32, 1, 0.32, 1)",
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          <Card
            width="100%"
            height="100%"
            style={{
              padding: 0,
              overflow: "hidden",
              margin: 0,
              backgroundColor: "transparent",
            }}
            max_tilt={0}
            body_style={{ padding: 0, height: "100%", overflow: "hidden" }}
          >
            <Markdown
              style={{
                pre: { margin: 0, height: codeHeight - 57 },
                code: {
                  padding: 0,
                  borderRadius: 7,
                  fontSize: 12,
                },
              }}
            >
              {`\`\`\`js\n${code}\n\`\`\``}
            </Markdown>
          </Card>
        </div>
      </div>
    </Card>
  );
};

const BackgroundDemo = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const color = theme?.color || "#222";
  const fontFamily = theme?.font?.fontFamily || "Jost";

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
      <span
        style={{
          width: "100%",
          textAlign: "left",
          fontSize: "48px",
          fontFamily,
          color,
          userSelect: "none",
        }}
      >
        Background
      </span>

      {/* ---- Aurora default ---- */}
      <AuroraCard isDark={isDark} code={`<AuroraBackground />`}>
        <AuroraBackground
          colors={
            isDark
              ? ["#6366f1", "#a855f7", "#06b6d4", "#ec4899", "#10b981"]
              : ["#818cf8", "#c084fc", "#22d3ee", "#f472b6", "#34d399"]
          }
          blur={60}
          speed={0.6}
          orbSize="55%"
        />
      </AuroraCard>

      {/* ---- Aurora warm ---- */}
      <AuroraCard
        isDark={isDark}
        code={`<AuroraBackground
  colors={[
    "#f97316",
    "#ef4444",
    "#f59e0b",
    "#ec4899",
  ]}
/>`}
      >
        <AuroraBackground
          colors={["#f97316", "#ef4444", "#f59e0b", "#ec4899"]}
          blur={60}
          speed={0.8}
          orbSize="55%"
        />
      </AuroraCard>

      {/* ---- Grainy cool ---- */}
      <AuroraCard
        isDark={isDark}
        code={`
<GrainyBackground
    colors={[
        "rgb(59, 130, 246)",
        "rgb(147, 197, 253)",
        "rgb(96, 165, 250)",
    ]}
    animationDuration={16}
/>`}
      >
        <GrainyBackground
          colors={[
            "rgb(59, 130, 246)",
            "rgb(147, 197, 253)",
            "rgb(96, 165, 250)",
          ]}
          animationDuration={16}
        />
      </AuroraCard>
    </div>
  );
};

export default BackgroundDemo;
