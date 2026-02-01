import { useContext, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../icon/icon";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const Separator = ({ style }) => {
  const { theme } = useContext(ConfigContext);
  return (
    <div
      style={{
        width: 1,
        backgroundColor: style?.color || theme?.color || "rgba(0, 0, 0, 0.12)",
        ...style,
      }}
    ></div>
  );
};
const Input = ({
  style,
  icon,
  prefix,
  placeholder,
  onInputFocus = () => {},
  onInputBlur = () => {},
}) => {
  const { theme } = useContext(ConfigContext);
  const [onFocus, setOnFocus] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: `6px 8px`,
        height:
          style?.height ||
          theme?.input.height ||
          style?.fontSize + 16 ||
          theme?.input.fontSize + 16 ||
          32,

        backgroundColor: theme?.input.backgroundColor || "white",
        borderRadius: style?.borderRadius || theme?.input.borderRadius || 4,
        boxShadow: style?.boxShadow || theme?.input.boxShadow || "none",
        outline: style?.outline || onFocus ? theme?.input.outline.onFocus : theme?.input.outline.onBlur || "1px solid #CCCCCC",
        // overflow: "hidden",
        ...style,
      }}
    >
      {icon === undefined ? null : (
        <>
          <Icon
            src={icon}
            style={{
              width: (style?.fontSize || theme?.input.fontSize || 16) + 4,
              height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
            }}
            color={style?.color || theme?.color || "black"}
          />
          <Separator
            style={{
              height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
            }}
          />
        </>
      )}
      {prefix === undefined ? null : (
        <>
          <span
            style={{
              fontFamily:
                style?.fontFamily ||
                theme?.font.fontFamily ||
                "Arial, sans-serif",
              fontSize: style?.fontSize || theme?.input.fontSize || 16,
              color: style?.color || theme?.color || "black",

              userSelect: "none",
              webkitUserSelect: "none",
              mozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {prefix}
          </span>
          <Separator
            style={{
              height: (style?.fontSize || theme?.input.fontSize || 16) + 4,
            }}
          />
        </>
      )}
      <input
        style={{
          fontFamily:
            style?.fontFamily || theme?.font.fontFamily || "Arial, sans-serif",
          height: "90%",
          fontSize: style?.fontSize || theme?.input.fontSize || 16,
          border: "1px solid rgba(255, 255, 255, 0)",
          backgroundColor: "rgba(0,0,0,0)",
          color: style?.color || theme?.color || "black",
          outline: "none",
        }}
        onFocus={() => {
          setOnFocus(true);
          onInputFocus();
        }}
        onBlur={() => {
          setOnFocus(false);
          onInputBlur();
        }}
        placeholder={placeholder || "Placeholder"}
      />
    </div>
  );
};

export default Input;
