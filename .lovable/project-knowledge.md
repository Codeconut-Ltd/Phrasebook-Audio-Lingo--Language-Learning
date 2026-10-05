# Phrasebook — Project Knowledge

## Product

Phrasebook: private audio-first language-learning app. Signed-in user stores phrases in any language, listens to spoken audio, manually marks each phrase memorized or still learning. Not a translation service. No spaced repetition.

## Product Principles

- Minimal, fast, calm. Phrase entry and listening first.
- User decides: explicit **Memorized** / **Not yet**.
- No SRS, due dates, streaks, XP, levels, gamification, auto-grading, algorithmic scheduling.
- Any valid BCP-47 code. Curated languages are suggestions, not a closed list.
- Translation = optional user-entered text. No auto-translation unless asked.
- All user content private, isolated per account.

## Users and Access

- `/auth` only public page. Every product screen needs auth.
- Each account: own profile, settings, phrases, review history, cached audio.
- Signup = email + password. Email confirmation follows Lovable Cloud auth settings.
- Test accounts may exist. Never commit passwords or session credentials.
- Never expose phrase data, profile data, signed audio URLs, secrets, elevated backend credentials.

## Core Screens

### Sign In — `/auth`

- Sign in + account creation, email/password.
- Authenticated user → home workspace.
- Compact centered auth card. Phrasebook wordmark = text only.
- Codeconut logo never appears.

### Home — `/`

- Primary phrase-entry workspace.
- Phrase needs text + valid language code.
- Translation optional, manual.
- Enter submits; Shift+Enter new line.
- New phrases default to profile output language.
- Shows Learned, Learning, Total counts.
- Round size 1–20, start review.
- Content-width workspace layout: breathing room, no excess side gaps.

### Review — `/review`

- Requested count of phrases as vertical list of large cards.
- Each card: text, language, optional translation, playback, editing, **Memorized** / **Not yet**.
- Text, language, translation editable in place.
- Autosave shortly after typing stops, concise saved state.
- One phrase plays at a time.
- Finished round: compact fixed bottom bar, result + one primary action **Next round**.
- No Home action in that bar.
- Bottom clearance so bar never covers last card.

### Library — `/library`

- All owned phrases, sortable paginated table.
- Text search, status filter, language filter, sorting. Default newest first.
- 25 per page.
- Row: playback, inline edit, status change, delete.
- Visible **Reset filters** whenever search/filters/sort differ from defaults.
- Language badges and compact labels never wrap.
- Narrow screens: horizontal scroll keeps columns readable, no crushing.
- Wide workspace layout, no unnecessary side gaps.

### Settings

- Opens from header, stays in current screen.
- Output language, default round size, voice, theme.
- Save keeps panel open, confirms in place.
- Close/cancel always explicit user action.

## Review Logic

- No SRS.
- Selection = backend `pick_round` DB function.
- Least learning success first; Learning ahead of Learned; random within equal priority.
- Round size integer 1–20.
- Result marking updates status, review count, correct count, last-reviewed time.
- **Memorized** → Learned, +1 review, +1 correct.
- **Not yet** → Learning, +1 review only.
- **Next round** = fresh randomized round.

## Phrase Data

One owner per phrase:

- id, owner id, phrase text, BCP-47 language code, optional translation
- status `learning` | `learned`
- review count, correct count, last-reviewed timestamp
- cached audio path, created/updated timestamps

Input rules:

- Text trimmed, required, max 2000 chars.
- Translation trimmed, optional, max 2000 chars.
- Language code matches project BCP-47 pattern, max 35 chars.
- Search terms are data, safely escaped before DB filtering.

## Profile Data

One profile per user: optional display name, default output language, default round size, speech voice, theme `light` | `dark` | `system`. Missing profile → create with backend defaults.

## Audio

- Server-side TTS via Lovable AI Gateway. Never browser-side with private key.
- Cache in private `phrase-audio` bucket.
- Cache key: text + language code + voice + TTS model.
- Short-lived signed URLs for playback.
- Editing text or language invalidates cached audio reference.
- Replacing audio: delete previous owned object only after replacement succeeds.
- Browser `speechSynthesis` fallback when generated audio unavailable.
- Shared `AudioPlayerProvider` owns playback; one phrase at a time.
- Audio errors concise and actionable; never expose provider responses or credentials.

## Data and Security Architecture

- Lovable Cloud: auth, PostgreSQL, RLS, private storage.
- All data access through authenticated TanStack Start server functions in `src/lib/phrases.functions.ts`.
- Every user-data function uses `requireSupabaseAuth` + Zod validation.
- Use authenticated request-context client so RLS applies as signed-in user.
- Every phrase query/mutation owner-scoped by RLS.
- No DB calls in UI components.
- No privileged clients for ordinary reads, writes, role checks, audio access.
- No public endpoints for profiles, phrases, review history, audio.
- Schema changes via migrations with constraints, indexes, grants, explicit RLS policies.
- Never edit generated Lovable Cloud integration files.

## Frontend Architecture

- TanStack Start + React + TypeScript + Vite + file-based TanStack Router.
- TanStack Query server state. Zod validation. Tailwind v4 with Codeconut design system. Bun only.
- Authenticated routes under `src/routes/_authenticated/`; shared layout + access control there.
- Initial server data: route loaders with query options + suspense queries.
- Mutations invalidate only affected profile/stats/library/round data.
- Typed router navigation, no React Router.
- Native View Transition integration for navigation.
- `AppShell` owns route-level width selection.
- One shared `AudioPlayerProvider`.
- Keep presentation, interaction logic, server functions, data definitions separate.

## Theme Behavior

- Light + dark everywhere.
- Local-first, persisted in browser storage under existing theme key.
- Navigation/reload never reset or mix themes.
- Stored browser choice wins on mount.
- Profile update may change theme; profile loading never overwrites existing local choice on route change.
- `system` resolves from OS preference when saved.

## Visual Direction

- Codeconut design system = sole source of components, tokens, typography, spacing, radii, shadows, theme behavior.
- Only components from `@/design-system/codeconut-ltd-2019-2025-dx-42c1f0` when an equivalent exists.
- Never edit attached design-system source or generated rule files.
- Never install another UI library.
- No raw colors, Tailwind palette colors, arbitrary dimensions or type sizes, gradients, blobs, glows, large rounded cards.
- Source Sans 3 = UI/body, Source Serif 4 = headings, Source Code Pro = code only.
- Editorial, professional, minimal, precise, modern SaaS workspace.
- Open whitespace, clear hierarchy, no wasted width.
- Sections unframed; cards only for bounded items (review entries, dialogs, auth).
- Rectangular geometry, restrained shadows.
- Phrasebook = text. No Codeconut logo, no new logo.
- External screenshots = hierarchy/balance/polish inspiration only. Never copy fonts, colors, logos, brand, imagery, content.

## Interaction and Responsive Rules

- Keyboard, touch, pointer all usable.
- Visible focus states from design system.
- Icon-only controls: accessible names + tooltips when meaning unclear.
- Primary actions near the task.
- Fixed controls never obscure content.
- No overlap or clipping of text, badges, controls, table cells.
- Compact responsive arrangements, not hidden actions.
- Small screens: stack fields/controls in reading order.
- Large screens: use width intentionally; review and settings stay narrow enough to read.
- Loading/success/empty/failure states visible, concise, stable, no layout jumps.
- Subtle animation for meaningful state changes and navigation; respect reduced motion.

## Accessibility

- WCAG 2.1 AA, light and dark.
- Normal text and control labels ≥ 4.5:1; large text ≥ 3:1.
- Component boundaries and focus indicators ≥ 3:1 against adjacent colors.
- Never black text on dark brown; no low-contrast text on beige.
- Disabled buttons legible while clearly unavailable.
- Logical heading order, labeled controls, semantic tables, meaningful nav labels, polite live regions for async confirmation.
- Never color alone for status, completion, errors, selection.
- Re-measure contrast from rendered light/dark states when button or status styling changes.

## SEO and Discovery

- Authenticated app has no public surface; stays out of sitemap.
- `/auth` only sitemap page.
- Every content route: unique title, description, og:title, og:description, og:type, twitter:card.
- `/auth` uses published absolute canonical URL + matching og:url.
- `robots.txt` points crawlers to published sitemap.
- Router-derived `/sitemap.xml` only contains routes marked for inclusion.
- Never expose authenticated URLs, query states, user ids, phrases, signed asset URLs in crawler metadata.

## Protected Product Decisions

Change only on explicit request:

- No dashboard.
- No SRS or automated scheduling.
- No auto-translation.
- No public library or sharing.
- No Codeconut logo.
- No Home button in completed-round bar.
- No navigation away after saving settings.
- Never two phrases playing.
- No cross-user access.
- No hardcoded Thai-only assumptions.

## Change Checklist

1. Ownership and RLS preserved.
2. Uncertain input validated at server boundary.
3. Existing Codeconut components/tokens, no re-skinning.
4. Light + dark checked, incl. persisted theme across navigation and reload.
5. Keyboard, focus, labels, headings, rendered contrast checked.
6. Desktop + mobile checked: clipping, overlap, wrapping, side gaps, fixed-bar obstruction.
7. Audio: one active phrase, safe fallback on generation failure.
8. Round selection: least-learned-first, random, no SRS.
9. Authenticated routes absent from sitemap and crawler metadata.
10. Preview build, runtime errors, relevant e2e flow verified before claiming done.
