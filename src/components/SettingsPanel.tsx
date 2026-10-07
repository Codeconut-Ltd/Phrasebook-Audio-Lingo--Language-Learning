import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button, Field, Heading, Input, Text } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { profileQuery } from "@/lib/queries";
import { updateProfile } from "@/lib/phrases.functions";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const qc = useQueryClient();
  const save = useServerFn(updateProfile);
  const [round, setRound] = useState(String(profile.round_size));
  const [saved, setSaved] = useState(false);
  const roundNum = Number(round);
  const roundValid = Number.isInteger(roundNum) && roundNum >= 1 && roundNum <= 20;

  const mutation = useMutation({
    mutationFn: () => save({ data: { round_size: roundNum } }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["profile"] });
      setSaved(true);
    },
  });

  return (
    <section aria-labelledby="settings-h" className="flex flex-col gap-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <div className="min-w-0">
          <Text size="small" tone="muted" weight="semibold">YOUR ACCOUNT</Text>
          <Heading level={2} id="settings-h">Settings</Heading>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
      </div>
      <form
        className="flex flex-wrap items-end gap-4 border-t border-border pt-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (roundValid) {
            setSaved(false);
            mutation.mutate();
          }
        }}
      >
        <Field htmlFor="set-round" label="Phrases per round" hint="1–20" error={roundValid ? undefined : "Choose 1–20"}>
          <Input id="set-round" type="number" min={1} max={20} value={round} onChange={(e) => setRound(e.target.value)} className="w-24" />
        </Field>
        <div className="flex items-center gap-3">
          <Button type="submit" loading={mutation.isPending} disabled={!roundValid}>Save</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          {saved ? <Text size="small" tone="muted" aria-live="polite">Settings saved.</Text> : null}
          {mutation.isError ? <Text size="small" tone="accent">Could not save settings.</Text> : null}
        </div>
      </form>
    </section>
  );
}
