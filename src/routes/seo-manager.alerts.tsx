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
} from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/alerts")({
  head: seoHead("/alerts", "Alerts", "Real-time alerts for ranking drops, crawl errors, indexing changes and traffic anomalies."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.alerts());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Alerts" description="Ranking drops, crawl errors and traffic anomalies as they happen.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Alerts" value={all.length} />
        <KpiCard label="Unacknowledged" value={all.filter((r) => !r.acknowledged).length} />
        <KpiCard label="Critical" value={all.filter((r) => r.severity === "critical" || r.severity === "high").length} />
        <KpiCard label="Categories" value={new Set(all.map((r) => r.category)).size} />
      </div>

      <Panel className="mt-4" title="Alert stream">
        <QueryBoundary query={query} empty="No alerts raised.">
          {() => (
            <DataTable<Row<"seo_alerts">>
              rows={all}
              columns={[
                { key: "title", header: "Alert", render: (r) => <div className="max-w-[380px]"><p className="font-medium text-foreground">{r.title}</p><p className="text-xs text-muted-foreground">{r.message}</p></div> },
                { key: "category", header: "Category", render: (r) => <StatusPill value={r.category} tone="neutral" /> },
                { key: "severity", header: "Severity", render: (r) => <StatusPill value={r.severity} /> },
                { key: "time", header: "When", render: (r) => <span className="text-xs text-muted-foreground">{formatDateTime(r.created_at)}</span> },
                { key: "actions", header: "", render: (r) => (<Button size="sm" variant="outline" disabled={r.acknowledged} onClick={() => update.mutate({ table: "seo_alerts", id: r.id, values: { acknowledged: true } })}>{r.acknowledged ? "Acknowledged" : "Acknowledge"}</Button>) },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
