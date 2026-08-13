import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
  cf,
  nf,
} from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/ads")({
  head: seoHead("/ads", "Ads Automation", "Paid search and social campaign spend, CPA and ROAS tracked next to organic results."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.adCampaigns());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Ads Automation" description="Paid campaign spend, conversions, CPA and ROAS alongside organic performance.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Campaigns" value={all.length} />
        <KpiCard label="Spend" value={cf.format(all.reduce((a, r) => a + Number(r.spend), 0))} />
        <KpiCard label="Conversions" value={nf.format(all.reduce((a, r) => a + r.conversions, 0))} />
        <KpiCard label="Avg ROAS" value={all.length ? `${(all.reduce((a, r) => a + Number(r.roas), 0) / all.length).toFixed(2)}x` : "0x"} />
      </div>

      <Panel className="mt-4" title="Campaigns">
        <QueryBoundary query={query} empty="No ad campaigns yet.">
          {() => (
            <DataTable<Row<"seo_ad_campaigns">>
              rows={all}
              columns={[
                { key: "name", header: "Campaign", render: (r) => <div><p className="font-medium text-foreground">{r.name}</p><p className="text-xs text-muted-foreground">{r.channel}</p></div> },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                { key: "budget", header: "Budget", render: (r) => cf.format(Number(r.budget)) },
                { key: "spend", header: "Spend", render: (r) => cf.format(Number(r.spend)) },
                { key: "clicks", header: "Clicks", render: (r) => nf.format(r.clicks) },
                { key: "conv", header: "Conv.", render: (r) => nf.format(r.conversions) },
                { key: "cpa", header: "CPA", render: (r) => cf.format(Number(r.cpa)) },
                { key: "roas", header: "ROAS", render: (r) => `${Number(r.roas).toFixed(2)}x` },
                { key: "actions", header: "", render: (r) => (<Button size="sm" variant="outline" onClick={() => update.mutate({ table: "seo_ad_campaigns", id: r.id, values: { status: r.status === "active" ? "paused" : "active" } })}>{r.status === "active" ? "Pause" : "Resume"}</Button>) },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
