# Phrasebook — Project Knowledge

## Product
Private audio-first language-learning app. Signed-in user stores phrases in any language, listens to spoken audio, manually marks each **Memorized** or **Not yet**. Not a translation service. No spaced repetition.

## Product Principles
- Minimal, fast, calm. Entry + listening first.
- User decides status explicitly.
- No SRS, due dates, streaks, XP, levels, gamification, auto-grading, algorithmic scheduling.
- Any valid BCP-47 code; curated languages = suggestions, not closed list.
- Translation = optional user text. No auto-translate unless asked.
- All content private, isolated per account.

## Users and Access
- `/auth` only public page; every product screen needs auth.
- Per account: own profile, settings, phrases, review history, cached audio.
- Signup email + password; email confirmation per Lovable Cloud auth settings.
- Test accounts may exist; never commit passwords or session credentials.
- Never expose phrase data, profile data, signed audio URLs, secrets, elevated backend credentials.

## Core Screens
### Sign In — `/auth`
Sign in + signup, email/password. Authed user → home. Compact centered card. Phrasebook wordmark = text only. Codeconut logo never appears.

### Home — `/`
Phrase-entry workspace. Needs text + valid language code; translation optional, manual. Enter submits, Shift+Enter newline. Defaults to profile output language. Shows Learned / Learning / Total. Round size 1–20, start review. Content-width layout: breathing room, no excess side gaps.

### Review — `/review`
Requested count as vertical list of large cards. Each: text, language, optional translation, playback, in-place editing, **Memorized** / **Not yet**. Autosave shortly after typing stops + concise saved state. One phrase plays at a time. Finished round: compact fixed bottom bar with result + single primary action **Next round**; no Home there; enough bottom clearance that bar never covers last card.

### Library — `/library`
All owned phrases, sortable paginated table, 25/page, default newest first. Text search, status + language filters, sorting. Row: playback, inline edit, status change, delete. Visible **Reset filters** whenever search/filters/sort differ from defaults. Language badges + compact labels never wrap. Narrow screens: horizontal scroll keeps columns readable. Wide layout, no unnecessary side gaps.

### Settings
Opens from header, stays in current screen. Output language, round size, voice, theme. Save keeps panel open + confirms in place. Close/cancel always explicit.

## Review Logic
No SRS. Selection = backend `pick_round` DB function: least learning success first, Learning ahead of Learned, random within equal priority. Round size integer 1–20. Marking updates status, review count, correct count, last-reviewed. **Memorized** → Learned, +1 review +1 correct. **Not yet** → Learning, +1 review only. **Next round** = fresh randomized round.

## Phrase Data
One owner per phrase: id, owner id, text, BCP-47 code, optional translation, status `learning`|`learned`, review count, correct count, last-reviewed, cached audio path, created/updated.
Input: text trim, required, ≤2000; translation trim, optional, ≤2000; code ≤35 chars matching project BCP-47 pattern; search terms = data, escaped before DB filtering.

## Profile Data
One per user: optional display name, output language, round size, voice, theme `light`|`dark`|`system`. Missing → create with backend defaults.

## Audio
Server-side TTS via Lovable AI Gateway; never browser-side with private key. Cache in private `phrase-audio` bucket; key = text + code + voice + TTS model. Short-lived signed URLs. Editing text or language invalidates cached reference. Replace: delete old object only after replacement succeeds. Browser `speechSynthesis` fallback. Shared `AudioPlayerProvider` owns playback, one phrase at a time. Errors concise/actionable; never expose provider responses or credentials.

## Data and Security Architecture
Lovable Cloud: auth, PostgreSQL, RLS, private storage. All data access via authenticated TanStack Start server functions in `src/lib/phrases.functions.ts`; every user-data fn uses `requireSupabaseAuth` + Zod. Use request-context client so RLS applies as signed-in user; every phrase query/mutation owner-scoped. No DB calls in UI. No privileged clients for ordinary reads/writes/role checks/audio. No public endpoints for profiles, phrases, review history, audio. Schema changes via migrations with constraints, indexes, grants, explicit RLS policies. Never edit generated Cloud integration files.

## Frontend Architecture
TanStack Start + React + TS + Vite + file-based TanStack Router. TanStack Query server state; Zod; Tailwind v4 + Codeconut design system; Bun only. Authed routes under `src/routes/_authenticated/` with shared layout + access control. Initial data via route loaders (query options) + suspense queries. Mutations invalidate only affected profile/stats/library/round data. Typed navigation, no React Router. Native View Transitions. `AppShell` owns route-level width. One shared `AudioPlayerProvider`. Presentation, interaction logic, server functions, data definitions stay separate.

## Theme Behavior
Light + dark everywhere. Local-first, persisted under existing theme key. Navigation/reload never reset or mix themes; stored browser choice wins on mount. Profile update may change theme; profile loading never overwrites existing local choice on route change. `system` = OS preference when saved.

## Visual Direction
Codeconut design system = sole source of components, tokens, typography, spacing, radii, shadows, theme behavior. Only components from `@/design-system/codeconut-ltd-2019-2025-dx-42c1f0` when equivalent exists. Never edit design-system source or generated rule files; never install another UI library. No raw colors, Tailwind palette colors, arbitrary dimensions or type sizes, gradients, blobs, glows, large rounded cards. Source Sans 3 UI/body, Source Serif 4 headings, Source Code Pro code only. Editorial, professional, minimal, precise SaaS workspace; open whitespace, clear hierarchy, no wasted width. Sections unframed; cards only for bounded items (review entries, dialogs, auth). Rectangular geometry, restrained shadows. Phrasebook = text; no Codeconut logo, no new logo. External screenshots = hierarchy/balance/polish inspiration only; never copy fonts, colors, logos, brand, imagery, content.

## Interaction and Responsive
Keyboard/touch/pointer all usable; visible design-system focus states. Icon-only controls: accessible names + tooltips when meaning unclear. Primary actions near task. Fixed controls never obscure content. No overlap/clipping of text, badges, controls, cells. Compact responsive arrangements, not hidden actions. Small screens stack in reading order; large screens use width intentionally while review/settings stay narrow enough to read. Loading/success/empty/failure visible, concise, stable, no layout jumps. Subtle animation for meaningful changes/navigation; respect reduced motion.

## Accessibility
WCAG 2.1 AA light + dark. Text/labels ≥4.5:1, large text ≥3:1, boundaries + focus ≥3:1 vs adjacent. Never black on dark brown; no low-contrast text on beige. Disabled buttons legible yet clearly unavailable. Logical heading order, labeled controls, semantic tables, meaningful nav labels, polite live regions for async confirmation. Never color alone for status/completion/errors/selection. Re-measure contrast from rendered light/dark states when button or status styling changes.

## SEO and Discovery
Authed app has no public surface, stays out of sitemap; `/auth` only sitemap page. Every content route: unique title, description, og:title, og:description, og:type, twitter:card. `/auth` uses published absolute canonical + matching og:url. `robots.txt` points to published sitemap. Router-derived `/sitemap.xml` contains only routes marked for inclusion. Never expose authed URLs, query states, user ids, phrases, signed asset URLs in crawler metadata.

## Protected Product Decisions
Change only on explicit request: no dashboard; no SRS/automated scheduling; no auto-translation; no public library/sharing; no Codeconut logo; no Home button in completed-round bar; no navigation away after saving settings; never two phrases playing; no cross-user access; no hardcoded Thai-only assumptions.

## Change Checklist
1. Ownership + RLS preserved.
2. Uncertain input validated at server boundary.
3. Existing Codeconut components/tokens, no re-skin.
4. Light + dark checked incl. persisted theme across navigation/reload.
5. Keyboard, focus, labels, headings, rendered contrast.
6. Desktop + mobile: clipping, overlap, wrapping, side gaps, fixed-bar obstruction.
7. Audio one active phrase + safe fallback.
8. Round selection least-learned-first, random, no SRS.
9. Authed routes absent from sitemap/crawler metadata.
10. Preview build, runtime errors, relevant e2e verified before claiming done.
