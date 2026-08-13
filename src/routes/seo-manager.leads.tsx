import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
  formatDate,
  cf,
} from "@/components/seo/primitives";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/leads")({
  head: seoHead("/leads", "Lead Intelligence", "Organic-sourced leads with scoring, keyword attribution and pipeline value."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.leads());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Lead Intelligence" description="Organic leads with scoring, source attribution and pipeline stage.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Leads" value={all.length} />
        <KpiCard label="Qualified" value={all.filter((r) => r.stage === "qualified").length} />
        <KpiCard label="Pipeline value" value={cf.format(all.reduce((a, r) => a + Number(r.estimated_value), 0))} />
        <KpiCard label="Avg score" value={all.length ? Math.round(all.reduce((a, r) => a + r.score, 0) / all.length) : 0} />
      </div>

      <Panel className="mt-4" title="Lead pipeline">
        <QueryBoundary query={query} empty="No leads captured yet.">
          {() => (
            <DataTable<Row<"seo_leads">>
              rows={all}
              columns={[
                { key: "name", header: "Lead", render: (r) => <div><p className="font-medium text-foreground">{r.full_name}</p><p className="text-xs text-muted-foreground">{r.company ?? r.email}</p></div> },
                { key: "source", header: "Source", render: (r) => <div className="text-xs text-muted-foreground"><StatusPill value={r.source_channel} tone="neutral" /><p className="mt-1 truncate max-w-[160px]">{r.source_keyword ?? "—"}</p></div> },
                { key: "country", header: "Country", render: (r) => r.country ?? "—" },
                { key: "score", header: "Score", render: (r) => r.score },
                { key: "value", header: "Value", render: (r) => cf.format(Number(r.estimated_value)) },
                { key: "stage", header: "Stage", render: (r) => <StatusPill value={r.stage} /> },
                { key: "created", header: "Created", render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
