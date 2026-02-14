import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } -------------------------------------------------------------------------------------------------------------- */
import StringSpinner from "../../BUILTIN_COMPONENTs/spinner/string_spinner";
import CellSplitSpinner from "../../BUILTIN_COMPONENTs/spinner/cell_split_spinner";
import { CustomizedTooltip } from "./demo";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const SpinnerDemo = () => {
  const { theme } = useContext(ConfigContext);

  const cardStyle = {
    width: 160,
    height: 160,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: theme?.foregroundColor || "#F2F2F2",
  };

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
          webkitUserSelect: "none",
          mozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        Spinners
      </span>
      <CustomizedTooltip
        code={` 
\`\`\`js
<StringSpinner size={34} amplitude={3} />
\`\`\` 
          `}
      >
        <div style={cardStyle}>
          <div
            style={{
              position: "relative",
              width: 120,
              height: 120,
            }}
          >
            <StringSpinner size={34} amplitude={3} />
          </div>
        </div>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} />
\`\`\` 
          `}
      >
        <div style={cardStyle}>
          <CellSplitSpinner size={60} />
        </div>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} cells={3} />
\`\`\` 
          `}
      >
        <div style={cardStyle}>
          <CellSplitSpinner size={60} cells={3} />
        </div>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} cells={4} />
\`\`\` 
          `}
      >
        <div style={cardStyle}>
          <CellSplitSpinner size={60} cells={4} />
        </div>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} cells={6} />
\`\`\` 
          `}
      >
        <div style={cardStyle}>
          <CellSplitSpinner size={60} cells={6} />
        </div>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} cells={8} />
\`\`\` 
          `}
      >
        <div style={cardStyle}>
          <CellSplitSpinner size={60} cells={8} />
        </div>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} cells={5} stagger={80} spin />
\`\`\` 
          `}
      >
        <div style={cardStyle}>
          <CellSplitSpinner size={60} cells={5} stagger={80} spin />
        </div>
      </CustomizedTooltip>
    </div>
  );
};

export default SpinnerDemo;
