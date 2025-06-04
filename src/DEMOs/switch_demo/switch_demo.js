import { useState } from "react";

/* { Components } -------------------------------------------------------------------------------------------------------------- */
import { Switch, LightSwitch } from "../../BUILTIN_COMPONENTs/switch/switch";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const SwitchDemo = () => {
  const [on, setOn] = useState(false);

  return (
    <div
      id="switch-demo"
      style={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Switch on={on} setOn={setOn} />
      <LightSwitch />
    </div>
  );
};

export default SwitchDemo;
