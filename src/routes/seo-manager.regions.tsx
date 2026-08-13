import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
  nf,
} from "@/components/seo/primitives";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/regions")({
  head: seoHead("/regions", "Regional Modes", "Country-level SEO coverage, traffic share and growth for every target market."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.regions());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Regional Modes" description="Country and region level keyword coverage, traffic share and growth.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Regions" value={all.length} />
        <KpiCard label="Keywords covered" value={nf.format(all.reduce((a, r) => a + r.keywords_count, 0))} />
        <KpiCard label="Best growth" value={all.length ? `${Math.max(...all.map((r) => Number(r.growth_pct))).toFixed(1)}%` : "0%"} />
        <KpiCard label="Region groups" value={new Set(all.map((r) => r.region_group)).size} />
      </div>

      <Panel className="mt-4" title="Regional coverage">
        <QueryBoundary query={query} empty="No regions configured.">
          {() => (
            <DataTable<Row<"seo_regions">>
              rows={all}
              columns={[
                { key: "name", header: "Region", render: (r) => <span className="font-medium text-foreground">{r.flag ? `${r.flag} ` : ""}{r.name}</span> },
                { key: "code", header: "Code", render: (r) => r.code },
                { key: "group", header: "Group", render: (r) => <StatusPill value={r.region_group} tone="neutral" /> },
                { key: "keywords", header: "Keywords", render: (r) => nf.format(r.keywords_count) },
                { key: "share", header: "Traffic share", render: (r) => `${Number(r.traffic_share).toFixed(1)}%` },
                { key: "growth", header: "Growth", render: (r) => <span className={Number(r.growth_pct) >= 0 ? "numeric text-success" : "numeric text-destructive"}>{Number(r.growth_pct) >= 0 ? "+" : ""}{Number(r.growth_pct).toFixed(1)}%</span> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
