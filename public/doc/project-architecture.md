# Mini UI Project Architecture

This document summarizes the current architecture of the repository based on the actual code structure.

## 1. Runtime Entry Path

1. `src/index.js` mounts `App`.
2. `App` wraps all content with `ConfigContainer`.
3. Routing is provided by `mini_router`.
4. Current route surface has a single active page: `/mini` -> demo page.

Key files:

- `src/index.js`
- `src/App.js`

## 2. High-Level Layers

### 2.1 Application Shell Layer

- Provides bootstrapping and top-level routing.
- Currently demo-oriented (not yet a business multi-page app shell).

### 2.2 Global Config Layer

`ConfigContainer` is the architectural center:

- Theme state (`light_mode` / `dark_mode`)
- Sync mode with system theme
- Environment info (`window_size`, browser, device type)
- Global scrollbar subsystem mount (`<Scrollable />`)

Key files:

- `src/CONTAINERs/config/container.js`
- `src/CONTAINERs/config/context.js`
- `src/BUILTIN_COMPONENTs/theme/default_mini_theme.json`
- `src/BUILTIN_COMPONENTs/theme/theme_manifest.js`

### 2.3 Platform Utilities Layer (`mini_react`)

- Router adapter abstraction (`mini_router`)
- Environment hooks (`mini_use`)
- Storage adapter + IndexedDB fallback (`mini_storage`)
- Optional Material wrapper (`mini_material`, currently not integrated into app flow)

Key files:

- `src/BUILTIN_COMPONENTs/mini_react/mini_router.js`
- `src/BUILTIN_COMPONENTs/mini_react/mini_use.js`
- `src/BUILTIN_COMPONENTs/mini_react/mini_storage.js`
- `src/BUILTIN_COMPONENTs/mini_react/mini_material.js`

### 2.4 Built-in Component Layer

Component capabilities are grouped under `src/BUILTIN_COMPONENTs`:

- Inputs: `input`, `select`, `switch`, `slider`, `textfield`, `button`, `segmented_button`
- Feedback/display: `modal`, `tooltip`, `spinner`, `code`, `markdown`, `icon`, `card`
- Advanced interactions: `dnd`, `flow_editor`, `explorer`
- Visual backgrounds: `background/*`

Design pattern used broadly:

1. Local defaults
2. Theme token merge from `ConfigContext`
3. Per-instance style overrides

### 2.5 Demo/Showroom Layer

- `PAGEs/demo/demo.js` is the showcase container.
- `individual_component_demo` contains atomic demos.
- `show_room_demo` contains realistic scenario demos (`settings`, `chat`).

Key files:

- `src/PAGEs/demo/demo.js`
- `src/PAGEs/demo/individual_component_demo/*`
- `src/PAGEs/demo/show_room_demo/settings_showroom.js`
- `src/PAGEs/demo/show_room_demo/chat_showroom.js`

## 3. Global Behavior Subsystems

### 3.1 Scrollable Subsystem

- `class/scrollable.js` injects custom scrollbar overlays for `.scrollable` elements.
- Uses `MutationObserver` + `ResizeObserver` + direct DOM manipulation.
- Works as a global side-effect system.

### 3.2 Tooltip Open-State Coordinator

- `tooltip_trigger_listener.js` is a global singleton.
- Enforces one-open-tooltip-at-a-time behavior across app.

## 4. Current Route and Feature Surface

- Active route count: 1 (`/mini`)
- Primary objective of current runtime: component showcase and interaction verification

## 5. Dependency-to-Feature Mapping

- `@dnd-kit/*` -> DnD subsystem (`BUILTIN_COMPONENTs/dnd`)
- `react-showdown` -> Markdown rendering
- `highlight.js` -> Code block highlighting
- `react-spring` -> animation in spinner and demos
- `react-router-dom` -> routing via `mini_router`

Note:

- `vanilla-tilt` exists in dependencies, but the current card implementation is custom and does not import it directly.

## 6. Scale / Complexity Hotspots

Largest implementation files currently include:

- `select/select.js`
- `explorer/explorer.js`
- `input/input.js`
- `tooltip/tooltip.js`
- `input/slider.js`
- `flow_editor/flow_editor.js`

These are the main maintenance hotspots and refactor candidates.

## 7. Testing and Docs Status

- Test setup is still close to CRA scaffold defaults and does not reflect current demo architecture.
- Component standard document already exists:
  - `doc/component-standards.md`

## 8. Architectural Characteristics

The repository is best described as:

- A React app shell
- Plus a built-in component system
- Plus a demo-driven validation surface

This is not yet structured as:

- A packaged standalone component library
- Or a production multi-domain business app

## 9. Immediate Improvement Opportunities

1. Split large files (especially `select`, `explorer`, `tooltip`, `input`) into smaller modules.
2. Introduce architecture-aligned tests (component interaction + keyboard + theme variants).
3. Clarify production routing strategy beyond `/mini`.
4. Isolate global side-effect subsystems behind clearer boundaries and lifecycle contracts.

