/** Curated BCP-47 language list for pickers. Any other valid code may be typed in. */
export const LANGUAGES: ReadonlyArray<{ readonly code: string; readonly name: string }> = [
  { code: "th-TH", name: "Thai" },
  { code: "en-US", name: "English (US)" },
  { code: "en-GB", name: "English (UK)" },
  { code: "de-DE", name: "German" },
  { code: "fr-FR", name: "French" },
  { code: "es-ES", name: "Spanish" },
  { code: "it-IT", name: "Italian" },
  { code: "pt-BR", name: "Portuguese (BR)" },
  { code: "nl-NL", name: "Dutch" },
  { code: "pl-PL", name: "Polish" },
  { code: "ru-RU", name: "Russian" },
  { code: "tr-TR", name: "Turkish" },
  { code: "ar-SA", name: "Arabic" },
  { code: "hi-IN", name: "Hindi" },
  { code: "ja-JP", name: "Japanese" },
  { code: "ko-KR", name: "Korean" },
  { code: "zh-CN", name: "Chinese (Simplified)" },
  { code: "vi-VN", name: "Vietnamese" },
  { code: "id-ID", name: "Indonesian" },
];

export const VOICES = ["Kore", "Puck", "Charon", "Aoede", "Fenrir", "Leda"] as const;

export const LANGUAGE_CODE_PATTERN = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

export function languageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name ?? code;
}
