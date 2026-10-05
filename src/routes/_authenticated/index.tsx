import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Button, Card, Field, Heading, Input, Text, Textarea } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { AppShell } from "@/components/AppShell";
import { LanguageInput } from "@/components/LanguageInput";
import { addPhrase } from "@/lib/phrases.functions";
import { profileQuery, statsQuery } from "@/lib/queries";
import { LANGUAGE_CODE_PATTERN } from "@/lib/languages";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Home — Phrasebook" },
      { name: "description", content: "Add phrases and start an audio review round." },
      { property: "og:title", content: "Home — Phrasebook" },
      { property: "og:description", content: "Add phrases and start an audio review round." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([context.queryClient.ensureQueryData(profileQuery), context.queryClient.ensureQueryData(statsQuery)]),
  errorComponent: ({ error }) => <Text>Something went wrong: {error instanceof Error ? error.message : "Unknown error"}</Text>,
  notFoundComponent: () => <Text>Not found</Text>,
  component: Home,
});

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-serif text-h1 font-bold text-foreground">{value}</span>
      <Text size="small" tone="muted">{label}</Text>
    </div>
  );
}

function Home() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: stats } = useSuspenseQuery(statsQuery);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const add = useServerFn(addPhrase);
  const [text, setText] = useState("");
  const [lang, setLang] = useState(profile.output_language);
  const [translation, setTranslation] = useState("");
  const [n, setN] = useState(String(profile.round_size));
  useEffect(() => setLang(profile.output_language), [profile.output_language]);

  const langValid = LANGUAGE_CODE_PATTERN.test(lang.trim());
  const mutation = useMutation({
    mutationFn: () => add({ data: { text: text.trim(), language_code: lang.trim(), translation: translation.trim() || null } }),
    onSuccess: () => {
      setText("");
      setTranslation("");
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["library"] });
    },
  });
  const canAdd = text.trim().length > 0 && langValid && !mutation.isPending;
  const roundN = Math.min(20, Math.max(1, Number(n) || profile.round_size));

  return (
    <AppShell>
      <div className="flex flex-col gap-10">
        <section aria-labelledby="add-h" className="flex flex-col gap-4">
          <Heading level={1} id="add-h">What do you want to learn?</Heading>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (canAdd) mutation.mutate();
            }}
            className="flex flex-col gap-4"
          >
            <Textarea
              aria-label="New phrase"
              placeholder="Type a phrase…"
              rows={3}
              lang={lang}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (canAdd) mutation.mutate();
                }
              }}
              className="text-h3"
            />
            <div className="grid gap-4 sm:grid-cols-3">
              <Field htmlFor="new-lang" label="Language" error={langValid ? undefined : "e.g. th-TH"}>
                <LanguageInput id="new-lang" value={lang} onChange={setLang} />
              </Field>
              <Field htmlFor="new-tr" label="Translation (optional)" className="sm:col-span-2">
                <Input id="new-tr" value={translation} onChange={(e) => setTranslation(e.target.value)} />
              </Field>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={!canAdd} loading={mutation.isPending}>Add phrase</Button>
              {mutation.isError ? <Text size="small" tone="accent">Could not add phrase.</Text> : null}
              {mutation.isSuccess && !text ? <Text size="small" tone="muted" aria-live="polite">Added.</Text> : null}
            </div>
          </form>
        </section>

        <Card variant="filled" padding="lg">
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex gap-10">
              <Stat value={stats.learned} label="Learned" />
              <Stat value={stats.learning} label="Learning" />
              <Stat value={stats.total} label="Total" />
            </div>
            <form
              className="flex items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                navigate({ to: "/review", search: { n: roundN, seed: Date.now() } });
              }}
            >
              <Field htmlFor="round-n" label="Phrases">
                <Input id="round-n" type="number" min={1} max={20} value={n} onChange={(e) => setN(e.target.value)} className="w-20" />
              </Field>
              <Button type="submit" variant="accent" size="md" disabled={stats.total === 0}>Start round</Button>
            </form>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
