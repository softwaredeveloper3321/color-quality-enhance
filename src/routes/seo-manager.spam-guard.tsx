import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

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
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/spam-guard")({
  head: seoHead("/spam-guard", "Spam Guard", "Bot, scraper and spam-submission events blocked to protect crawl budget and lead quality."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.spam());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Spam Guard" description="Blocked bots, scraper hits and spam submissions protecting crawl budget.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Events" value={nf.format(all.length)} />
        <KpiCard label="Blocked" value={nf.format(all.filter((r) => r.blocked).length)} />
        <KpiCard label="Countries" value={new Set(all.map((r) => r.country ?? "—")).size} />
        <KpiCard label="Event types" value={new Set(all.map((r) => r.event_type)).size} />
      </div>

      <Panel className="mt-4" title="Security events">
        <QueryBoundary query={query} empty="No spam events recorded.">
          {() => (
            <DataTable<Row<"seo_spam_events">>
              rows={all}
              columns={[
                { key: "ip", header: "Source IP", render: (r) => <span className="numeric font-medium text-foreground">{r.source_ip}</span> },
                { key: "type", header: "Event", render: (r) => <StatusPill value={r.event_type} tone="neutral" /> },
                { key: "detail", header: "Detail", render: (r) => <span className="block max-w-[320px] truncate text-xs text-muted-foreground">{r.detail ?? "—"}</span> },
                { key: "country", header: "Country", render: (r) => r.country ?? "—" },
                { key: "blocked", header: "Action", render: (r) => <StatusPill value={r.blocked ? "blocked" : "allowed"} /> },
                { key: "time", header: "When", render: (r) => <span className="text-xs text-muted-foreground">{formatDateTime(r.created_at)}</span> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
