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
} from "../../BUILTIN_COMPONENTs/switch/switch";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const SwitchDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [switchStatus, setSwitchStatus] = useState({
    default: false,
    notification: false,
    null: false,
    material: false,
  });
  const handle_switch_on_click = (switch_id) => {
    setSwitchStatus((prevStatus) => ({
      ...prevStatus,
      [switch_id]: !prevStatus[switch_id],
    }));
  };

  return (
    <div
      id="switch-demo"
      style={{
        transition: "background-color 0.36s cubic-bezier(0.32, 1, 0.32, 1)",
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",

        backgroundColor: theme?.backgroundColor || "white",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexWrap: "wrap",
          gap: "24px",
          padding: "10px",
        }}
      >
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
        <Switch
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
          }}
          on={switchStatus.material}
          setOn={() => handle_switch_on_click("material")}
        />
      </div>
    </div>
  );
};

export default SwitchDemo;
