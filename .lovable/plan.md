# Fix the screenshot-reported UI issues

## Changes

### 1. Correct button text contrast in both themes
- Audit the rendered primary, accent, outline, and selected review-button states in light and dark modes.
- Fix the app-owned semantic foreground mappings so the active “Memorized” button uses a high-contrast foreground on cocoa, and “Add phrase” remains legible on its dark-mode surface.
- Give disabled buttons an intentional, readable disabled treatment rather than relying on low-opacity text.
- Preserve the attached Codeconut components and managed theme files; corrections stay in the app theme layer.

### 2. Use the available page width without pushing content to the edges
- Add an app-shell width option so workspace pages can choose the correct Codeconut container width.
- Give Home and Library a wider content area while retaining the design system’s mobile and desktop side gutters.
- Keep Review and Settings focused in the existing narrow reading column.
- Verify the home phrase form, statistics, and round controls balance across tablet and wide desktop sizes.

### 3. Make the Library table readable
- Use the wider shell for Library so its seven columns are not compressed into the narrow column.
- Keep language-code badges on one line so values such as `th-TH` never wrap.
- Preserve horizontal table access at genuinely narrow widths rather than shrinking labels into unreadable fragments.
- Recheck filters, pagination, editable fields, status controls, and reset action at mobile and desktop widths.

### 4. Simplify the completed-round bar
- Remove the Home action from the fixed completion bar.
- Keep the completion result and “Next round” as the only action, with a compact responsive layout.
- Retain enough page-bottom clearance so the bar never covers the final phrase card.

## Validation
- Measure the affected button foreground/background pairs in light and dark modes against WCAG AA.
- Check Home, Library, and completed Review at mobile, tablet, and desktop widths for clipping, wrapping, excessive empty margins, and edge collisions.
- Verify keyboard focus, disabled states, active review states, pagination, and Next round behavior.
- Confirm the latest preview build and runtime diagnostics are clean.

## Technical notes
- No database, authentication, phrase-selection, or audio behavior changes.
- No edits to the managed Codeconut design-system source.
- The uploaded screenshots remain visual references only and will not be embedded.
