import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Tooltip from "../../BUILTIN_COMPONENTs/tooltip/tooltip";
import Markdown from "../../BUILTIN_COMPONENTs/markdown/markdown";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* { Sections } -------------------------------------------------------------------------------------------------------------- */
import SwitchDemo from "./switch_demo";
import SpinnerDemo from "./spinner_demo";
import InputDemo from "./input_demo";
import MarkdownDemo from "./markdown_demo";
import SelectDemo from "./select_demo";
import CardDemo from "./card_demo";
import OthersDemo from "./others_demo";
/* { Sections } -------------------------------------------------------------------------------------------------------------- */

const CustomizedTooltip = ({ children, code }) => {
  return (
    <Tooltip
      position="bottom"
      tooltip_component={
        <Markdown
          style={{
            pre: {
              margin: 0,
              border: "1px solid #E0E0E0",
            },
          }}
        >
          {code}
        </Markdown>
      }
      trigger={["hover"]}
      style={{
        padding: 4,
        borderRadius: 10,
      }}
      open_delay={600}
      close_delay={80}
    >
      {children}
    </Tooltip>
  );
};
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
        className="scrolling-bar"
        style={{
          position: "absolute",
          top: 0,
          left: 4,
          right: 4,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          paddingBottom: "512px",
          overflowY: "scroll",
          border: "1px solid #cccccc",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            maxWidth: 1200,
            paddingTop: "512px",
            paddingBottom: "512px",
            border: "1px solid #cccccc",
          }}
        >
        <SwitchDemo />
        <SpinnerDemo />
        <InputDemo />
        <SelectDemo />
        <CardDemo />
        <MarkdownDemo />
        <OthersDemo />
        </div>
      </div>
    </div>
  );
};
export { Demo as default, CustomizedTooltip };
