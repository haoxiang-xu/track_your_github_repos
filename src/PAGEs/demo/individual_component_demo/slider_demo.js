import { useContext, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import {
  Slider,
  RangeSlider,
  GradientSlider,
} from "../../../BUILTIN_COMPONENTs/input/slider";
import { CustomizedTooltip } from "../demo";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const SliderDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [tempValue, setTempValue] = useState(50);

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
          fontFamily: "Jost",
          color: theme?.color || "black",

          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        Sliders
      </span>

      {/* ── Default ──────────────────────────────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<Slider default_value={50} />
\`\`\`
        `}
      >
        <Slider default_value={50} />
      </CustomizedTooltip>

      {/* ── Marks / snap ─────────────────────────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<Slider
  default_value={25}
  marks={[0, 25, 50, 75, 100]}
/>
\`\`\`
        `}
      >
        <Slider default_value={25} marks={[0, 25, 50, 75, 100]} />
      </CustomizedTooltip>

      {/* ── Range slider ─────────────────────────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<RangeSlider default_value={[20, 80]} />
\`\`\`
        `}
      >
        <RangeSlider default_value={[20, 80]} />
      </CustomizedTooltip>

      {/* ── Gradient Sliders ─────────────────────────── */}
      <span
        style={{
          width: "100%",
          textAlign: "left",
          fontSize: "48px",
          fontFamily: "Jost",
          color: theme?.color || "black",
          marginTop: "16px",

          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        Gradient Sliders
      </span>

      {/* ── Gradient: color mode (rainbow) ───────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<GradientSlider
  default_value={50}
  gradient="linear-gradient(to right,
    #f00 0%, #ff0 17%, #0f0 33%,
    #0ff 50%, #00f 67%, #f0f 83%,
    #f00 100%)"
/>
\`\`\`
        `}
      >
        <GradientSlider
          default_value={50}
          gradient="linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
        />
      </CustomizedTooltip>

      {/* ── Gradient: purple-pink ────────────────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<GradientSlider
  default_value={65}
  gradient="linear-gradient(to right,
    #3b82f6, #8b5cf6, #ec4899)"
/>
\`\`\`
        `}
      >
        <GradientSlider
          default_value={65}
          gradient="linear-gradient(to right, #3b82f6, #8b5cf6, #ec4899)"
        />
      </CustomizedTooltip>

      {/* ── Gradient: warm temperature ───────────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<GradientSlider
  value={tempValue}
  set_value={setTempValue}
  min={0}
  max={100}
  gradient="linear-gradient(to right,
    #2563eb, #7c3aed, #db2777, #f59e0b)"
  prefix_label="Cold"
  postfix_label="Hot"
/>
\`\`\`
        `}
      >
        <GradientSlider
          value={tempValue}
          set_value={setTempValue}
          min={0}
          max={100}
          gradient="linear-gradient(to right, #2563eb, #7c3aed, #db2777, #f59e0b)"
          prefix_label="Cold"
          postfix_label="Hot"
        />
      </CustomizedTooltip>

      {/* ── Gradient: with marks ─────────────────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<GradientSlider
  default_value={25}
  marks={[0, 25, 50, 75, 100]}
  gradient="linear-gradient(to right,
    #10b981, #f59e0b, #ef4444)"
/>
\`\`\`
        `}
      >
        <GradientSlider
          default_value={25}
          marks={[0, 25, 50, 75, 100]}
          gradient="linear-gradient(to right, #10b981, #f59e0b, #ef4444)"
        />
      </CustomizedTooltip>

      {/* ── Gradient: disabled ───────────────────────── */}
      <CustomizedTooltip
        code={`
\`\`\`js
<GradientSlider
  default_value={40}
  gradient="linear-gradient(to right,
    #6366f1, #a855f7, #ec4899)"
  disabled
/>
\`\`\`
        `}
      >
        <GradientSlider
          default_value={40}
          gradient="linear-gradient(to right, #6366f1, #a855f7, #ec4899)"
          disabled
        />
      </CustomizedTooltip>
    </div>
  );
};

export default SliderDemo;
