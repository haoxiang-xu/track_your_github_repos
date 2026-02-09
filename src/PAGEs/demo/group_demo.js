import { useContext, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Group from "../../BUILTIN_COMPONENTs/group/group";
import Input from "../../BUILTIN_COMPONENTs/input/input";
import { SemiSwitch } from "../../BUILTIN_COMPONENTs/input/switch";
import { CustomizedTooltip } from "./demo";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const GroupDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [merged1, setMerged1] = useState(true);
  const [merged2, setMerged2] = useState(true);
  const [merged3, setMerged3] = useState(true);

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    padding: 24,
    borderRadius: 18,
    backgroundColor: theme?.foregroundColor || "#F2F2F2",
  };

  const labelStyle = {
    fontSize: 14,
    fontFamily: "Jost",
    color: theme?.color || "#222",
    opacity: 0.6,
    userSelect: "none",
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
        }}
      >
        Group
      </span>

      {/* ---- Two inputs ---- */}
      <div style={cardStyle}>
        <span style={labelStyle}>Two Inputs</span>
        <SemiSwitch on={merged1} set_on={setMerged1} />
        <Group
          merged={merged1}
          direction="horizontal"
          gap={10}
          borderRadius={8}
        >
          <Input
            style={{
              width: 140,
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
            placeholder="First name"
          />
          <Input
            style={{
              width: 140,
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
            placeholder="Last name"
          />
        </Group>
      </div>

      {/* ---- Input + Switch ---- */}
      <div style={cardStyle}>
        <span style={labelStyle}>Input + Switch</span>
        <SemiSwitch on={merged2} set_on={setMerged2} />
        <Group
          merged={merged2}
          direction="horizontal"
          gap={12}
          borderRadius={8}
        >
          <Input
            style={{
              width: 180,
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
            placeholder="Search..."
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "0 6px",
            }}
          >
            <SemiSwitch />
          </div>
        </Group>
      </div>

      {/* ---- Vertical ---- */}
      <div style={cardStyle}>
        <span style={labelStyle}>Vertical</span>
        <SemiSwitch on={merged3} set_on={setMerged3} />
        <Group merged={merged3} direction="vertical" gap={10} borderRadius={8}>
          <Input
            style={{
              width: 200,
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
            placeholder="Email"
          />
          <Input
            style={{
              width: 200,
              backgroundColor: "transparent",
              boxShadow: "none",
            }}
            placeholder="Password"
          />
        </Group>
      </div>
    </div>
  );
};

export default GroupDemo;
