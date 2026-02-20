---
name: create-a-component-demo
description: Create an individual component demo page for the Mini UI showcase. Use this skill when adding a demo for a new or existing component under src/PAGEs/demo/individual_component_demo. Keywords — demo, component demo, showcase, individual demo, demo page, preview, component preview, demo coverage.
---

# Create a Component Demo — Mini UI

This skill covers how to create an individual component demo that appears in the "Components" tab of the Mini UI showcase page.

---

## 1. File Locations

| Concern                  | Path                                                                |
| ------------------------ | ------------------------------------------------------------------- |
| New demo file            | `src/PAGEs/demo/individual_component_demo/<component_name>_demo.js` |
| Demo host (registration) | `src/PAGEs/demo/demo.js`                                            |
| CustomizedTooltip export | `src/PAGEs/demo/demo.js` (named export)                             |
| ConfigContext            | `src/CONTAINERs/config/context.js`                                  |
| Component source         | `src/BUILTIN_COMPONENTs/<component_name>/`                          |

---

## 2. Create the Demo File

Create `src/PAGEs/demo/individual_component_demo/<component_name>_demo.js`.

### 2.1 Import Structure

Follow the established section-comment convention used throughout the codebase:

```js
import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import MyComponent from "../../../BUILTIN_COMPONENTs/my_component/my_component";
import { CustomizedTooltip } from "../demo";
/* { Components } ------------------------------------------------------------------------------------------------------------ */
```

Key rules:

- Import `ConfigContext` from `../../../CONTAINERs/config/context` (three levels up from the demo folder)
- Import the component(s) from `../../../BUILTIN_COMPONENTs/<component_name>/`
- Always import `CustomizedTooltip` from `../demo` — this is a **named export** from the demo host
- If the component file has multiple named exports, import them explicitly:
  ```js
  import MyComponent, {
    VariantA,
    VariantB,
  } from "../../../BUILTIN_COMPONENTs/my_component/my_component";
  ```

### 2.2 Demo Component Structure

```jsx
const MyComponentDemo = () => {
  const { theme } = useContext(ConfigContext);
  const color = theme?.color || "black";
  const fontFamily = theme?.font?.fontFamily || "Jost";

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
      {/* Section title */}
      <span
        style={{
          width: "100%",
          textAlign: "left",
          fontSize: "48px",
          fontFamily: "Jost",
          color,
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        My Component
      </span>

      {/* --- Demo instances go here --- */}
    </div>
  );
};

export default MyComponentDemo;
```

Key conventions:

- The component name follows the pattern `<ComponentName>Demo`
- Use **default export**
- The outer container uses `display: flex`, `flexWrap: wrap`, `gap: "24px"`, `padding: "10px"`
- The section title is a `<span>` at `fontSize: "48px"`, `fontFamily: "Jost"`, full width, with `userSelect: "none"`
- Read `theme?.color` for the title color — supports light/dark mode automatically
- If the demo needs more vertical structure (subsections), use `flexDirection: "column"` instead of `flexWrap: "wrap"` (see ButtonDemo pattern)

### 2.3 Wrapping Each Instance with CustomizedTooltip

Every demo instance **must** be wrapped in `<CustomizedTooltip>` so that hovering shows the source code:

```jsx
<CustomizedTooltip
  code={`
\`\`\`js
<MyComponent label="Example" />
\`\`\`
`}
>
  <MyComponent label="Example" />
</CustomizedTooltip>
```

Rules for the `code` prop:

- Wrap the code in triple-backtick fenced code block with `js` language tag
- The code should show the **exact JSX** the user would write to reproduce this instance
- Keep code concise — show only the props that matter for this specific variant
- Use template literals with backtick escaping: `` \`\`\`js ... \`\`\` ``

### 2.4 Required Demo Coverage

Every component demo must include **at minimum** these variants:

| Variant                      | What to show                                                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Default state**            | Component with minimal/no props                                                                                                                     |
| **Themed appearance**        | Component renders correctly in both light and dark mode (verified by theme toggle on demo page — no extra code needed if theme tokens are consumed) |
| **Disabled state**           | `disabled` prop applied — visually muted, non-interactive                                                                                           |
| **Key interaction variants** | The component's main features and prop combinations                                                                                                 |

Additional variants to consider:

- **Slot usage**: `prefix_icon`, `prefix_label`, `postfix_icon`, etc.
- **Controlled vs uncontrolled**: Show both patterns for input-like components
- **Style override**: Show a custom `style` prop being applied
- **Edge cases**: Long content, empty content, max values, etc.

### 2.5 Grouping Variants (Optional)

For components with many variants, group them in sub-sections using a flex row wrapper:

```jsx
{/* ── Group title ── */}
<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
  }}
>
  <CustomizedTooltip code={...}>
    <MyComponent variant="a" />
  </CustomizedTooltip>
  <CustomizedTooltip code={...}>
    <MyComponent variant="b" />
  </CustomizedTooltip>
</div>
```

### 2.6 State Management in Demos

If the component needs state to demonstrate (e.g. controlled input, toggle), use local `useState` inside the demo:

```jsx
const MyComponentDemo = () => {
  const { theme } = useContext(ConfigContext);
  const [value, setValue] = useState("");
  // ...
  return (
    // ...
    <CustomizedTooltip code={...}>
      <MyComponent value={value} set_value={setValue} />
    </CustomizedTooltip>
  );
};
```

---

## 3. Register in the Demo Host

Open `src/PAGEs/demo/demo.js` and make two changes:

### 3.1 Add the Import

Add the import in the `/* { Sections } */` block, alongside the existing demo imports:

```js
/* { Sections } -------------------------------------------------------------------------------------------------------------- */
// ... existing imports ...
import MyComponentDemo from "./individual_component_demo/my_component_demo";
// ... existing imports ...
/* { Sections } -------------------------------------------------------------------------------------------------------------- */
```

### 3.2 Render in the Components Tab

Find the `{tab === "Components" && (` block and add your demo component. Place it in a logical position among the existing demos:

```jsx
{
  tab === "Components" && (
    <div
      style={{
        position: "relative",
        margin: "0 auto",
        width: "75%",
        minWidth: 700,
        maxWidth: 1000,
        paddingBottom: "512px",
      }}
    >
      {/* ... existing demos ... */}
      <MyComponentDemo />
      {/* ... existing demos ... */}
    </div>
  );
}
```

No barrel/index file exists — each demo is imported directly by path.

---

## 4. Checklist

Before considering the demo complete, verify:

- [ ] Demo file created at `src/PAGEs/demo/individual_component_demo/<component_name>_demo.js`
- [ ] Imports `ConfigContext` and reads `theme` for colors/fonts
- [ ] Imports `CustomizedTooltip` from `../demo`
- [ ] Section title uses `fontSize: "48px"`, `fontFamily: "Jost"`, themed color
- [ ] Every instance wrapped in `<CustomizedTooltip code={...}>`
- [ ] Shows default state variant
- [ ] Shows disabled state variant
- [ ] Shows key interaction/prop variants
- [ ] Works correctly in both light and dark theme modes
- [ ] Registered in `demo.js` — import added + rendered in Components tab
- [ ] Default export used for the demo component

---

## 5. Complete Example

A minimal but complete demo file:

```jsx
// src/PAGEs/demo/individual_component_demo/tag_demo.js
import { useContext } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Tag from "../../../BUILTIN_COMPONENTs/tag/tag";
import { CustomizedTooltip } from "../demo";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

const TagDemo = () => {
  const { theme } = useContext(ConfigContext);
  const color = theme?.color || "black";

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
          color,
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
      >
        Tag
      </span>

      {/* Default */}
      <CustomizedTooltip
        code={`
\`\`\`js
<Tag label="Default" />
\`\`\`
`}
      >
        <Tag label="Default" />
      </CustomizedTooltip>

      {/* Dismissible */}
      <CustomizedTooltip
        code={`
\`\`\`js
<Tag label="Closable" dismissible />
\`\`\`
`}
      >
        <Tag label="Closable" dismissible />
      </CustomizedTooltip>

      {/* Disabled */}
      <CustomizedTooltip
        code={`
\`\`\`js
<Tag label="Disabled" disabled />
\`\`\`
`}
      >
        <Tag label="Disabled" disabled />
      </CustomizedTooltip>

      {/* Custom style */}
      <CustomizedTooltip
        code={`
\`\`\`js
<Tag
  label="Styled"
  style={{ backgroundColor: "#e0f7fa", color: "#006064" }}
/>
\`\`\`
`}
      >
        <Tag
          label="Styled"
          style={{ backgroundColor: "#e0f7fa", color: "#006064" }}
        />
      </CustomizedTooltip>
    </div>
  );
};

export default TagDemo;
```
