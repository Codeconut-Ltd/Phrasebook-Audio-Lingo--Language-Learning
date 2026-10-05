# Audio Phrase Trainer — Plan

A minimal, audio-first phrase trainer. You add phrases in any language, listen to them spoken aloud, and mark each one as "memorized" or "still learning". It uses the attached Codeconut design system, with light and dark mode and layouts for every screen size.

## Screens

1. **Sign in** (`/auth`): email and password. Every user has their own profile and settings.
2. **Home** (`/`, signed in):
   - A large text box for a new phrase, plus a language picker (defaults to your output language) and an optional translation field. Press Enter or click Add.
   - Two large counters: **Learned** and **Learning**, plus the total.
   - Start a review: a round-size control (1–20, default from your settings) and a **Start round** button.
3. **Review round** (`/review`): the chosen number of phrases, one below another as large cards.
   - Each card has big text, a language tag, a play/stop button, a translation that can be shown or hidden, and two buttons: **Memorized** and **Not yet**.
   - The text and translation can be edited right on the card. Changes save automatically about 600ms after you stop typing, and a small "Saved" note confirms it.
   - Picking order: phrases you have learned least go first, chosen at random. Memorized phrases come last. There is no spaced-repetition scheduling.
   - At the end, a short summary appears with a button to start another round.
4. **Library** (`/library`): every phrase in a sortable table.
   - Filters: status, language, and text search.
   - Sort by created date, text, or last reviewed.
   - 25 phrases per page.
   - Each row has inline edit, play, a status toggle and delete.
5. **Settings** (opened from the top menu): output language, default round size, voice, and light/dark/system theme. These are saved to your profile.

The top bar holds the logo, Home, Library, the theme toggle, the settings menu and Sign out.

## Audio

Phrase text and its language code go to a server function that turns them into speech with the built-in Lovable AI text-to-speech. No API key is needed and it works for any language. The audio is cached in file storage per phrase and voice, so each phrase is only paid for once. Editing the text clears its cached audio. If speech generation fails, the browser's built-in voice is used instead.

ElevenLabs can be swapped in later through its connector without changing the screens.

## Test users

Two test accounts will be created, and their sign-ins will be given to you after the build:
- `test1@example.com` / password shown after build
- `test2@example.com` / password shown after build

---

## Technical details

- **Backend:** Lovable Cloud is enabled, with email auth turned on and auto-confirm enabled for testing.
- **Tables** (each has RLS, GRANTs, and owner-only policies using `auth.uid()`):
  - `profiles`
    - `id` → auth.users
    - `display_name`
    - `output_language` (BCP-47 code, default `th-TH`)
    - `round_size` (default 7, check 1–20)
    - `voice`
    - `theme`
    - A trigger creates the profile row on signup.
  - `phrases`
    - `id`, `user_id` (not null)
    - `text`
    - `language_code`
    - `translation` (nullable)
    - `status` enum `learning | learned`
    - `times_reviewed`, `times_correct`
    - `last_reviewed_at`
    - `audio_path`
    - `created_at`, `updated_at`
    - Indexes on (`user_id`, `status`), (`user_id`, `created_at`) and (`user_id`, `language_code`).
- **Storage:** a private bucket `phrase-audio` with the path `{user_id}/{phrase_id}-{hash}.mp3`. Audio plays through signed URLs.
- **Server functions** (`src/lib/*.functions.ts`, all using `requireSupabaseAuth`, with Zod-validated input):
  - `addPhrase`
  - `updatePhrase`
  - `deletePhrase`
  - `markResult` (memorized yes/no → status and counters)
  - `getStats`
  - `getRound(n)`: orders by status, then `times_correct`, then `random()`, then applies the limit
  - `listPhrases` (filters, sort, pagination)
  - `getProfile` / `updateProfile`
  - `speak(phraseId)` (AI Gateway TTS, then cached in storage, then returns a signed URL)
- **Frontend:** TanStack Router routes under `_authenticated/`, with TanStack Query for data and optimistic updates. The debounced autosave runs in a `useAutosave` hook, and playback is managed by a single shared `useAudioPlayer` so only one phrase plays at a time.
- **UI:** all components come from the Codeconut design system (`ThemeProvider`, `Container`, `Card`, `Heading`, `Text`, `Input`, `Textarea`, `Select`, `Button`, `Badge`, `Table`) using its tokens only. A curated language list (ISO/BCP-47) feeds the picker, and any other code can also be typed in.
- **Test users:** created once through the admin API in a one-off server-side step. Their credentials are reported in chat and never committed to code.
- **Other:** each route gets its own head metadata. `AGENTS.md` records the architecture rules.
