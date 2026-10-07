# Architecture rules

- All data access goes through `createServerFn` in `src/lib/phrases.functions.ts` with `requireSupabaseAuth` — RLS scopes every row to the signed-in user.
- Signed-in pages live under `src/routes/_authenticated/`; `/auth` is the only public page — the app has no public surface.
- Round selection runs in the `pick_round` SQL function (least-learned first, random) — keeps ordering logic in one place, no SRS.
- Speech is synthesized server-side via the ElevenLabs connector (ELEVENLABS_API_KEY, eleven_v3 with per-phrase language_code, one fixed server-side voice, direct api.elevenlabs.io call — no gateway) and cached per phrase+text+language+voice+model in the private `phrase-audio` bucket — each phrase is billed once; editing text clears the cache.
- One shared `AudioPlayerProvider` controls playback so only one phrase plays at a time; browser speechSynthesis is the fallback.
- UI uses only the attached Codeconut design system components and tokens.
- Theme choice is local-first and shared across routes; profile updates may change it, but page mounts must never overwrite the saved browser choice.
- Page navigation uses TanStack Router's native View Transition integration for fast, progressively enhanced transitions.
- `AppShell` owns route-level content width selection — workspace pages can expand without weakening narrow review and settings flows.
