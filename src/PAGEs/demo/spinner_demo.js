import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } -------------------------------------------------------------------------------------------------------------- */
import StringSpinner from "../../BUILTIN_COMPONENTs/spinner/string_spinner";
import CellSplitSpinner from "../../BUILTIN_COMPONENTs/spinner/cell_split_spinner";
import Card from "../../BUILTIN_COMPONENTs/card/card";
import { CustomizedTooltip } from "./demo";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const SpinnerDemo = () => {
  const { theme } = useContext(ConfigContext);

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
        Spinners
      </span>
      <CustomizedTooltip
        code={` 
\`\`\`js
<StringSpinner size={34} amplitude={3} />
\`\`\` 
          `}
      >
        <Card
          width={160}
          height={160}
          max_tilt={0}
          border_radius={12}
          body_style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              width: 120,
              height: 120,
            }}
          >
            <StringSpinner size={34} amplitude={3} />
          </div>
        </Card>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} />
\`\`\` 
          `}
      >
        <Card
          width={160}
          height={160}
          max_tilt={0}
          border_radius={12}
          body_style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <CellSplitSpinner size={60} />
        </Card>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} cells={4} stagger={80}/>
\`\`\` 
          `}
      >
        <Card
          width={160}
          height={160}
          max_tilt={0}
          border_radius={12}
          body_style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <CellSplitSpinner size={60} cells={4} stagger={80} />
        </Card>
      </CustomizedTooltip>
      <CustomizedTooltip
        code={` 
\`\`\`js
<CellSplitSpinner size={60} cells={5} stagger={80} spread={0.9} spin />
\`\`\` 
          `}
      >
        <Card
          width={160}
          height={160}
          max_tilt={0}
          border_radius={12}
          body_style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          <CellSplitSpinner
            size={60}
            cells={5}
            stagger={80}
            spread={0.9}
            spin
          />
        </Card>
      </CustomizedTooltip>
    </div>
  );
};

export default SpinnerDemo;
