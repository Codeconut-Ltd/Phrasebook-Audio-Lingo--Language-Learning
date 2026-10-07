# Simpler Settings + clean audio storage

## 1. Settings panel
- Remove the Theme option (the header sun/moon button already handles it, saved in the browser).
- Drop the card frame. Settings opens as a plain section under the header, built like the "Your Phrases / Library" header: small "YOUR ACCOUNT" label, "Settings" heading, then a thin divider line, then the "Phrases per round" field with Save / Cancel / "Settings saved." in one row. Same widths and spacing as the page below it, and a divider after it so it sits apart from the page content.
- Close stays an explicit button; saving keeps the panel open.

## 2. Audio: how it works today, and the fix
**Today:** pressing Play calls the app's server, which (only if no saved copy exists) asks ElevenLabs for the MP3, saves it in your private storage, and returns a short-lived link. The browser then plays that link. You don't see ElevenLabs in the network panel because the browser never talks to ElevenLabs. The MP3 shows up as a "media" request to the storage link (filter "Media" or search "phrase-audio"), not as a file named after the phrase.

Already right: audio is created only when Play is pressed, never ahead of time, and replays load the saved copy.

**Gap to fix:** when you edit a phrase's text or language, the app forgets the saved MP3 but leaves the file in storage. Fix:
- On edit of text or language: delete the old MP3 from storage right away and clear its reference. A new one is created only on the next Play.
- On phrase delete: also delete its MP3.
- One-time clean-up: remove stored MP3s that no phrase points to any more (left over from earlier edits and the old voice).

## Technical details
- `SettingsPanel.tsx`: remove theme state, `useTheme`, `resolveTheme` import, `Card`/`CardTitle`; use `Text` label + `Heading level={2}` + `Divider`. `updateProfile` drops the `theme` input. AppShell renders the panel in `Container width={width}` with matching padding and a bottom `border-b border-border`.
- Mark `profiles.theme` deprecated via a migration `COMMENT` (no drop; theme stays local-first).
- `updatePhrase`: when text/language changes, read current `audio_path`, update the row with `audio_path = null`, then `storage.remove([old])` (owner RLS on the bucket). `deletePhrase`: read `audio_path`, delete row, remove object.
- `speak()` unchanged in behaviour (cache hit = signed URL; miss = ElevenLabs → upload → delete previous → save path).
- Orphan clean-up: list `phrase-audio` objects per user and remove those not matching any `phrases.audio_path` (run once via backend query tools).
- Verify: edit a phrase in the Library, confirm the file is gone from storage; press Play, confirm one new MP3; Play again, confirm no new ElevenLabs call. Check Settings in light/dark and mobile.
- Update project knowledge and AGENTS.md (settings = round size only; audio deleted on edit/delete).
