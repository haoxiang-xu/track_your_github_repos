import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } -------------------------------------------------------------------------------------------------------------- */
import {
  Switch,
  LightSwitch,
  NotificationSwitch,
  MaterialSwitch,
  SemiSwitch,
} from "../../BUILTIN_COMPONENTs/input/switch";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const SwitchDemo = () => {
  const { theme } = useContext(ConfigContext);

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        gap: "24px",
        padding: "10px",
        marginTop: "512px",
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
        Switches
      </span>
      <Switch
        style={{
          width: 200,
          height: 100,
          borderRadius: 50,
        }}
      />
      <LightSwitch
        style={{
          width: 200,
          height: 100,
          borderRadius: 50,
        }}
      />
      <NotificationSwitch
        style={{
          width: 200,
          height: 100,
          borderRadius: 50,
        }}
      />
      <SemiSwitch
        style={{
          width: 300,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#59a2cc",
          backgroundColor_on: "#ff9718",
        }}
        on_icon_src={"null"}
        off_icon_src={"null"}
      />
      <MaterialSwitch
        style={{
          width: 200,
          height: 100,
          backgroundColor_on: "#fc7aff",
        }}
      />
      <Switch
        style={{
          width: 140,
          height: 70,
          borderRadius: 20,
          backgroundColor_on: "#1af337ff",
        }}
      />
      <Switch
        style={{
          width: 60,
          height: 30,
          borderRadius: 20,
          backgroundColor_on: "#59a2cc",
        }}
      />
      <Switch
        style={{
          width: 100,
          height: 80,
          borderRadius: 20,
          backgroundColor_on: "#95afc2ff",
        }}
      />
      <SemiSwitch
        style={{
          width: 140,
          height: 70,
          borderRadius: 50,
          backgroundColor_on: "#ff8000",
        }}
      />
      <SemiSwitch
        style={{
          width: 70,
          height: 100,
          borderRadius: 12,
          backgroundColor_on: "rgb(68, 85, 231)",
        }}
      />
    </div>
  );
};

export default SwitchDemo;
