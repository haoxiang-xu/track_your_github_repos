import { useContext, useMemo, useState } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

const toPx = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "number") return `${value}px`;
  return value;
};

const toText = (node) => {
  if (node === undefined || node === null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (typeof node === "object" && node.props?.children !== undefined) {
    return toText(node.props.children);
  }
  return "";
};

const getLanguage = (className) => {
  if (!className) return "";
  const match =
    className.match(/language-([a-z0-9_-]+)/i) ||
    className.match(/lang-([a-z0-9_-]+)/i);
  return match ? match[1] : "";
};

const MarkdownCodeBlock = ({ children }) => {
  const { theme } = useContext(ConfigContext);
  const markdownTheme = theme?.markdown || {};
  const codeBlock = markdownTheme.codeBlock || {};
  const codeTheme = markdownTheme.code || {};
  const preTheme = markdownTheme.pre || {};

  const codeElement = useMemo(() => {
    if (Array.isArray(children)) {
      return children.find((child) => child?.type === "code") || children[0];
    }
    return children;
  }, [children]);

  const className = codeElement?.props?.className || "";
  const language = getLanguage(className);
  const codeText = toText(codeElement?.props?.children ?? children);
  const canCopy =
    typeof navigator !== "undefined" && !!navigator.clipboard?.writeText;

  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    if (!canCopy) return;
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (error) {
      console.error("[Markdown code copy failed]:", error);
    }
  };

  const background = preTheme.backgroundColor || "#F6F6F6";
  const borderRadius = toPx(preTheme.borderRadius, "6px");
  const padding = toPx(preTheme.padding, "12px");
  const headerBackground = codeBlock.headerBackground || background;
  const headerBorderColor = codeBlock.headerBorderColor || "transparent";
  const labelColor =
    codeBlock.labelColor || markdownTheme.color || theme?.color || "#222222";
  const buttonColor = codeBlock.buttonColor || labelColor;

  return (
    <div
      style={{
        borderRadius: borderRadius,
        overflow: "hidden",
        background: background,
        margin: preTheme.margin || "0 0 0.85em 0",
      }}
    >
      {(language || canCopy) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: codeBlock.headerPadding || "6px 10px",
            background: headerBackground,
            borderBottom: `1px solid ${headerBorderColor}`,
            fontSize: toPx(codeBlock.headerFontSize, "12px"),
            color: labelColor,
          }}
        >
          <span style={{ textTransform: "uppercase" }}>
            {language || ""}
          </span>
          {canCopy && (
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: codeBlock.buttonBackground || "transparent",
                color: buttonColor,
                border: codeBlock.buttonBorder || "1px solid transparent",
                borderRadius: toPx(codeBlock.buttonBorderRadius, "4px"),
                padding: codeBlock.buttonPadding || "2px 6px",
                fontSize: toPx(codeBlock.buttonFontSize, "12px"),
                cursor: "pointer",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: padding,
          overflow: preTheme.overflow || "auto",
          background: "transparent",
        }}
      >
        <code
          className={className}
          style={{
            fontFamily:
              codeTheme.fontFamily || "Menlo, Monaco, Consolas, monospace",
            fontSize: toPx(codeTheme.fontSize, "13px"),
            lineHeight: codeTheme.lineHeight || "1.5",
            color: codeTheme.color || "inherit",
            background: "transparent",
          }}
        >
          {codeText}
        </code>
      </pre>
    </div>
  );
};

export default MarkdownCodeBlock;
