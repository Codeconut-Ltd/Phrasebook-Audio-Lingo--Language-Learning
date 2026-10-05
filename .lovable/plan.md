# Phrasebook UX fixes and Editorial SaaS refinement

## Direction

Use the selected **Editorial SaaS workspace** composition across the app:

- Focused single-column workspace with open, economical whitespace
- Product-first hierarchy using the existing Codeconut Source typefaces
- Editorial Sand balance using existing Codeconut tokens only
- Compact navigation, restrained surfaces, clear primary actions, and polished interaction states
- Reference screenshots guide hierarchy and spacing only; their branding, fonts, colors, and content will not be copied

## Implementation

### 1. Make theme selection persistent and consistent

- Establish one theme source of truth shared by sign-in and every authenticated screen.
- Initialize from the saved local preference before the interface paints to avoid light/dark flashes.
- Keep the signed-in profile preference synchronized without reapplying an outdated profile value on each page change.
- Preserve System mode behavior and react to operating-system theme changes while it is selected.

### 2. Keep settings open after saving

- Remove the current successful-save close behavior.
- Keep the user in the settings panel, refresh the stored profile, and show a compact saved confirmation.
- Keep Cancel/Close as the explicit way to leave settings.

### 3. Improve review progression

- Add a slim sticky bottom completion bar when a round is finished.
- Keep “Next round” and the completion result immediately reachable without consuming excessive mobile space.
- Preserve safe spacing below the phrase list so the bar never obscures editable content or controls.

### 4. Add fast library filter reset

- Add a clear Reset filters action beside the filter controls.
- Reset search, status, language, sort, and page together to the default library view.
- Show it only when the current view differs from defaults, with an immediate transition back to all phrases.

### 5. Correct button contrast and interaction states

- Measure rendered foreground/background combinations for every button variant in light and dark modes.
- Correct application-level semantic color mappings and variant choices so normal text meets WCAG AA in both themes.
- Keep vendor-owned design-system files untouched; apply any required compatibility correction in the app theme layer.
- Verify disabled, loading, focus-visible, active, and hover states as well as the default state.

### 6. Add native-feeling view transitions

- Enable TanStack Router’s native View Transition integration for page navigation with graceful fallback.
- Use short fades for lateral Home/Library navigation and directional movement only for entering or leaving a review round.
- Add subtle state transitions for settings, saved feedback, filter reset, and the sticky completion action.
- Disable nonessential motion under `prefers-reduced-motion`.

### 7. Refine the complete interface

- Recompose sign-in, app header, home, review, library, and settings to match the selected focused workspace direction.
- Strengthen hierarchy with compact metadata, intentional surface contrast, and fewer visually heavy containers.
- Keep controls and tables efficient on desktop while making header rows, filters, cards, and fixed actions resilient on mobile.
- Preserve all existing functionality, wording, database behavior, and attached Codeconut components/tokens.

## Validation

- Test theme persistence across sign-in, Home, Review, Library, and Settings, including refresh and System mode.
- Verify settings remain open after a successful save and display confirmation.
- Verify filter reset restores the complete default library view.
- Verify the next-round action remains visible and unobtrusive on desktop and mobile.
- Check light/dark button contrast, keyboard focus, reduced motion, overflow, and tap targets.
- Run focused checks and inspect the rendered app at desktop and mobile sizes before completion.

## Technical notes

- No database or business-logic changes are required.
- Theme synchronization will be handled in app-owned state around the attached provider rather than by editing the managed design system.
- View transitions will use browser-native/TanStack support instead of adding another animation library.
