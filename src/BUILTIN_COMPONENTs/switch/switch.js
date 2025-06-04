import { useState, useEffect, useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../icon/icon";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const Switch = ({
  style,
  on_icon_src = "circle",
  off_icon_src = "subtract",
  on = false,
  setOn = () => {},
}) => {
  const { theme } = useContext(ConfigContext);
  const [switchStyle, setSwitchStyle] = useState({});
  useEffect(() => {
    if (style) {
      let reprocessed_style = { ...style };
      for (const property in theme?.switch) {
        if (reprocessed_style[property] === undefined) {
          reprocessed_style[property] = theme.switch[property];
        }
      }
      if (on) {
        reprocessed_style.backgroundColor =
          reprocessed_style.BackgroundColor_on ||
          theme?.switch?.BackgroundColor_on ||
          reprocessed_style.backgroundColor ||
          theme?.switch?.backgroundColor;
      }
      setSwitchStyle(reprocessed_style);
    } else if (theme?.switch) {
      let reprocessed_style = { ...theme.switch };
      if (on) {
        reprocessed_style.backgroundColor =
          theme?.switch?.backgroundColor_on || theme?.switch?.backgroundColor;
      }
      setSwitchStyle({
        ...reprocessed_style,
      });
    }
  }, [theme, style, on]);
  const handle_switch_on_click = () => {
    setOn(!on);
  };

  return (
    <div
      className="mini-ui-switch-track"
      style={switchStyle}
      onClick={handle_switch_on_click}
    >
      <div
        className="mini-ui-switch-thumb"
        style={{
          transition: "left 0.2s cubic-bezier(0.72, -0.16, 0.2, 1.16)",
          position: "absolute",
          top: "50%",
          left: on ? switchStyle?.width - switchStyle?.height + 3 : 3,

          height:
            typeof switchStyle?.height === "number"
              ? switchStyle.height - 6
              : undefined,
          width:
            typeof switchStyle?.height === "number"
              ? switchStyle.height - 6
              : undefined,

          borderRadius: switchStyle?.borderRadius - 3 || "50%",

          transform: "translate(0%, -50%)",
          backgroundColor: switchStyle.color,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.32)",
        }}
      ></div>
      <Icon
        src={on ? on_icon_src : off_icon_src}
        style={{
          transition: "left 0.2s cubic-bezier(0.72, -0.16, 0.2, 1.16)",
          position: "absolute",
          top: "50%",
          left:
            typeof switchStyle?.height === "number" &&
            typeof switchStyle?.width === "number"
              ? on
                ? 4
                : switchStyle?.width - switchStyle?.height + 7 + 4
              : undefined,
          transform: "translate(0%, -50%)",

          height:
            typeof switchStyle?.height === "number"
              ? switchStyle.height - 14
              : undefined,
          width:
            typeof switchStyle?.height === "number"
              ? switchStyle.height - 14
              : undefined,
        }}
      />
    </div>
  );
};

export default Switch;
