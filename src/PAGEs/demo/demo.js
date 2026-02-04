import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import SwitchDemo from "./switch_demo";
import InputDemo from "./input_demo";
import MarkdownDemo from "./markdown_demo";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const Demo = () => {
  const { theme } = useContext(ConfigContext);
  return (
    <div
      id="demo"
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
        id="component_scroll_container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          paddingRight: "128px",
          paddingLeft: "128px",
          paddingBottom: "512px",
          overflowY: "scroll",
        }}
      >
        <SwitchDemo />
        <InputDemo />
        <MarkdownDemo />
      </div>
    </div>
  );
};
export default Demo;
