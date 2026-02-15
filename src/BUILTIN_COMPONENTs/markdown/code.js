import { useMemo } from "react";

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Code from "../code/code";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const toText = (node) => {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(toText).join("");
  if (typeof node === "object" && node.props?.children !== undefined)
    return toText(node.props.children);
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
  const codeElement = useMemo(() => {
    if (Array.isArray(children)) {
      return children.find((child) => child?.type === "code") || children[0];
    }
    return children;
  }, [children]);

  const className = codeElement?.props?.className || "";
  const language = getLanguage(className);
  const codeText = toText(codeElement?.props?.children ?? children);

  /* Build style overrides from markdown code theme */
  const codeOverride = markdownThemeOverride?.code || {};
  const pre = markdownThemeOverride?.pre || {};
  const codeStyle = {
    ...codeOverride,
  };
  if (pre.minHeight !== undefined) codeStyle.minHeight = pre.minHeight;
  if (pre.maxHeight !== undefined) codeStyle.maxHeight = pre.maxHeight;

  return (
    <Code language={language} height={pre.height} style={codeStyle}>
      {codeText}
    </Code>
  );
};

export default MarkdownCodeBlock;
