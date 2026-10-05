import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button, Card, CardTitle, Field, Input, Select, Text, useTheme } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { profileQuery } from "@/lib/queries";
import { updateProfile } from "@/lib/phrases.functions";
import { LANGUAGE_CODE_PATTERN, VOICES } from "@/lib/languages";
import { LanguageInput } from "./LanguageInput";
import { resolveTheme } from "./AppShell";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const qc = useQueryClient();
  const save = useServerFn(updateProfile);
  const { setTheme } = useTheme();
  const [lang, setLang] = useState(profile.output_language);
  const [round, setRound] = useState(String(profile.round_size));
  const [voice, setVoice] = useState(profile.voice);
  const [theme, setThemeChoice] = useState(profile.theme);
  const langValid = LANGUAGE_CODE_PATTERN.test(lang.trim());
  const roundNum = Number(round);
  const roundValid = Number.isInteger(roundNum) && roundNum >= 1 && roundNum <= 20;

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          output_language: lang.trim(),
          round_size: roundNum,
          voice: voice as (typeof VOICES)[number],
          theme: theme as "light" | "dark" | "system",
        },
      }),
    onSuccess: async () => {
      setTheme(resolveTheme(theme));
      await qc.invalidateQueries({ queryKey: ["profile"] });
      onClose();
    },
  });

  return (
    <Card variant="raised" padding="md" role="dialog" aria-label="Settings">
      <CardTitle>Settings</CardTitle>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (langValid && roundValid) mutation.mutate();
        }}
      >
        <Field htmlFor="set-lang" label="Output language" hint="Default for new phrases, e.g. th-TH" error={langValid ? undefined : "Enter a language code like th-TH"}>
          <LanguageInput id="set-lang" value={lang} onChange={setLang} />
        </Field>
        <Field htmlFor="set-round" label="Phrases per round" hint="1–20" error={roundValid ? undefined : "Choose 1–20"}>
          <Input id="set-round" type="number" min={1} max={20} value={round} onChange={(e) => setRound(e.target.value)} />
        </Field>
        <Field htmlFor="set-voice" label="Voice">
          <Select id="set-voice" value={voice} onChange={(e) => setVoice(e.target.value)}>
            {VOICES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </Select>
        </Field>
        <Field htmlFor="set-theme" label="Theme">
          <Select id="set-theme" value={theme} onChange={(e) => setThemeChoice(e.target.value)}>
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </Select>
        </Field>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Button type="submit" loading={mutation.isPending} disabled={!langValid || !roundValid}>Save</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {mutation.isError ? <Text size="small" tone="accent">Could not save settings.</Text> : null}
        </div>
      </form>
    </Card>
  );
}
