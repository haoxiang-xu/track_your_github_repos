import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Input from "../../BUILTIN_COMPONENTs/input/input";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const InputDemo = () => {
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
          webkitUserSelect: "none",
          mozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        Inputs
      </span>
      <Input icon="link" />
      <Input icon="edit" prefix="Prefix" />
      <Input prefix="Prefix" />
      <Input
        style={{
          fontSize: 64,
        }}
      />
    </div>
  );
};
export default InputDemo;
