# Mini UI Component Standards

This document defines the current implementation standards for designing and building components in this repository.

## 1. Scope

These standards apply to all reusable UI components under:

- `src/BUILTIN_COMPONENTs`
- related demos under `src/PAGEs/demo`

## 2. Theme-First Architecture

Every component should read visual tokens from `ConfigContext` and support both `light_mode` and `dark_mode`.

- Theme source: `src/BUILTIN_COMPONENTs/theme/default_mini_theme.json`
- Theme injection: `src/CONTAINERs/config/container.js`

Required behavior:

- Use theme tokens as primary style source.
- Provide sensible local fallback values if a token is missing.
- Respect `onThemeMode` where mode-specific behavior is needed.

## 3. Style Override Priority

Use this precedence when resolving style:

1. Component defaults
2. Theme tokens
3. Instance-level `style` overrides

For complex components, support structured slot styling (example: `Button` uses `root/background/content/state`) and deep merge nested objects instead of replacing entire style trees.

## 4. API Conventions

Use consistent prop naming across components:

- Prefer existing project naming style: `set_value`, `on_open_change`, `prefix_icon`, `default_value`
- Keep controlled and uncontrolled modes where applicable:
  - controlled: external `value` is provided
  - uncontrolled: internal state fallback

Patterns to preserve:

- Content slots: `prefix_*`, `postfix_*`
- Functional callbacks default to no-op (`() => {}`) to keep integration safe
- Optional `style` object for instance customization

## 5. Interaction and Motion

Components should provide clear interaction states:

- `hover`
- `focus`
- `active/pressed`
- `disabled`

Use short, smooth transitions (existing code favors `ease` and `cubic-bezier` timing) and preserve the visual language already used by Button/Input/Select/TextField families.

## 6. Accessibility Baseline

Keep and extend current accessibility patterns:

- Semantic roles for composite controls (example: `combobox`, `listbox`, `option`)
- Keyboard interactions (Arrow, Enter, Escape, Tab where relevant)
- Modal semantics (`role="dialog"`, `aria-modal="true"`)
- Clear disabled behavior in both logic and visuals

## 7. Typography and Visual Tokens

Typography and baseline fonts should remain aligned with current setup:

- UI text: `Jost`
- Readability text: `NunitoSans`
- Monospace/code: `HackNerdFont` (or code fallback stack where already defined)

Do not hardcode unrelated font systems in new components unless there is a clear product reason.

## 8. Scroll and Overlay Behavior

If a component introduces scrollable areas, align with the existing `.scrollable` approach and shared custom scrollbar behavior provided by:

- `src/BUILTIN_COMPONENTs/class/scrollable.js`

## 9. Demo Coverage Requirement

Every new reusable component should have a demo entry under:

- `src/PAGEs/demo/individual_component_demo`

Demo should show at minimum:

- Default state
- Themed appearance
- Disabled state
- Key interaction variant(s)

## 10. New Component Checklist

Before merging a new component, verify:

- Reads from `ConfigContext` theme
- Supports style overrides without breaking defaults
- Has controlled/uncontrolled behavior if input-like
- Includes keyboard support if interactive
- Handles disabled state correctly
- Has demo coverage in the showcase page

