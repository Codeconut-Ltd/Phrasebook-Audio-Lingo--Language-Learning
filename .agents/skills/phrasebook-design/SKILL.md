---
name: phrasebook-design
description: Apply Phrasebook’s visual system when creating, editing, reviewing, or debugging UI, styling, themes, components, accessibility, or responsive layouts in this project. Triggers on design, redesign, UI, UX, CSS, Tailwind, component, theme, dark mode, mobile, and WCAG work.
---
# Phrasebook Design

## When to use
- Create or change any user-facing screen or control.
- Review layout, styling, theme persistence, responsive behavior, or accessibility.
- Resolve visual regressions or introduce a new reusable UI pattern.

## Source of truth
Read `_docs/DESIGN.md` before editing UI. Treat it as authoritative for semantic colors, type, geometry, spacing, states, motion, and responsive behavior.

## Invariants
- Use components from `@/design-system/phrasebook` when an equivalent exists.
- Use semantic Tailwind tokens; never add raw palette values in feature components.
- Preserve first-class light and dark themes and the saved theme choice.
- Keep the Phrasebook wordmark text-only. Never add mascots or copy another learning brand.
- Keep color secondary to explicit text or icons for every status.
- Preserve the product’s calm, manual learning model; never add gamification through visual design.

## Before finishing
Check both themes, keyboard focus, WCAG AA contrast, long multilingual text, 390px mobile, 1280px desktop, fixed controls, and library table scrolling.
