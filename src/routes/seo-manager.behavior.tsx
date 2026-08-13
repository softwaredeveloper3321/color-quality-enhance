import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  formatDate,
  nf,
} from "@/components/seo/primitives";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/behavior")({
  head: seoHead("/behavior", "Heatmap & Behavior", "Scroll depth, dwell time, rage clicks and bounce rate for every landing page."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.behavior());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Heatmap & Behavior" description="Session engagement, scroll depth, rage clicks and bounce rate per page.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Sessions" value={nf.format(all.reduce((a, r) => a + r.sessions, 0))} />
        <KpiCard label="Avg scroll depth" value={all.length ? `${Math.round(all.reduce((a, r) => a + r.scroll_depth_pct, 0) / all.length)}%` : "0%"} />
        <KpiCard label="Rage clicks" value={nf.format(all.reduce((a, r) => a + r.rage_clicks, 0))} />
        <KpiCard label="Avg bounce" value={all.length ? `${(all.reduce((a, r) => a + Number(r.bounce_rate), 0) / all.length).toFixed(1)}%` : "0%"} />
      </div>

      <Panel className="mt-4" title="Page behaviour">
        <QueryBoundary query={query} empty="No behaviour data captured yet.">
          {() => (
            <DataTable<Row<"seo_page_behavior">>
              rows={all}
              columns={[
                { key: "url", header: "Page", render: (r) => <span className="block max-w-[280px] truncate font-medium text-foreground">{r.page_url}</span> },
                { key: "date", header: "Date", render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.recorded_on)}</span> },
                { key: "sessions", header: "Sessions", render: (r) => nf.format(r.sessions) },
                { key: "time", header: "Avg time", render: (r) => `${Math.floor(r.avg_time_seconds / 60)}m ${r.avg_time_seconds % 60}s` },
                { key: "scroll", header: "Scroll", render: (r) => `${r.scroll_depth_pct}%` },
                { key: "clicks", header: "Clicks", render: (r) => nf.format(r.clicks) },
                { key: "rage", header: "Rage clicks", render: (r) => <span className={r.rage_clicks > 5 ? "numeric text-destructive" : "numeric"}>{r.rage_clicks}</span> },
                { key: "bounce", header: "Bounce", render: (r) => `${Number(r.bounce_rate).toFixed(1)}%` },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
