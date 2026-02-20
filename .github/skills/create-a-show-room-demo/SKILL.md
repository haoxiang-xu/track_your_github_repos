---
name: create-a-show-room-demo
description: Create a show room demo for the Mini UI showcase. Show rooms are realistic, multi-component scenario demos that demonstrate how Mini UI components work together in a real-world UI. Use this skill when building a settings page, chat interface, dashboard, or any composed UI scene. Keywords — showroom, show room, scenario demo, realistic demo, composed demo, integration demo, settings, chat, dashboard, full page demo.
---

# Create a Show Room Demo — Mini UI

This skill covers how to create a show room demo — a realistic, multi-component scenario that demonstrates how Mini UI components compose together in a production-like context. Show rooms appear in the "Show Rooms" tab of the demo page.

---

## 1. File Locations

| Concern                  | Path                                               |
| ------------------------ | -------------------------------------------------- |
| New showroom file        | `src/PAGEs/demo/show_room_demo/<name>_showroom.js` |
| Demo host (registration) | `src/PAGEs/demo/demo.js`                           |
| ConfigContext            | `src/CONTAINERs/config/context.js`                 |
| Components               | `src/BUILTIN_COMPONENTs/*/`                        |

---

## 2. How Show Rooms Differ from Component Demos

| Aspect           | Component Demo                                | Show Room Demo                                                                    |
| ---------------- | --------------------------------------------- | --------------------------------------------------------------------------------- |
| Purpose          | Showcase individual component variants        | Demonstrate realistic multi-component UIs                                         |
| Scope            | Single component family                       | Multiple components working together                                              |
| Layout           | Flat flex-wrap grid of instances              | Structured app-like layout (panels, headers, sidebars)                            |
| Tooltip wrapping | Every instance wrapped in `CustomizedTooltip` | **Not used** — show rooms present a realistic scene, not individual code snippets |
| State            | Minimal local state for controlled demos      | Rich stateful interactions (navigation, mock data, form state)                    |
| Naming           | `<ComponentName>Demo`                         | `<SceneName>Showroom`                                                             |
| File naming      | `<component_name>_demo.js`                    | `<scene_name>_showroom.js`                                                        |

---

## 3. Create the Show Room File

Create `src/PAGEs/demo/show_room_demo/<name>_showroom.js`.

### 3.1 Import Structure

```js
import {
  useState,
  useContext,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../../../BUILTIN_COMPONENTs/icon/icon";
import Button from "../../../BUILTIN_COMPONENTs/input/button";
import Select from "../../../BUILTIN_COMPONENTs/select/select";
import { SemiSwitch } from "../../../BUILTIN_COMPONENTs/input/switch";
import { ConfirmModal } from "../../../BUILTIN_COMPONENTs/modal/modal";
// ... import whatever components the scenario needs
/* { Components } ------------------------------------------------------------------------------------------------------------ */
```

Key rules:

- Import from `../../../CONTAINERs/config/context` (three levels up)
- Import components from `../../../BUILTIN_COMPONENTs/<component_name>/`
- Import only what the scenario uses — show rooms may use many different components
- **Do NOT import `CustomizedTooltip`** — show rooms don't wrap instances in code tooltips

### 3.2 Architectural Pattern

Show rooms follow a **compositional architecture** with internal helper components:

1. **Helper components** — small, local-to-file sub-components for repeated UI patterns (e.g. `SettingsRow`, `SettingsSection`, `ChatBubble`)
2. **Page/section components** — larger chunks that represent distinct areas (e.g. `GeneralPage`, `ProfilePage`, `AccountPage`)
3. **Main showroom component** — the exported root that orchestrates layout and navigation

```
┌─ Helper components (SettingsRow, SettingsSection, etc.)
├─ Section/page components (GeneralPage, ProfilePage, etc.)
└─ Main showroom export (SettingsShowroom)
```

### 3.3 Helper Components

Define small, reusable layout helpers at the top of the file. These consume `ConfigContext` directly:

```jsx
const SettingsRow = ({ label, description, children }) => {
  const { theme } = useContext(ConfigContext);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 0",
        gap: 24,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontFamily: theme?.font?.fontFamily || "inherit",
            color: theme?.color || "#222",
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: 12,
              fontFamily: theme?.font?.fontFamily || "inherit",
              color: theme?.color || "#222",
              opacity: 0.45,
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
};
```

Use the banner-comment style for visual separation:

```js
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  ComponentName — brief description                                                                       */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
```

### 3.4 Mock Data

Define mock/seed data as module-level constants:

```js
const INITIAL_MESSAGES = [
  { id: "1", role: "user", content: "Can you explain what a closure is?" },
  {
    id: "2",
    role: "assistant",
    content: "A **closure** is a function that...",
  },
];

const PAGES = [
  {
    key: "general",
    icon: "settings",
    label: "General",
    component: GeneralPage,
  },
  { key: "profile", icon: "user", label: "Profile", component: ProfilePage },
];
```

- Use `const` at module level
- Give data realistic, meaningful content
- Include enough entries to make the UI feel populated but not overwhelming

### 3.5 Main Showroom Component — Container Shell

The showroom root component creates a realistic **container panel** with:

- Fixed dimensions (e.g. `maxWidth: 820`, `height: 520` or `height: 580`)
- Rounded corners (`borderRadius: 14`)
- Theme-aware background, border, and shadow
- Internal layout structure (sidebar + content, or header + body + footer)

```jsx
const MyShowroom = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 820,
        margin: "0 auto",
        height: 520,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isDark
          ? "0 16px 48px rgba(0,0,0,0.4)"
          : "0 16px 48px rgba(0,0,0,0.08)",
        fontFamily: theme?.font?.fontFamily || "inherit",
      }}
    >
      {/* Internal layout... */}
    </div>
  );
};
```

### 3.6 Common Layout Patterns

#### Sidebar + Content (Settings style)

```
┌──────────┬───────────────────────────┐
│ Sidebar  │ Content Area              │
│ (nav)    │ (scrollable)              │
│          │                           │
│          │                           │
└──────────┴───────────────────────────┘
```

```jsx
{
  /* ── side menu ── */
}
<div
  style={{
    width: 200,
    flexShrink: 0,
    backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)",
    padding: "16px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    borderRight: isDark
      ? "1px solid rgba(255,255,255,0.06)"
      : "1px solid rgba(0,0,0,0.06)",
  }}
>
  {/* Navigation buttons */}
</div>;

{
  /* ── content area ── */
}
<div
  className="scrollable"
  style={{
    flex: 1,
    overflowY: "auto",
    padding: "16px 32px",
  }}
>
  {/* Active page */}
</div>;
```

#### Header + Body + Footer (Chat style)

```
┌─────────────────────────────────────┐
│ Header (fixed)                      │
├─────────────────────────────────────┤
│ Body (scrollable, flex: 1)          │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ Footer / Input (fixed)              │
└─────────────────────────────────────┘
```

```jsx
<div style={{ display: "flex", flexDirection: "column" /* ... */ }}>
  {/* ── header ── */}
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 20px",
      borderBottom: isDark
        ? "1px solid rgba(255,255,255,0.06)"
        : "1px solid rgba(0,0,0,0.06)",
      flexShrink: 0,
    }}
  >
    {/* ... */}
  </div>

  {/* ── body ── */}
  <div
    className="scrollable"
    style={{ flex: 1, overflowY: "auto", padding: "20px 0" }}
  >
    {/* ... */}
  </div>

  {/* ── footer ── */}
  <div style={{ flexShrink: 0, padding: "0px 20px 16px" }}>{/* ... */}</div>
</div>
```

### 3.7 Theme-Aware Styling

All colors, borders, and shadows must adapt to light/dark mode:

```js
const isDark = onThemeMode === "dark_mode";

// Background
const bg = isDark ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.95)";

// Borders
const border = isDark
  ? "1px solid rgba(255,255,255,0.08)"
  : "1px solid rgba(0,0,0,0.06)";

// Shadows
const shadow = isDark
  ? "0 16px 48px rgba(0,0,0,0.4)"
  : "0 16px 48px rgba(0,0,0,0.08)";

// Subtle backgrounds (sidebar, hover)
const subtleBg = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.025)";

// Text color — always from theme
const color = theme?.color || "#222";

// Font family — always from theme
const fontFamily = theme?.font?.fontFamily || "inherit";
```

### 3.8 Interactive State Management

Show rooms must have realistic interactions:

```jsx
const [selectedKey, setSelectedKey] = useState("general"); // navigation
const [messages, setMessages] = useState(INITIAL_MESSAGES); // content list
const [inputValue, setInputValue] = useState(""); // form input
const [modalOpen, setModalOpen] = useState(false); // modal toggle
```

Use `useCallback` for handlers, especially those passed to Mini UI components:

```jsx
const sendMessage = useCallback(() => {
  const text = inputValue.trim();
  if (!text) return;
  setMessages((prev) => [
    ...prev,
    { id: String(Date.now()), role: "user", content: text },
  ]);
  setInputValue("");
}, [inputValue]);
```

### 3.9 Scrollable Areas

Use `className="scrollable"` on any overflow container. The global scrollable subsystem handles themed overlay scrollbars automatically:

```jsx
<div className="scrollable" style={{ flex: 1, overflowY: "auto" }}>
  {/* scrollable content */}
</div>
```

### 3.10 Transitions

Match the codebase's transition language:

```css
transition:
  background-color 0.22s ease,
  box-shadow 0.22s ease;
transition:
  opacity 0.18s ease,
  transform 0.18s cubic-bezier(0.25, 1, 0.5, 1);
```

### 3.11 Export

Use **default export** for the main showroom component:

```js
export default MyShowroom;
```

---

## 4. Register in the Demo Host

Open `src/PAGEs/demo/demo.js` and make two changes:

### 4.1 Add the Import

Add the import in the `/* { Sections } */` block:

```js
/* { Sections } -------------------------------------------------------------------------------------------------------------- */
// ... existing imports ...
import MyShowroom from "./show_room_demo/my_showroom";
// ... existing imports ...
/* { Sections } -------------------------------------------------------------------------------------------------------------- */
```

### 4.2 Render in the Show Rooms Tab

Find the `{tab === "Show Rooms" && (` block and add your showroom component:

```jsx
{
  tab === "Show Rooms" && (
    <div
      style={{
        position: "relative",
        margin: "0 auto",
        width: "85%",
        minWidth: 700,
        maxWidth: 1000,
        paddingBottom: "512px",
        display: "flex",
        flexDirection: "column",
        gap: 48,
        padding: "32px 24px 512px",
      }}
    >
      <SettingsShowroom />
      <ChatShowroom />
      <MyShowroom />
    </div>
  );
}
```

Note the Show Rooms container uses `width: "85%"` (vs `75%` for Components), and `gap: 48` for vertical spacing between showrooms.

---

## 5. Design Guidelines

### 5.1 Realism Over Completeness

- Show rooms should **look and feel like a real app section** — not a component catalog
- Use realistic content (names, emails, settings labels, message text)
- Don't try to demo every component variant — focus on a coherent user experience
- Include enough interactive state that the UI feels alive (navigation works, forms accept input, modals open/close)

### 5.2 Component Composition

A good show room uses **3–8 different Mini UI components** working together. Common combinations:

| Scenario       | Typical components                  |
| -------------- | ----------------------------------- |
| Settings page  | Button, Select, Switch, Modal, Icon |
| Chat interface | Button, TextField, Markdown, Icon   |
| Dashboard      | Card, Button, Icon, Select, Spinner |
| Form/wizard    | Input, Select, Button, Modal        |
| File browser   | Explorer, Button, Icon, Modal       |

### 5.3 Self-Contained

Each showroom should be fully self-contained:

- All state managed internally (no external props required, though `onClose` can be accepted)
- All mock data defined in the same file
- No side effects on mount (no API calls, no localStorage writes)
- Callbacks for mini UI components that aren't wired up should use `() => {}` no-ops

### 5.4 Dimensions

Keep consistent container sizing:

- `maxWidth: 820` — standard panel width
- `height: 500–600` — tall enough to show meaningful content
- `borderRadius: 14` — matches existing showrooms
- `margin: "0 auto"` — center in the Show Rooms tab

---

## 6. Checklist

Before considering the showroom complete, verify:

- [ ] File created at `src/PAGEs/demo/show_room_demo/<name>_showroom.js`
- [ ] Reads `theme` and `onThemeMode` from `ConfigContext`
- [ ] All colors, borders, shadows adapt to light/dark mode
- [ ] Uses `theme?.font?.fontFamily || "inherit"` for typography
- [ ] Scrollable areas use `className="scrollable"`
- [ ] Container has realistic dimensions (`maxWidth: 820`, `height: ~520`, `borderRadius: 14`)
- [ ] Uses 3+ Mini UI components in composition
- [ ] Has meaningful interactive state (navigation, form input, toggles)
- [ ] Mock data is realistic and self-contained
- [ ] Has visual section separators (banner comments in code)
- [ ] Transitions use codebase-consistent timing
- [ ] Default export used for the main showroom component
- [ ] Registered in `demo.js` — import added + rendered in Show Rooms tab
- [ ] Does NOT import or use `CustomizedTooltip`

---

## 7. Complete Example Skeleton

A minimal show room skeleton:

```jsx
// src/PAGEs/demo/show_room_demo/dashboard_showroom.js
import { useState, useContext, useMemo } from "react";

/* { Contexts } -------------------------------------------------------------------------------------------------------------- */
import { ConfigContext } from "../../../CONTAINERs/config/context";
/* { Contexts } -------------------------------------------------------------------------------------------------------------- */

/* { Components } ------------------------------------------------------------------------------------------------------------ */
import Icon from "../../../BUILTIN_COMPONENTs/icon/icon";
import Button from "../../../BUILTIN_COMPONENTs/input/button";
import Card from "../../../BUILTIN_COMPONENTs/card/card";
import Select from "../../../BUILTIN_COMPONENTs/select/select";
/* { Components } ------------------------------------------------------------------------------------------------------------ */

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  StatCard — a single metric display                                                                      */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const StatCard = ({ label, value, icon }) => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  return (
    <Card width={180} height={120} style={{ padding: "16px 20px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon src={icon} style={{ width: 16, height: 16, opacity: 0.5 }} />
          <span
            style={{
              fontSize: 12,
              fontFamily: theme?.font?.fontFamily || "inherit",
              color: theme?.color || "#222",
              opacity: 0.5,
            }}
          >
            {label}
          </span>
        </div>
        <span
          style={{
            fontSize: 28,
            fontFamily: theme?.font?.fontFamily || "inherit",
            color: theme?.color || "#222",
          }}
        >
          {value}
        </span>
      </div>
    </Card>
  );
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  DashboardShowroom                                                                                        */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const DashboardShowroom = () => {
  const { theme, onThemeMode } = useContext(ConfigContext);
  const isDark = onThemeMode === "dark_mode";
  const color = theme?.color || "#222";
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 820,
        margin: "0 auto",
        height: 520,
        borderRadius: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isDark
          ? "rgba(30, 30, 30, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        border: isDark
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid rgba(0,0,0,0.06)",
        boxShadow: isDark
          ? "0 16px 48px rgba(0,0,0,0.4)"
          : "0 16px 48px rgba(0,0,0,0.08)",
        fontFamily: theme?.font?.fontFamily || "inherit",
      }}
    >
      {/* ── header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          borderBottom: isDark
            ? "1px solid rgba(255,255,255,0.06)"
            : "1px solid rgba(0,0,0,0.06)",
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16, color }}>Dashboard</span>
        <Select
          options={[
            { value: "24h", label: "Last 24h" },
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
          ]}
          value={timeRange}
          set_value={setTimeRange}
          filterable={false}
          style={{ minWidth: 130, fontSize: 13 }}
        />
      </div>

      {/* ── body ── */}
      <div
        className="scrollable"
        style={{ flex: 1, overflowY: "auto", padding: 24 }}
      >
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <StatCard label="Users" value="1,284" icon="user" />
          <StatCard label="Sessions" value="3,891" icon="global" />
          <StatCard label="Revenue" value="$12.4k" icon="star" />
          <StatCard label="Growth" value="+8.2%" icon="arrow_up" />
        </div>
      </div>
    </div>
  );
};

export default DashboardShowroom;
```
