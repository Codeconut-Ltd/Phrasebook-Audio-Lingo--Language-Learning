# Phrasebook — Project Knowledge

## Product

Phrasebook is a private, audio-first language-learning application. A signed-in user stores phrases in any language, listens to spoken audio, and decides manually whether each phrase is memorized or still being learned.

The product combines the immediacy of a translation input workspace with the focused review loop of a flashcard trainer. It is not a translation service and does not use spaced repetition.

## Product Principles

- Keep the experience minimal, fast, calm, and focused on phrase entry and listening practice.
- Preserve user control: the user explicitly marks each phrase as **Memorized** or **Not yet**.
- Do not introduce SRS, due dates, streaks, XP, levels, gamification, automatic grading, or algorithmic scheduling.
- Support any valid BCP-47 language code. Curated language choices are suggestions, not a closed list.
- Treat translation as optional user-entered context. Do not add automatic translation unless explicitly requested.
- Keep all user content private and isolated by account.

## Users and Access

- `/auth` is the only public application page.
- Every product screen requires authentication.
- Each account owns an independent profile, settings, phrases, review history, and cached audio.
- New account creation uses email and password. Email confirmation behavior is controlled by Lovable Cloud authentication settings.
- Test accounts may exist for verification, but passwords and session credentials must never be committed to project files.
- Never expose private phrase data, profile data, signed audio URLs, secrets, or elevated backend credentials.

## Core Screens

### Sign In — `/auth`

- Supports sign in and account creation with email and password.
- Redirects an authenticated user to the home workspace.
- Uses a compact, centered authentication card with the Phrasebook wordmark as text only.
- The Codeconut logo must never appear in the application.

### Home — `/`

- Provides the primary phrase-entry workspace.
- A phrase requires text and a valid language code.
- Translation is optional and manually entered.
- Pressing Enter without Shift submits the phrase; Shift+Enter adds a new line.
- New phrases default to the output language stored in the user profile.
- Shows Learned, Learning, and Total counts.
- Lets the user choose a round size from 1 through 20 and start a review.
- Uses the content-width workspace layout so controls have breathing room without excessive side gaps.

### Review — `/review`

- Loads the requested number of phrases as a vertical list of large review cards.
- Each card shows phrase text, language, optional translation, playback, editing, and the two explicit outcomes **Memorized** and **Not yet**.
- Phrase text, language, and translation are editable in place.
- Edits autosave shortly after the user stops typing and show a concise saved state.
- Only one phrase may play at a time.
- A finished round shows a compact fixed bottom bar with the result and one primary action: **Next round**.
- Do not add a Home action to the completed-round bar.
- Keep enough bottom clearance that the fixed bar never covers the final card.

### Library — `/library`

- Shows all owned phrases in a sortable, paginated table.
- Supports text search, status filtering, language filtering, and sorting.
- Default sort is newest first.
- Pagination uses 25 phrases per page.
- Each row supports playback, inline editing, status changes, and deletion.
- A visible **Reset filters** action appears whenever search, filters, or sorting differ from defaults.
- Language badges and compact labels must never wrap.
- On narrow screens, preserve readable table columns through horizontal scrolling rather than crushing content.
- Uses the wide workspace layout to avoid unnecessary side gaps.

### Settings

- Opens from the application header and remains in the current screen.
- Contains output language, default round size, voice, and theme.
- Saving settings must keep the settings panel open and show confirmation in place.
- Closing or cancelling is always an explicit user action.

## Review Logic

- There is no spaced-repetition system.
- Round selection is performed by the backend `pick_round` database function.
- Prioritize phrases with the least learning success, with Learning phrases ahead of Learned phrases, and randomize within equivalent priority.
- The requested round size must be an integer from 1 through 20.
- Marking a result updates status, review count, correct count, and last-reviewed time.
- **Memorized** sets the phrase to Learned and increments both review and correct counts.
- **Not yet** sets the phrase to Learning and increments the review count only.
- Starting **Next round** must request a fresh randomized round.

## Phrase Data

Each phrase belongs to exactly one authenticated user and contains:

- unique identifier
- owner identifier
- phrase text
- BCP-47 language code
- optional translation
- status: `learning` or `learned`
- review count
- correct count
- last-reviewed timestamp
- cached audio path
- creation and update timestamps

Input rules:

- Phrase text is trimmed, required, and limited to 2,000 characters.
- Translation is trimmed, optional, and limited to 2,000 characters.
- Language codes must match the project's BCP-47 validation pattern and are limited to 35 characters.
- Search terms are treated as data and safely escaped before database filtering.

## Profile Data

Each authenticated user has one profile containing:

- optional display name
- default output language
- default round size
- selected speech voice
- theme preference: `light`, `dark`, or `system`

If a profile does not yet exist, create it for the authenticated user using backend defaults.

## Audio

- Speech is generated server-side through Lovable AI Gateway text-to-speech.
- Never call speech generation directly from the browser with a private key.
- Cache generated audio in the private `phrase-audio` storage bucket.
- Cache identity includes phrase text, language code, selected voice, and TTS model.
- Return short-lived signed URLs for playback.
- Editing phrase text or language invalidates its cached audio reference.
- When replacing cached audio, remove the previous owned object after the replacement succeeds.
- Browser `speechSynthesis` is the fallback when generated audio is unavailable.
- The shared `AudioPlayerProvider` owns playback so starting one phrase stops any other phrase.
- Keep user-facing audio errors concise and actionable; never expose provider responses or credentials.

## Data and Security Architecture

- Lovable Cloud provides authentication, PostgreSQL data, row-level security, and private file storage.
- All application data access goes through authenticated TanStack Start server functions in `src/lib/phrases.functions.ts`.
- Every server function handling user data uses `requireSupabaseAuth` and Zod validation.
- Use the authenticated request context client so row-level security applies as the signed-in user.
- Every phrase query and mutation must remain owner-scoped by row-level security.
- Do not move database calls into UI components.
- Do not use privileged clients for ordinary reads, writes, role checks, or audio access.
- Do not add public data endpoints for profiles, phrases, review history, or audio.
- Schema changes require migrations with constraints, indexes, grants, and explicit row-level-security policies.
- Never edit generated Lovable Cloud integration files.

## Frontend Architecture

- Framework: TanStack Start with React, TypeScript, Vite, and file-based TanStack Router routes.
- Server state: TanStack Query.
- Validation: Zod.
- Styling: Tailwind CSS v4 using the attached Codeconut design system.
- Package manager: Bun only.
- Authenticated routes live under `src/routes/_authenticated/`.
- Shared authenticated layout and access control live in the authenticated route layout.
- Initial server data uses route loaders with query options and suspense queries.
- Mutations invalidate only the affected profile, statistics, library, or round query data.
- Use typed TanStack Router navigation; do not add React Router.
- Use TanStack Router's native View Transition integration for navigation.
- Preserve `AppShell` as the owner of route-level width selection.
- Preserve one shared `AudioPlayerProvider` for application-wide playback.
- Keep presentation, reusable interaction logic, server functions, and data definitions separated.

## Theme Behavior

- Support light and dark themes across every screen.
- Theme choice is local-first and persists in browser storage under the existing theme key.
- Navigation and reloads must not reset or mix themes.
- The stored browser choice takes precedence during page mounting.
- A profile update may intentionally change the theme, but profile loading must never overwrite an existing local choice on every route change.
- `system` resolves from the operating-system preference when the setting is saved.

## Visual Direction

- Follow the attached Codeconut design system as the sole source of components, tokens, typography, spacing, radii, shadows, and theme behavior.
- Use only components imported from `@/design-system/codeconut-ltd-2019-2025-dx-42c1f0` when an equivalent exists.
- Never edit the attached design-system source or its generated rule files.
- Never install or introduce another UI component library.
- Never use raw color values, Tailwind palette colors, arbitrary dimensions, arbitrary type sizes, gradients, decorative blobs, glows, or large rounded cards.
- Typography uses Source Sans 3 for interface and body text, Source Serif 4 for headings, and Source Code Pro for code only.
- Keep the visual character editorial, professional, minimal, precise, and suitable for a modern SaaS workspace.
- Use open whitespace and clear hierarchy without wasting usable screen width.
- Keep page sections unframed; use cards only for genuinely bounded items such as review entries, dialogs, and authentication.
- Preserve rectangular geometry and restrained shadows.
- The Phrasebook name is rendered as text. Do not restore the Codeconut logo or introduce another logo.
- External screenshots are inspiration for hierarchy, balance, and polish only. Never copy their fonts, colors, logos, brand elements, imagery, or content.

## Interaction and Responsive Rules

- All controls must remain usable with keyboard, touch, and pointer input.
- Use visible focus states from the design system.
- Icon-only controls require accessible names and tooltips when their meaning is not obvious.
- Keep primary actions close to the task they complete.
- Do not let fixed controls obscure content.
- Do not allow text, badges, controls, or table cells to overlap or clip.
- Use compact responsive arrangements rather than hiding essential actions.
- On small screens, stack form fields and controls in reading order.
- On large screens, use available width intentionally while keeping review and settings flows narrow enough to read comfortably.
- Loading, success, empty, and failure states must be visible, concise, and stable without layout jumps.
- Meaningful state changes and navigation may animate subtly, while respecting reduced-motion preferences.

## Accessibility

- Meet WCAG 2.1 AA across light and dark themes.
- Normal text and control labels require at least 4.5:1 contrast; large text requires at least 3:1.
- Interactive component boundaries and focus indicators require at least 3:1 contrast against adjacent colors.
- Never use black text on dark brown controls or low-contrast text on beige controls.
- Disabled buttons must remain legible while being clearly unavailable.
- Preserve semantic headings in logical order, labeled form controls, semantic tables, meaningful navigation labels, and polite live regions for asynchronous confirmation.
- Never rely on color alone to communicate phrase status, completion, errors, or selection.
- Validate contrast from rendered light and dark states whenever button or status styling changes.

## SEO and Discovery

- The authenticated application has no public content surface and must stay excluded from the sitemap.
- `/auth` is the only sitemap-included page.
- Every content route defines a unique title, description, Open Graph title and description, Open Graph type, and Twitter card.
- `/auth` uses the published absolute canonical URL and matching Open Graph URL.
- `robots.txt` points crawlers to the published sitemap.
- The router-derived `/sitemap.xml` contains only routes explicitly marked for inclusion.
- Do not expose authenticated URLs, query states, user identifiers, phrases, or signed asset URLs in crawler metadata.

## Protected Product Decisions

Do not change these behaviors unless the user explicitly requests it:

- No dashboard.
- No SRS or automated review scheduling.
- No automatic translation.
- No public phrase library or sharing.
- No Codeconut logo.
- No Home button in the completed-round bar.
- No navigation away from the current screen after saving settings.
- No more than one playing phrase at a time.
- No cross-user data access.
- No hardcoded language-only assumptions such as Thai-only behavior.

## Change Checklist

Before completing a change to Phrasebook:

1. Confirm the change preserves authenticated ownership and row-level security.
2. Confirm all uncertain input is validated at the server boundary.
3. Confirm the UI uses existing Codeconut components and tokens without re-skinning them.
4. Check light and dark themes, including persisted theme behavior across navigation and reload.
5. Check keyboard access, focus visibility, labels, semantic headings, and rendered contrast.
6. Check desktop and mobile layouts for clipping, overlap, wrapping, excessive side gaps, and fixed-bar obstruction.
7. Verify audio still permits only one active phrase and safely falls back when generation fails.
8. Verify round selection remains least-learned-first with randomness and no SRS.
9. Verify authenticated routes remain absent from the sitemap and crawler metadata.
10. Confirm the preview build, runtime errors, and relevant end-to-end flow before claiming completion.