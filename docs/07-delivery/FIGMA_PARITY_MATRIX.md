# Figma Parity Matrix (Canvas-First Redesign)

## Source
- Figma file: `E8ZByfnF6kHDq53h4jHy9P`
- Main page node: `0:1`
- Extraction method:
  - `get_screenshot` succeeded.
  - `get_metadata` succeeded.
  - `get_design_context` currently blocked by Figma MCP Starter rate limit.

## Verified Targets from Metadata
- Tree canvas with contextual side drawer and floating toolbar.
- Member directory with search bar, action CTA, filter row, and card grid rhythm.
- Stories timeline with chronology rail and article cards.
- Header/nav variants for desktop and mobile.
- Loading skeleton state and offline fallback state.

## Locked Parity Contract
- Match layout and style as close as possible to Figma.
- Keep real app data, permissions, route guards, and server-side behavior unchanged.
- No mock-only data insertion from Figma.

## Pending Verification (due to rate limit)
- Exact token-level spacing per frame (all internal paddings/margins).
- Exact typography point sizes and line-heights per text node.
- Exact per-component shadow radii/blur spread in all variants.
- Exact icon stroke widths and per-breakpoint size tweaks.

## Fallback Defaults Used Until MCP Unblocks
- Warm-neutral palette with bark/clay/sand hierarchy from existing design system.
- Radius ladder: 8/16/24/32/40.
- Motion: 120ms interactive, 220ms base, 280ms panel.
- Focus ring: 3px rust with 2px offset.

## Acceptance Gate
- Once MCP quota is available again:
  1. Extract `get_design_context` for root canvas, drawer, directory, timeline, loading/offline frames.
  2. Replace fallback token assumptions with exact node-derived values.
  3. Re-run screenshot parity checks for mobile `390x844` and desktop `1440x900`.
