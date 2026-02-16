import { useContext, useState, useRef } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../icon/icon";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/**
 * Button — ghost-style button with hover background that scales from center.
 *
 * Props:
 *   prefix_icon       – icon name rendered before label
 *   prefix            – text rendered before label (after prefix_icon)
 *   label             – main button text
 *   postfix           – text rendered after label (before postfix_icon)
 *   postfix_icon      – icon name rendered after label
 *   style             – override borderRadius, fontSize, padding, color, …
 *   disabled          – disables the button
 *   onClick           – click handler
 */
const Button = ({
  prefix_icon,
  prefix,
  label,
  postfix,
  postfix_icon,
  style,
  disabled = false,
  onClick = () => {},
}) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const tf = theme?.textfield || {};

  /* ---- resolved design tokens ---- */
  const fontSize = style?.fontSize || tf.fontSize || 16;
  const fontFamily =
    style?.fontFamily || theme?.font?.fontFamily || "Jost, sans-serif";
  const borderRadius = style?.borderRadius || tf.borderRadius || 7;
  const baseColor = style?.color || theme?.color || (isDark ? "#CCC" : "#222");
  const hoverBg =
    style?.hoverBackgroundColor ||
    (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)");
  const activeBg =
    style?.activeBackgroundColor ||
    (isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.10)");
  const iconOnly =
    !label && !prefix && !postfix && (prefix_icon || postfix_icon);
  const paddingV = style?.paddingVertical ?? (iconOnly ? 8 : 6);
  const paddingH = style?.paddingHorizontal ?? (iconOnly ? 8 : 12);
  const iconSize = style?.iconSize || Math.round(fontSize * 1.05);
  const gap = style?.gap ?? 6;

  /* ---- state ---- */
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const btnRef = useRef(null);

  const showBg = hovered || pressed;

  return (
    <button
      ref={btnRef}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
        fontFamily,
        fontSize,
        color: baseColor,
        background: "transparent",
        border: "none",
        outline: "none",
        borderRadius,
        padding: `${paddingV}px ${paddingH}px`,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        overflow: "hidden",
        userSelect: "none",
        WebkitUserSelect: "none",
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {/* ── Hover background (scales from center) ── */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius,
          backgroundColor: pressed ? activeBg : hoverBg,
          transform: showBg ? "scale(1)" : "scale(0.5, 0)",
          opacity: showBg ? 1 : 0,
          transition: showBg
            ? "transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1.0), opacity 0.18s ease"
            : "transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.15s ease",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Content ── */}
      {prefix_icon && (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon
            src={prefix_icon}
            style={{ width: iconSize, height: iconSize }}
          />
        </span>
      )}
      {prefix && (
        <span style={{ position: "relative", zIndex: 1 }}>{prefix}</span>
      )}
      {label && (
        <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
      )}
      {postfix && (
        <span style={{ position: "relative", zIndex: 1 }}>{postfix}</span>
      )}
      {postfix_icon && (
        <span
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon
            src={postfix_icon}
            style={{ width: iconSize, height: iconSize }}
          />
        </span>
      )}
    </button>
  );
};

export default Button;
