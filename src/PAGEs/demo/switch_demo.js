import { useState, useContext } from "react";

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
} from "../../BUILTIN_COMPONENTs/switch/switch";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const SwitchDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [switchStatus, setSwitchStatus] = useState({
    default: false,
    notification: false,
    null: false,
    material: false,
    square: false,
    small: false,
    stick: false,
    semistick: false,
  });
  const handle_switch_on_click = (switch_id) => {
    setSwitchStatus((prevStatus) => ({
      ...prevStatus,
      [switch_id]: !prevStatus[switch_id],
    }));
  };

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
        on={switchStatus.default}
        setOn={() => handle_switch_on_click("default")}
      />
      <LightSwitch
        style={{
          width: 200,
          height: 100,
          borderRadius: 50,
          backgroundColor_on: "#ffa300",
        }}
      />
      <NotificationSwitch
        style={{
          width: 200,
          height: 100,
          borderRadius: 50,
        }}
        on={switchStatus.notification}
        setOn={() => handle_switch_on_click("notification")}
      />
      <SemiSwitch
        style={{
          width: 300,
          height: 100,
          borderRadius: 50,
          backgroundColor: "#59a2cc",
          backgroundColor_on: "#ff9718",
        }}
        on={switchStatus.null}
        setOn={() => handle_switch_on_click("null")}
        on_icon_src={"null"}
        off_icon_src={"null"}
      />
      <MaterialSwitch
        style={{
          width: 200,
          height: 100,
          backgroundColor_on: "#fc7aff",
        }}
        on={switchStatus.material}
        setOn={() => handle_switch_on_click("material")}
      />
      <Switch
        style={{
          width: 140,
          height: 70,
          borderRadius: 20,
          backgroundColor_on: "#1af337ff",
        }}
        on={switchStatus.square}
        setOn={() => handle_switch_on_click("square")}
      />
      <Switch
        style={{
          width: 60,
          height: 30,
          borderRadius: 20,
          backgroundColor_on: "#59a2cc",
        }}
        on={switchStatus.small}
        setOn={() => handle_switch_on_click("small")}
      />
      <Switch
        style={{
          width: 100,
          height: 80,
          borderRadius: 20,
          backgroundColor_on: "#95afc2ff",
        }}
        on={switchStatus.stick}
        setOn={() => handle_switch_on_click("stick")}
      />
      <SemiSwitch
        style={{
          width: 140,
          height: 70,
          borderRadius: 50,
          backgroundColor_on: "#ff8000",
        }}
        on={switchStatus.semi}
        setOn={() => handle_switch_on_click("semi")}
      />
      <SemiSwitch
        style={{
          width: 70,
          height: 100,
          borderRadius: 12,
          backgroundColor_on: "rgb(68, 85, 231)",
        }}
        on={switchStatus.semistick}
        setOn={() => handle_switch_on_click("semistick")}
      />
    </div>
  );
};

export default SwitchDemo;
