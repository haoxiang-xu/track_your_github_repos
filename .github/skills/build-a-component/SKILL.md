---
name: build-a-component
description: Build a new reusable UI component for the Mini UI component system. Use this skill when creating, scaffolding, or implementing a new component under src/BUILTIN_COMPONENTs, including its theme tokens, demo page, accessibility, and style override support. Keywords — component, widget, UI element, new component, scaffold, create component, add component, build component, reusable, BUILTIN_COMPONENTs.
---

# Build a Component — Mini UI

This skill covers how to create a new reusable component that fits the Mini UI component system. Follow every section in order.

---

## 1. Where Things Live

| Concern                | Path                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| Component source       | `src/BUILTIN_COMPONENTs/<component_name>/`                          |
| Theme tokens           | `src/BUILTIN_COMPONENTs/theme/default_mini_theme.json`              |
| Theme registry         | `src/BUILTIN_COMPONENTs/theme/theme_manifest.js`                    |
| ConfigContext provider | `src/CONTAINERs/config/container.js`                                |
| ConfigContext export   | `src/CONTAINERs/config/context.js`                                  |
| Demo page              | `src/PAGEs/demo/individual_component_demo/<component_name>_demo.js` |
| Demo host              | `src/PAGEs/demo/demo.js`                                            |
| Scrollable helper      | `src/BUILTIN_COMPONENTs/class/scrollable.js`                        |

Create the component folder, component file(s), add theme tokens, and create the demo file. Then register the demo in the main demo page.

---

## 2. Scaffold the Component File

Create `src/BUILTIN_COMPONENTs/<component_name>/<component_name>.js`.

### 2.1 Imports

```js
import { useCallback, useContext, useMemo, useRef, useState } from "react";
import { ConfigContext } from "../../CONTAINERs/config/context";
```

Import only the hooks you actually need. The `ConfigContext` import path is always two levels up from a component folder.

### 2.2 Component Signature

Use a single destructured props object. Follow existing naming conventions:

- **snake_case** for all prop names: `set_value`, `on_open_change`, `prefix_icon`, `default_value`, `max_tilt`, `border_radius`
- **Provide defaults** for every optional prop directly in the destructure
- **Callbacks default to no-op** `() => {}` so callers never crash on missing handlers
- **Include `style` prop** for instance-level overrides
- **Include `disabled` prop** (default `false`) for any interactive component

```js
const MyComponent = ({
  // content
  children,
  label,
  // behavior
  value,
  set_value = () => {},
  on_change = () => {},
  disabled = false,
  // slots
  prefix_icon,
  prefix_label,
  postfix_icon,
  postfix_label,
  // appearance
  style,
}) => {
  // ...
};
```

### 2.3 Theme Consumption

Read `theme` (and optionally `onThemeMode`) from context. The `theme` value is **already resolved** to the active mode — you access tokens directly as `theme.color`, `theme.input.fontSize`, etc. You do **not** need to access `theme.light_mode` or `theme.dark_mode`.

```js
const { theme, onThemeMode } = useContext(ConfigContext);
const isDark = onThemeMode === "dark_mode";
```

If your component has its own token block in the theme (e.g. `theme.myComponent`), destructure it:

```js
const my_theme = theme?.myComponent || {};
const fontSize = style?.fontSize || my_theme.fontSize || 14;
```

### 2.4 Style Resolution — Three-Layer Priority

Always resolve styles in this order:

1. **Component defaults** (hardcoded fallback)
2. **Theme tokens** (from `ConfigContext`)
3. **Instance `style` prop** (highest priority)

Use `useMemo` to compute derived style objects:

```js
const colors = useMemo(() => {
  const bg =
    style?.backgroundColor ??
    my_theme?.backgroundColor ??
    (isDark ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)");
  const color = style?.color ?? theme?.color ?? (isDark ? "#CCC" : "#222");
  return { bg, color };
}, [isDark, theme, my_theme, style]);
```

For complex components, support **slot-based styling** with structured keys (see how `Button` uses `root`, `background`, `content`, `state`). Deep-merge nested style objects instead of replacing entire trees.

### 2.5 Controlled vs Uncontrolled (Input-Like Components)

If the component accepts user input, support both modes:

```js
const [internalValue, setInternalValue] = useState(default_value ?? "");
const currentValue = value !== undefined ? value : internalValue;

const handleChange = useCallback(
  (newVal) => {
    if (value === undefined) setInternalValue(newVal);
    set_value(newVal);
    on_change(newVal);
  },
  [value, set_value, on_change],
);
```

- **Controlled**: caller provides `value` — component uses it directly
- **Uncontrolled**: no `value` prop — component manages its own `useState`

### 2.6 Interaction States

Every interactive component must visually express:

| State            | Implementation                                                    |
| ---------------- | ----------------------------------------------------------------- |
| `hover`          | Track via `onMouseEnter`/`onMouseLeave` or CSS `:hover`           |
| `focus`          | Track via `onFocus`/`onBlur`, show outline or ring                |
| `active/pressed` | Track via `onMouseDown`/`onMouseUp`                               |
| `disabled`       | Grey out, block pointer events, set `opacity`, guard all handlers |

Use smooth transitions consistent with the codebase:

```css
transition: all 0.2s ease;
/* or */
transition: background-color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
```

### 2.7 Accessibility

Apply these patterns based on component type:

- **Composite controls** (select, combobox): `role="combobox"`, `role="listbox"`, `role="option"`
- **Modal/dialog**: `role="dialog"`, `aria-modal="true"`
- **Keyboard navigation**: Arrow keys for lists/options, Enter to confirm, Escape to close/cancel, Tab for focus order
- **Disabled**: include `aria-disabled="true"` alongside visual treatment

### 2.8 Typography

Use the project's established font stack:

| Purpose             | Font           |
| ------------------- | -------------- |
| UI labels, headings | `Jost`         |
| Readable body text  | `NunitoSans`   |
| Code / monospace    | `HackNerdFont` |

Read font from theme when available: `theme?.font?.fontFamily || "Jost"`.

### 2.9 Scrollable Areas

If your component has a scrollable container, add `className="scrollable"` to the scrollable element. The global scrollable subsystem (`src/BUILTIN_COMPONENTs/class/scrollable.js`) uses `MutationObserver` to auto-discover these elements and apply themed overlay scrollbars.

```jsx
<div className="scrollable" style={{ overflow: "auto", maxHeight: 300 }}>
  {children}
</div>
```

### 2.10 Export

Use **default export** for the primary component. Attach sub-components as static properties. Use **named exports** for variant components in the same file.

```js
// Sub-component pattern
MyComponent.Item = ({ children, style }) => ( /* ... */ );

// Default + named exports
export { MyComponentVariantA, MyComponentVariantB };
export default MyComponent;
```

---

## 3. Add Theme Tokens

Open `src/BUILTIN_COMPONENTs/theme/default_mini_theme.json`.

The file has two top-level keys: `"light_mode"` and `"dark_mode"`. Add a new key for your component **in both modes** with mode-appropriate values.

```json
{
  "light_mode": {
    "myComponent": {
      "fontSize": 14,
      "backgroundColor": "#FFFFFF",
      "color": "#222222",
      "borderRadius": 6,
      "border": "1px solid rgba(0, 0, 0, 0.08)"
    }
  },
  "dark_mode": {
    "myComponent": {
      "fontSize": 14,
      "backgroundColor": "#1E1E1E",
      "color": "#CCCCCC",
      "borderRadius": 6,
      "border": "1px solid rgba(255, 255, 255, 0.08)"
    }
  }
}
```

Follow the naming conventions of existing token blocks. Group related values (e.g. nest `state.hover`, `state.active`, `state.disabled` for stateful components). Use camelCase for token keys.

---

## 4. Create the Demo

Create `src/PAGEs/demo/individual_component_demo/<component_name>_demo.js`.

### 4.1 Demo Structure

```jsx
import { useContext } from "react";
import { ConfigContext } from "../../../CONTAINERs/config/context";
import MyComponent from "../../../BUILTIN_COMPONENTs/my_component/my_component";
import { CustomizedTooltip } from "../demo";

const MyComponentDemo = () => {
  const { theme } = useContext(ConfigContext);
  const color = theme?.color || "#222";
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
          fontFamily,
          color,
          userSelect: "none",
        }}
      >
        My Component
      </span>

      {/* Default state */}
      <CustomizedTooltip code={`\`\`\`js\n<MyComponent />\n\`\`\``}>
        <MyComponent />
      </CustomizedTooltip>

      {/* Disabled state */}
      <CustomizedTooltip code={`\`\`\`js\n<MyComponent disabled />\n\`\`\``}>
        <MyComponent disabled />
      </CustomizedTooltip>

      {/* Style override variant */}
      <CustomizedTooltip
        code={`\`\`\`js\n<MyComponent style={{ backgroundColor: "#e0f7fa" }} />\n\`\`\``}
      >
        <MyComponent style={{ backgroundColor: "#e0f7fa" }} />
      </CustomizedTooltip>
    </div>
  );
};

export default MyComponentDemo;
```

### 4.2 Required Demo Coverage

Every demo must show at minimum:

- **Default state** — component with no special props
- **Themed appearance** — component renders correctly in both light and dark mode (verified by switching themes on the demo page)
- **Disabled state** — `disabled` prop applied
- **Key interaction variants** — hover, focus, slot usage, controlled vs uncontrolled, etc.

Wrap each demo instance in `<CustomizedTooltip code={...}>` so the JSX source is visible on hover.

### 4.3 Register the Demo

Open `src/PAGEs/demo/demo.js` and:

1. Import the new demo component at the top
2. Render it in the "Components" tab section alongside other individual demos

There is no barrel file — each demo is imported by its direct path.

---

## 5. Pre-Merge Checklist

Before considering the component complete, verify every item:

- [ ] **Theme**: Reads tokens from `ConfigContext`; tokens added to both `light_mode` and `dark_mode` in `default_mini_theme.json`
- [ ] **Style overrides**: Supports instance `style` prop without breaking default appearance
- [ ] **Controlled/uncontrolled**: If input-like, works in both modes
- [ ] **Keyboard support**: If interactive, handles relevant keys (Arrow, Enter, Escape, Tab)
- [ ] **Disabled state**: Visually muted, pointer events blocked, handlers guarded
- [ ] **Accessibility**: Appropriate ARIA roles and attributes
- [ ] **Typography**: Uses `Jost` / `NunitoSans` / `HackNerdFont` from theme, not hardcoded foreign fonts
- [ ] **Scrollable**: If scrollable, uses `className="scrollable"` for themed scrollbars
- [ ] **Demo**: Demo file created, registered in `demo.js`, covers default/disabled/themed/interactive states
- [ ] **Naming**: All props use `snake_case`, callbacks default to `() => {}`
- [ ] **Transitions**: Interactive state changes use smooth, short transitions matching existing components

---

## 6. Complete Example — Minimal Component

Below is a minimal but complete component following all standards:

```js
// src/BUILTIN_COMPONENTs/tag/tag.js
import { useContext, useMemo, useState, useCallback } from "react";
import { ConfigContext } from "../../CONTAINERs/config/context";

const Tag = ({
  children,
  label,
  on_click = () => {},
  on_dismiss = () => {},
  dismissible = false,
  disabled = false,
  style,
}) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const tag_theme = theme?.tag || {};

  const [hovered, setHovered] = useState(false);

  const resolved = useMemo(
    () => ({
      bg:
        style?.backgroundColor ??
        tag_theme?.backgroundColor ??
        (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
      color:
        style?.color ??
        tag_theme?.color ??
        theme?.color ??
        (isDark ? "#CCC" : "#222"),
      fontSize: style?.fontSize ?? tag_theme?.fontSize ?? 13,
      borderRadius: style?.borderRadius ?? tag_theme?.borderRadius ?? 4,
      fontFamily: theme?.font?.fontFamily ?? "Jost",
    }),
    [isDark, theme, tag_theme, style],
  );

  const handleClick = useCallback(() => {
    if (disabled) return;
    on_click();
  }, [disabled, on_click]);

  const handleKeyDown = useCallback(
    (e) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        on_click();
      }
    },
    [disabled, on_click],
  );

  return (
    <span
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 10px",
        fontSize: resolved.fontSize,
        fontFamily: resolved.fontFamily,
        color: resolved.color,
        backgroundColor:
          hovered && !disabled
            ? isDark
              ? "rgba(255,255,255,0.14)"
              : "rgba(0,0,0,0.10)"
            : resolved.bg,
        borderRadius: resolved.borderRadius,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.45 : 1,
        transition: "background-color 0.15s ease, opacity 0.15s ease",
        userSelect: "none",
        ...style,
      }}
    >
      {label ?? children}
      {dismissible && !disabled && (
        <span
          role="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            on_dismiss();
          }}
          style={{ marginLeft: 2, cursor: "pointer", opacity: 0.6 }}
        >
          ×
        </span>
      )}
    </span>
  );
};

export default Tag;
```

This example demonstrates: theme consumption, three-layer style resolution, controlled interaction states, accessibility attributes, keyboard support, disabled handling, smooth transitions, and proper export.
