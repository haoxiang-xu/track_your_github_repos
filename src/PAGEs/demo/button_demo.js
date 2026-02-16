import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Button from "../../BUILTIN_COMPONENTs/input/button";
import { CustomizedTooltip } from "./demo";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const ButtonDemo = () => {
  const { theme } = useContext(ConfigContext);
  const color = theme?.color || "black";

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
        Button
      </span>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
        }}
      >
        {/* ── Label only ── */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Button label="Submit" />
\`\`\`
          `}
        >
          <Button label="Submit" onClick={() => {}} />
        </CustomizedTooltip>

        {/* ── Prefix icon + label ── */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Button prefix_icon="add" label="New" />
\`\`\`
          `}
        >
          <Button prefix_icon="add" label="New" onClick={() => {}} />
        </CustomizedTooltip>

        {/* ── Label + postfix icon ── */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Button label="Next" postfix_icon="arrow_right" />
\`\`\`
          `}
        >
          <Button label="Next" postfix_icon="arrow_right" onClick={() => {}} />
        </CustomizedTooltip>

        {/* ── Icon only ── */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Button prefix_icon="settings" />
\`\`\`
          `}
        >
          <Button prefix_icon="settings" onClick={() => {}} />
        </CustomizedTooltip>

        {/* ── Prefix + label + postfix ── */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Button
  prefix_icon="edit"
  label="Edit"
  postfix="⌘E"
/>
\`\`\`
          `}
        >
          <Button
            prefix_icon="edit"
            label="Edit"
            postfix="⌘E"
            onClick={() => {}}
          />
        </CustomizedTooltip>

        {/* ── Disabled ── */}
        <CustomizedTooltip
          code={`
\`\`\`js
<Button
  prefix_icon="lock"
  label="Locked"
  disabled
/>
\`\`\`
          `}
        >
          <Button prefix_icon="lock" label="Locked" disabled />
        </CustomizedTooltip>
      </div>
    </div>
  );
};

export default ButtonDemo;
