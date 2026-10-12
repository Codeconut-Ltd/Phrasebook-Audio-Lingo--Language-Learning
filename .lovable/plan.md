# Replace the old design system with Phrasebook’s new design language

## Goal
Turn the uploaded Duolingo analysis into a project-specific design source, then redesign Phrasebook around the same friendly learning energy without copying Duolingo branding, mascots, proprietary fonts, or exact palette. Keep the existing persistent light/dark themes and all product behavior.

## 1. Store the design source
- Create `_docs/DESIGN.md` as the canonical Phrasebook design guide.
- Rewrite the uploaded reference for this app: Phrasebook-specific roles, semantic tokens, typography, spacing, controls, cards, tables, forms, navigation, status states, motion, responsive rules, accessibility, and light/dark themes.
- Preserve useful structural principles from the attachment: clear single-accent hierarchy, friendly rounded geometry, tactile bordered controls, comfortable spacing, flat surfaces, and playful learning feedback.
- Remove Duolingo names, proprietary fonts, mascot guidance, marketing-page patterns, and literal brand-token copying.

## 2. Save an active design skill
- Create a focused Phrasebook design skill that triggers for future UI, styling, accessibility, and redesign work.
- Point the skill to the canonical design guide and include a short implementation checklist so future changes remain consistent.
- Activate the skill after review rather than leaving it as an unused draft.

## 3. Replace the old Codeconut system
- Build a small Phrasebook-owned component system for the controls already used by the app: buttons, fields, text inputs, text areas, selects, cards, badges, alerts, headings, text, containers, tables, dividers, links, and theme provider.
- Define all light/dark colors, typography, radii, borders, shadows, focus states, and motion as semantic Tailwind tokens in the global stylesheet.
- Use an accessible rounded sans family rather than Duolingo’s fonts; retain normal letter spacing and clear multilingual rendering.
- Migrate every screen and shared component away from the Codeconut imports.
- Remove the old Codeconut design-system files only after the project has no remaining references.

## 4. Apply the new look across the real app
- **Sign in:** friendly social-login and email/password hierarchy, compact and trustworthy rather than a marketing page.
- **Home:** clearer phrase entry, language choice, counts, and review start action.
- **Review:** tactile audio and answer controls, readable phrase cards, strong selected/status feedback, unchanged fixed completion bar.
- **Library:** friendly but dense table controls, filters, reset action, non-wrapping language badges, and preserved mobile horizontal scrolling.
- **Settings and shell:** consistent navigation, dividers, spacing, theme toggle, and restrained animated states.
- Keep Google, Apple, Microsoft, email/password, audio caching, phrase logic, privacy, routing, and database behavior unchanged.

## 5. Accessibility and verification
- Validate WCAG AA contrast in both themes, including disabled, selected, success, danger, focus, and social-login states.
- Verify keyboard operation, visible focus, labels, heading order, touch targets, reduced motion, long multilingual text, and status feedback that does not rely on color alone.
- Check desktop and mobile views for clipping, overlap, table scrolling, fixed-bar clearance, and theme persistence across navigation and reload.
- Run relevant tests and confirm the preview has no build, runtime, console, or broken-reference errors.

## Technical notes
- No backend migration or product-rule changes.
- Existing TanStack Router, Query, server functions, audio flow, and authentication remain intact.
- Architecture documentation will identify the new Phrasebook system as the sole UI source.
