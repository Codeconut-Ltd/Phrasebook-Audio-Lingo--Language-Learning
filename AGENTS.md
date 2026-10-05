# Architecture rules

- All data access goes through `createServerFn` in `src/lib/phrases.functions.ts` with `requireSupabaseAuth` — RLS scopes every row to the signed-in user.
- Signed-in pages live under `src/routes/_authenticated/`; `/auth` is the only public page — the app has no public surface.
- Round selection runs in the `pick_round` SQL function (least-learned first, random) — keeps ordering logic in one place, no SRS.
- Speech is synthesized server-side via Lovable AI Gateway TTS and cached per phrase+text+voice in the private `phrase-audio` bucket — each phrase is billed once; editing text clears the cache.
- One shared `AudioPlayerProvider` controls playback so only one phrase plays at a time; browser speechSynthesis is the fallback.
- UI uses only the attached Codeconut design system components and tokens.
