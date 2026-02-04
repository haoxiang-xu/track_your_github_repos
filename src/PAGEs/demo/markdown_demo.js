import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } -------------------------------------------------------------------------------------------------------------- */
import Markdown from "../../BUILTIN_COMPONENTs/markdown/markdown";
/* { Components } -------------------------------------------------------------------------------------------------------------- */

const MarkdownDemo = () => {
  const { theme } = useContext(ConfigContext);

  const demoMarkdown = `# Markdown Title

This is a paragraph with **bold**, *italic*, and \`inline code\`.

## Subtitle

- List item 1
- List item 2
- List item 3

> Blockquote example. Notion-ish look.

\`\`\`js
const hello = "world";
console.log(hello);
\`\`\`

| Column A | Column B |
| --- | --- |
| 1 | 2 |
| 3 | 4 |

[Link example](https://example.com)
`;

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
        Markdown
      </span>
      <div style={{ width: "100%", maxWidth: 720 }}>
        <Markdown>{demoMarkdown}</Markdown>
      </div>
    </div>
  );
};

export default MarkdownDemo;
