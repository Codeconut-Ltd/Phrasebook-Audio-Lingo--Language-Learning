import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { Alert, Button, Card, Heading, Text } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { AppShell } from "@/components/AppShell";
import { ReviewCard } from "@/components/ReviewCard";
import { getRound, markResult } from "@/lib/phrases.functions";

const searchSchema = z.object({
  n: z.coerce.number().int().min(1).max(20).catch(7),
  seed: z.coerce.number().catch(0),
});

const roundQuery = (n: number, seed: number) =>
  queryOptions({ queryKey: ["round", n, seed], queryFn: () => getRound({ data: { n } }), staleTime: Infinity, gcTime: Infinity });

export const Route = createFileRoute("/_authenticated/review")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(roundQuery(deps.n, deps.seed)),
  head: () => ({
    meta: [
      { title: "Review round — Phrasebook" },
      { name: "description", content: "Listen, recall and mark your phrases." },
      { property: "og:title", content: "Review round — Phrasebook" },
      { property: "og:description", content: "Listen, recall and mark your phrases." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => <Text>Could not load round: {error instanceof Error ? error.message : "Unknown error"}</Text>,
  notFoundComponent: () => <Text>Not found</Text>,
  component: Review,
});

function Review() {
  const { n, seed } = Route.useSearch();
  const { data: phrases } = useSuspenseQuery(roundQuery(n, seed));
  const mark = useServerFn(markResult);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const done = Object.keys(results).length;
  const memorized = Object.values(results).filter(Boolean).length;
  const finished = phrases.length > 0 && done === phrases.length;

  async function onResult(id: string, value: boolean) {
    const prev = results[id];
    setResults((r) => ({ ...r, [id]: value }));
    try {
      await mark({ data: { id, memorized: value } });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["library"] });
    } catch {
      setError("Could not save your answer.");
      setResults((r) => {
        const next = { ...r };
        if (prev === undefined) delete next[id];
        else next[id] = prev;
        return next;
      });
    }
  }

  return (
    <AppShell>
      <div className={finished ? "flex flex-col gap-6 pb-24" : "flex flex-col gap-6"}>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <Text size="small" tone="muted" weight="semibold">ACTIVE ROUND</Text>
            <Heading level={1}>Review</Heading>
          </div>
          <Text tone="muted">{done} / {phrases.length} answered</Text>
        </div>
        {error ? <Alert tone="danger">{error}</Alert> : null}
        {phrases.length === 0 ? (
          <Card padding="lg">
            <Text>No phrases yet. <Link to="/" className="underline">Add some first.</Link></Text>
          </Card>
        ) : (
          <ol className="flex flex-col gap-4">
            {phrases.map((p, i) => (
              <li key={p.id}>
                <ReviewCard phrase={p} index={i} result={results[p.id]} onResult={(v) => onResult(p.id, v)} />
              </li>
            ))}
          </ol>
        )}
        {finished ? (
          <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background shadow-overlay" aria-live="polite">
            <div className="mx-auto grid max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 md:px-8">
              <div className="min-w-0">
                <Text weight="semibold">Round complete</Text>
                <Text size="small" tone="muted">{memorized} of {phrases.length} memorized</Text>
              </div>
              <div className="shrink-0">
                <Button variant="accent" size="sm" onClick={() => navigate({ to: "/review", search: { n, seed: Date.now() } })}>Next round</Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
