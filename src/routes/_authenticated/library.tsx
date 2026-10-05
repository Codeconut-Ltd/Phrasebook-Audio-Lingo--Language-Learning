import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { keepPreviousData, useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { Button, Field, Heading, Input, Select, Table, TableBody, TableHead, TableHeaderCell, TableRow, Text } from "@/design-system/codeconut-ltd-2019-2025-dx-42c1f0";
import { AppShell } from "@/components/AppShell";
import { LibraryRow } from "@/components/LibraryRow";
import { listSchema, PAGE_SIZE } from "@/lib/phrases.functions";
import { libraryQuery, statsQuery } from "@/lib/queries";
import { languageName } from "@/lib/languages";
import { ResetIcon } from "@/components/Icons";

const searchSchema = listSchema.extend({
  page: listSchema.shape.page.catch(1),
  status: listSchema.shape.status.catch("all"),
  lang: listSchema.shape.lang.catch(""),
  q: listSchema.shape.q.catch(""),
  sort: listSchema.shape.sort.catch("created_desc"),
});

export const Route = createFileRoute("/_authenticated/library")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(statsQuery),
  head: () => ({
    meta: [
      { title: "Library — Phrasebook" },
      { name: "description", content: "Browse, filter and edit all your stored phrases." },
      { property: "og:title", content: "Library — Phrasebook" },
      { property: "og:description", content: "Browse, filter and edit all your stored phrases." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  errorComponent: ({ error }) => <Text>Could not load library: {error instanceof Error ? error.message : "Unknown error"}</Text>,
  notFoundComponent: () => <Text>Not found</Text>,
  component: Library,
});

function Library() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/library" });
  const { data: stats } = useSuspenseQuery(statsQuery);
  const { data, isFetching, isError } = useQuery({ ...libraryQuery(search), placeholderData: keepPreviousData });
  const [q, setQ] = useState(search.q);
  const set = (patch: Partial<typeof search>) => navigate({ search: (s) => ({ ...s, ...patch, page: patch.page ?? 1 }) });
  const filtersActive = search.q !== "" || search.status !== "all" || search.lang !== "" || search.sort !== "created_desc";
  const resetFilters = () => {
    setQ("");
    navigate({ search: { page: 1, status: "all", lang: "", q: "", sort: "created_desc" } });
  };

  useEffect(() => {
    if (q === search.q) return;
    const t = setTimeout(() => navigate({ search: (s) => ({ ...s, q, page: 1 }) }), 300);
    return () => clearTimeout(t);
  }, [q, search.q, navigate]);

  const total = data?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AppShell width="wide">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div className="min-w-0">
            <Text size="small" tone="muted" weight="semibold">YOUR PHRASES</Text>
            <Heading level={1}>Library</Heading>
          </div>
          <Text tone="muted" aria-live="polite">{isFetching ? "Loading…" : `${total} phrases`}</Text>
        </div>
        <div className="grid items-end gap-4 border-y border-border py-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field htmlFor="f-q" label="Search">
            <Input id="f-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Text or translation" />
          </Field>
          <Field htmlFor="f-status" label="Status">
            <Select id="f-status" value={search.status} onChange={(e) => set({ status: e.target.value as typeof search.status })}>
              <option value="all">All</option>
              <option value="learning">Learning</option>
              <option value="learned">Learned</option>
            </Select>
          </Field>
          <Field htmlFor="f-lang" label="Language">
            <Select id="f-lang" value={search.lang} onChange={(e) => set({ lang: e.target.value })}>
              <option value="">All languages</option>
              {stats.languages.map((l) => (
                <option key={l} value={l}>{languageName(l)} ({l})</option>
              ))}
            </Select>
          </Field>
          <Field htmlFor="f-sort" label="Sort">
            <Select id="f-sort" value={search.sort} onChange={(e) => set({ sort: e.target.value as typeof search.sort })}>
              <option value="created_desc">Newest first</option>
              <option value="created_asc">Oldest first</option>
              <option value="text_asc">Text A–Z</option>
              <option value="reviewed_desc">Recently reviewed</option>
            </Select>
          </Field>
          {filtersActive ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <Button variant="ghost" size="sm" onClick={resetFilters}><ResetIcon />Reset filters</Button>
            </div>
          ) : null}
        </div>
        {isError ? <Text tone="accent">Could not load phrases.</Text> : null}
        <Table aria-label="All phrases" className="min-w-max">
          <TableHead>
            <TableRow>
              <TableHeaderCell><span className="sr-only">Play</span></TableHeaderCell>
              <TableHeaderCell>Phrase</TableHeaderCell>
              <TableHeaderCell>Translation</TableHeaderCell>
              <TableHeaderCell className="whitespace-nowrap">Lang</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Correct</TableHeaderCell>
              <TableHeaderCell><span className="sr-only">Actions</span></TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(data?.rows ?? []).map((p) => <LibraryRow key={`${p.id}-${p.text}-${p.status}`} phrase={p} />)}
          </TableBody>
        </Table>
        {data && data.rows.length === 0 ? <Text tone="muted">No phrases match.</Text> : null}
        <nav aria-label="Pagination" className="flex items-center justify-between gap-4">
          <Button variant="outline" size="sm" disabled={search.page <= 1} onClick={() => set({ page: search.page - 1 })}>Previous</Button>
          <Text size="small" tone="muted">Page {search.page} of {pages}</Text>
          <Button variant="outline" size="sm" disabled={search.page >= pages} onClick={() => set({ page: search.page + 1 })}>Next</Button>
        </nav>
      </div>
    </AppShell>
  );
}
