import { useContext, useMemo, useState } from "react";
import hljs from "highlight.js/lib/common";

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
const MarkdownCodeBlock = ({
  children,
  markdownTheme: markdownThemeOverride,
}) => {
  const { theme } = useContext(ConfigContext);
  const markdownTheme = markdownThemeOverride || theme?.markdown || {};
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
  const highlightedHtml = useMemo(() => {
    if (!codeText) return "";

    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(codeText, { language }).value;
      }
      return hljs.highlightAuto(codeText).value;
    } catch (error) {
      console.error("[Markdown code highlight failed]:", error);
      return "";
    }
  }, [codeText, language]);
  const codeClassName = [className, "hljs"].filter(Boolean).join(" ");

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
  const padding = toPx(preTheme.padding, "12px");
  const overflowX = preTheme.overflowX ?? preTheme.overflow ?? "scroll";
  const overflowY = preTheme.overflowY ?? preTheme.overflow ?? "scroll";
  const height =
    preTheme.height !== undefined
      ? toPx(preTheme.height, preTheme.height)
      : undefined;
  const minHeight =
    preTheme.minHeight !== undefined
      ? toPx(preTheme.minHeight, preTheme.minHeight)
      : undefined;
  const maxHeight =
    preTheme.maxHeight !== undefined
      ? toPx(preTheme.maxHeight, preTheme.maxHeight)
      : undefined;
  const headerBackground =
    codeTheme.headerBackground ||
    theme?.markdown?.code?.header?.backgroundColor ||
    background;
  const headerBorderColor = codeBlock.headerBorderColor || "transparent";
  const labelColor =
    codeBlock.labelColor || markdownTheme.color || theme?.color || "#222222";
  const buttonColor = codeBlock.buttonColor || labelColor;

  return (
    <div
      style={{
        overflow: "hidden",
        background:
          codeTheme.backgroundColor ||
          theme?.markdown?.code?.backgroundColor ||
          "transparent",
        margin: preTheme.margin || "0 0 0 0",
        borderRadius:
          codeTheme.borderRadius || theme?.markdown?.code?.borderRadius || "7px",
        boxShadow:
          codeTheme.boxShadow ?? theme?.markdown?.code?.boxShadow ?? null,
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
            fontSize: toPx(codeBlock.headerFontSize, "12px"),
            color: labelColor,
            borderBottom:
              headerBorderColor && headerBorderColor !== "transparent"
                ? `1px solid ${headerBorderColor}`
                : "none",
            boxShadow: theme?.markdown?.code?.header?.boxShadow || "none",
          }}
        >
          <span
            style={{
              textTransform: "uppercase",
              color: labelColor,
              fontSize: theme?.markdown?.code?.header?.fontSize || "inherit",
              fontFamily: theme?.fontFamily || "inherit",

              userSelect: "none",
              webkitUserSelect: "none",
              mozUserSelect: "none",
              msUserSelect: "none",
            }}
          >
            {language || ""}
          </span>
          {canCopy && (
            <button
              type="button"
              onClick={handleCopy}
              style={{
                background: "transparent",
                color: buttonColor,
                border: "none",
                borderRadius: 0,
                fontSize: theme?.markdown?.code?.header?.fontSize || "inherit",
                fontFamily: theme?.fontFamily || "inherit",
                cursor: "pointer",

                userSelect: "none",
                webkitUserSelect: "none",
                mozUserSelect: "none",
                msUserSelect: "none",
              }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
          )}
        </div>
      )}
      <pre
        className="scrolling-bar"
        style={{
          margin: 6,
          padding: padding,
          overflowX,
          overflowY,
          height,
          minHeight,
          maxHeight,
          scrollbarGutter: preTheme.scrollbarGutter || "stable both-edges",
          background: "transparent",
        }}
      >
        <code
          className={codeClassName}
          style={{
            width: "fit-content",
            fontFamily:
              codeTheme.fontFamily || "Menlo, Monaco, Consolas, monospace",
            fontSize: toPx(codeTheme.fontSize, "13px"),
            lineHeight: codeTheme.lineHeight || "1.5",
            color: codeTheme.color || "inherit",
            background: "transparent",
          }}
          dangerouslySetInnerHTML={
            highlightedHtml ? { __html: highlightedHtml } : undefined
          }
        >
          {!highlightedHtml ? codeText : null}
        </code>
      </pre>
    </div>
  );
};

export default MarkdownCodeBlock;
