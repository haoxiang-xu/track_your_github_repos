import { useState, useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } -------------------------------------------------------------------------------------------------------------- */
import { Switch, LightSwitch } from "../../BUILTIN_COMPONENTs/switch/switch";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const SwitchDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [on, setOn] = useState(false);

  return (
    <div
      id="switch-demo"
      style={{
        transition: "background-color 0.36s cubic-bezier(0.32, 1, 0.32, 1)",
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme?.backgroundColor || "white",
      }}
    >
      <Switch on={on} setOn={setOn} />
      <LightSwitch />
    </div>
  );
};

export default SwitchDemo;
