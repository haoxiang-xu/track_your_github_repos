# Mini UI Version Updates

This document tracks notable updates to component APIs and behavior.

## 2026-02-18

### Component Naming Migration

- `TextField` family:
  - previous default `TextField` was renamed to `FloatingTextField`
  - `GhostTextField` is now exported as `TextField` (default)
- `Input` family:
  - previous default `Input` was renamed to `SinkingInput`
  - `FlowingInput` was renamed to `FloatingInput`
  - `GhostInput` is now exported as `Input` (default)
- `Select` family:
  - previous default `Select` was renamed to `SinkingSelect`
  - `FlowingSelect` was renamed to `FloatingSelect`
  - `GhostSelect` is now exported as `Select` (default)

### Reference Updates

- Updated demo and showroom pages to use the new API names consistently.
- Removed old naming references (`Flowing*`, `Ghost*` where replaced by defaults).

### Input Layout Fixes

- Fixed `SinkingInput` prefix icon shrinking on initial load before focus.
- Fixed label left offset when prefix content is present.
- Improved label position stability by measuring from the real input position.

