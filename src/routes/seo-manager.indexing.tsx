import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Globe, Plus } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
  formatDateTime,
  nf,
} from "@/components/seo/primitives";
import { ALL, FilterBar, SearchFilter, SelectFilter, optionsFrom } from "@/components/seo/FilterBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions, useRecrawlUrl } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/indexing")({
  head: seoHead(
    "/indexing",
    "Indexing & Crawl",
    "Crawl state, HTTP status and index coverage for every discovered Software Vala URL.",
  ),
  component: IndexingScreen,
});

function IndexingScreen() {
  const records = useQuery(seoQueries.indexing());
  const { insert } = useRecordActions();
  const recrawl = useRecrawlUrl();
  const [url, setUrl] = useState("");

  const all = records.data ?? [];
  const indexed = all.filter((r) => r.index_state === "indexed").length;
  const excluded = all.filter((r) => r.index_state !== "indexed").length;
  const errors = all.filter((r) => r.http_status >= 400).length;

  const [search, setSearch] = useState("");
  const [source, setSource] = useState(ALL);
  const [crawlStatus, setCrawlStatus] = useState(ALL);
  const [indexState, setIndexState] = useState(ALL);
  const [httpClass, setHttpClass] = useState(ALL);

  const sourceOptions = useMemo(() => optionsFrom(all, (r) => r.source), [all]);
  const crawlOptions = useMemo(() => optionsFrom(all, (r) => r.crawl_status), [all]);
  const stateOptions = useMemo(() => optionsFrom(all, (r) => r.index_state), [all]);
  const httpOptions = useMemo(
    () => optionsFrom(all, (r) => `${Math.floor(r.http_status / 100)}xx`),
    [all],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((r) => {
      if (term && !r.url.toLowerCase().includes(term) && !(r.notes ?? "").toLowerCase().includes(term))
        return false;
      if (source !== ALL && r.source !== source) return false;
      if (crawlStatus !== ALL && r.crawl_status !== crawlStatus) return false;
      if (indexState !== ALL && r.index_state !== indexState) return false;
      if (httpClass !== ALL && `${Math.floor(r.http_status / 100)}xx` !== httpClass) return false;
      return true;
    });
  }, [all, crawlStatus, httpClass, indexState, search, source]);

  const filtersActive =
    search !== "" || source !== ALL || crawlStatus !== ALL || indexState !== ALL || httpClass !== ALL;

  const bySource = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of all) map.set(r.source, (map.get(r.source) ?? 0) + 1);
    return [...map.entries()];
  }, [all]);

  return (
    <SeoShell
      title="Indexing & Crawl"
      description="Submit URLs, review crawl status and track index coverage."
      actions={
        <div className="flex items-center gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="/new-page"
            className="w-56"
          />
          <Button
            size="sm"
            disabled={!url.trim() || insert.isPending}
            onClick={() =>
              insert.mutate(
                {
                  table: "seo_indexing_records",
                  values: {
                    url: url.trim(),
                    source: "manual",
                    crawl_status: "queued",
                    index_state: "discovered",
                    http_status: 200,
                  },
                },
                { onSuccess: () => setUrl("") },
              )
            }
          >
            <Plus aria-hidden="true" className="h-4 w-4" /> Submit URL
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="URLs discovered" value={nf.format(all.length)} icon={Globe} />
        <KpiCard label="Indexed" value={nf.format(indexed)} />
        <KpiCard label="Not indexed" value={nf.format(excluded)} />
        <KpiCard label="HTTP errors" value={nf.format(errors)} />
      </div>

      <Panel className="mt-4" title="Discovery sources">
        <div className="flex flex-wrap gap-2">
          {bySource.map(([source, count]) => (
            <span
              key={source}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {source.replace(/_/g, " ")} · {count}
            </span>
          ))}
        </div>
      </Panel>

      <Panel className="mt-4" title="Crawl log">
        <FilterBar
          active={filtersActive}
          onReset={() => {
            setSearch("");
            setSource(ALL);
            setCrawlStatus(ALL);
            setIndexState(ALL);
            setHttpClass(ALL);
          }}
          resultLabel={`${filtered.length} of ${all.length} URLs`}
        >
          <SearchFilter
            value={search}
            onChange={setSearch}
            label="Search URLs and notes"
            placeholder="Search URLs…"
          />
          <SelectFilter value={source} onChange={setSource} label="Source" options={sourceOptions} />
          <SelectFilter
            value={crawlStatus}
            onChange={setCrawlStatus}
            label="Crawl status"
            options={crawlOptions}
          />
          <SelectFilter
            value={indexState}
            onChange={setIndexState}
            label="Index state"
            options={stateOptions}
          />
          <SelectFilter value={httpClass} onChange={setHttpClass} label="HTTP" options={httpOptions} />
        </FilterBar>
        <QueryBoundary query={records} empty="No URLs discovered yet.">
          {() => (
            <DataTable<Row<"seo_indexing_records">>
              rows={filtered}
              columns={[
                {
                  key: "url",
                  header: "URL",
                  render: (r) => (
                    <span className="block max-w-[300px] truncate font-medium text-foreground">{r.url}</span>
                  ),
                },
                { key: "source", header: "Source", render: (r) => <StatusPill value={r.source} tone="neutral" /> },
                { key: "crawl", header: "Crawl", render: (r) => <StatusPill value={r.crawl_status} /> },
                { key: "state", header: "Index state", render: (r) => <StatusPill value={r.index_state} /> },
                {
                  key: "http",
                  header: "HTTP",
                  render: (r) => (
                    <span className={r.http_status >= 400 ? "numeric text-destructive" : "numeric"}>
                      {r.http_status}
                    </span>
                  ),
                },
                {
                  key: "crawled",
                  header: "Last crawled",
                  render: (r) => (
                    <span className="text-xs text-muted-foreground">{formatDateTime(r.last_crawled_at)}</span>
                  ),
                },
                {
                  key: "notes",
                  header: "Notes",
                  render: (r) => (
                    <span className="block max-w-[220px] truncate text-xs text-muted-foreground">
                      {r.notes ?? "—"}
                    </span>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  render: (r) => (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={recrawl.isPending}
                      onClick={() => recrawl.mutate(r.id)}
                    >
                      Recrawl
                    </Button>
                  ),
                },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
