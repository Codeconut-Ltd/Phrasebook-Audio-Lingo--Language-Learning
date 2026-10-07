# ElevenLabs-first audio refactor

## Answers to your questions

- **Is ElevenLabs used today?** Yes. Play calls a server function that asks ElevenLabs for an MP3. Browser speech only runs if that call fails. But two things are off: the voice is a fixed pick from Settings, and the phrase language is never sent to ElevenLabs (it guesses from the text).
- **Where are MP3s stored?** In your app's private file storage (Lovable Cloud), one file per phrase. That should stay: ElevenLabs has no reusable cache for us, so replaying from there would re-bill every play. Our copy means each phrase is paid once, plays instantly, and stays private.
- **Settings voice/output language:** Voice is no longer needed. "Output language" only pre-fills the language for new phrases, so it gets replaced by "remember the last language I used".

## What changes

1. **Language-correct speech:** every request sends the phrase's language to ElevenLabs, using the `eleven_v3` model. It covers all the requested languages, including Thai and Urdu.
2. **Voice chosen automatically:** one built-in multilingual ElevenLabs voice is used. Users don't pick a voice.
3. **Browser speech is only a fallback:** it runs only when ElevenLabs is unreachable or the language isn't supported. A small "Using device voice" note appears so it's clear which engine played.
4. **Language list:** these become top suggestions in the dropdown: English, Malay, Urdu, Greek, Russian, Japanese, Korean, Chinese and Thai. The other existing languages stay below them. Any valid code can still be typed in.
5. **Settings panel:** shows only Phrases per round and Theme.
6. **Clean-up:** removes the voice list, the voice setting, the default language setting and the old audio cache rules. Old cached files are regenerated the first time each phrase is played.

## Technical details

- `src/lib/languages.ts`: drop VOICES/VOICE_IDS. Add a fixed `TTS_VOICE_ID` constant and a helper that turns a BCP-47 code into an ISO 639-1 code (`th-TH` -> `th`, `zh-CN` -> `zh`). Add `ms-MY`, `ur-PK`, `el-GR` and reorder the list.
- `speak()` in `phrases.functions.ts`: model `eleven_v3`. The body includes `language_code`. Cache key is text + language + voice + model. Keep the rule that the old file is deleted only after the new upload succeeds. If ElevenLabs returns 400/422 for a language, return `{ fallback: true }` so the client uses device speech. Provider errors are never passed to the client.
- `useAudioPlayer.tsx`: same single-player behaviour. Expose `engine: "elevenlabs" | "device"` so the play button can show a short note when the device voice is used.
- Home: the language field starts with the last used code, saved in localStorage after each added phrase (default `en-US`). Read it after the page loads to avoid a mismatch with the server-rendered page.
- `SettingsPanel.tsx` / `updateProfile`: remove the voice and output_language fields.
- Migration: drop `profiles.voice` and `profiles.output_language`, and null out existing `phrases.audio_path` so old audio is regenerated. Clean up the stored objects afterwards.
- Update the project knowledge, AGENTS.md and roadmap. Then verify by playing Thai, Urdu and Japanese phrases and confirming an MP3 was created and the request carried the language code, plus a fallback test with ElevenLabs disabled.
