import { useState, useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Input, {
  Password,
  ValidationCodeInput,
} from "../../BUILTIN_COMPONENTs/input/input";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const InputDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [value1, setValue1] = useState("");

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
      <Input
        label="User name"
        style={{ width: "200px" }}
        value={value1}
        set_value={setValue1}
      />
      <Input prefix_icon="edit" prefix_label="Prefix" />
      <Input prefix_label="Prefix" />
      <Input postfix_label="Postfix" />
      <Password />
      <ValidationCodeInput />
      <Input
        prefix_icon="link"
        prefix_label="https://"
        postfix_label=".com"
        no_separator
      />
      <Input
        label="search on Google"
        prefix_icon="search"
        prefix_label="G"
        no_separator
      />
    </div>
  );
};
export default InputDemo;
