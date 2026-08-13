import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import { KpiCard, Panel, QueryBoundary, StatusPill, nf } from "@/components/seo/primitives";
import { actionsColumn, CreateRecordButton } from "@/components/seo/RecordDialog";
import { entities } from "@/lib/seo-entities";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";

export const Route = createFileRoute("/competitors")({
  head: seoHead(
    "/competitors",
    "Competitors",
    "Visibility, authority and keyword gap analysis against every tracked competitor domain.",
  ),
  component: CompetitorsScreen,
});

function CompetitorsScreen() {
  const competitors = useQuery(seoQueries.competitors());
  const gaps = useQuery(seoQueries.gaps());

  const all = competitors.data ?? [];
  const gapRows = gaps.data ?? [];
  const nameById = new Map(all.map((c) => [c.id, c.name]));

  return (
    <SeoShell
      title="Competitors"
      description="Where rivals win and which keywords to take next."
      actions={<CreateRecordButton spec={entities.competitors} label="Add competitor" />}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Competitors tracked" value={all.length} icon={Users} />
        <KpiCard label="Keyword gaps" value={nf.format(gapRows.length)} />
        <KpiCard
          label="High opportunity"
          value={gapRows.filter((g) => g.opportunity === "high").length}
        />
        <KpiCard
          label="Avg competitor DA"
          value={all.length ? Math.round(all.reduce((a, c) => a + c.domain_authority, 0) / all.length) : 0}
        />
      </div>

      <Panel className="mt-4" title="Competitor landscape">
        <QueryBoundary query={competitors} empty="No competitors tracked.">
          {() => (
            <DataTable<Row<"seo_competitors">>
              rows={all}
              columns={[
                {
                  key: "name",
                  header: "Competitor",
                  render: (c) => (
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.domain}</p>
                    </div>
                  ),
                },
                { key: "region", header: "Region", render: (c) => c.region },
                { key: "visibility", header: "Visibility", render: (c) => `${Number(c.visibility_score).toFixed(1)}%` },
                { key: "keywords", header: "Keywords", render: (c) => nf.format(c.keywords_count) },
                { key: "backlinks", header: "Backlinks", render: (c) => nf.format(c.backlinks_count) },
                { key: "traffic", header: "Traffic", render: (c) => nf.format(c.traffic_estimate) },
                { key: "da", header: "DA", render: (c) => c.domain_authority },
                actionsColumn<Row<"seo_competitors">>(entities.competitors),
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>

      <Panel className="mt-4" title="Keyword gap analysis" description="Terms competitors rank for that we don't own">
        <QueryBoundary query={gaps} empty="No keyword gaps recorded.">
          {() => (
            <DataTable<Row<"seo_competitor_gaps">>
              rows={gapRows}
              columns={[
                { key: "keyword", header: "Keyword", render: (g) => <span className="font-medium">{g.keyword}</span> },
                {
                  key: "competitor",
                  header: "Competitor",
                  render: (g) => nameById.get(g.competitor_id) ?? "—",
                },
                { key: "their", header: "Their pos", render: (g) => g.their_position ?? "—" },
                { key: "ours", header: "Our pos", render: (g) => g.our_position ?? "Not ranking" },
                { key: "volume", header: "Volume", render: (g) => nf.format(g.search_volume) },
                { key: "opportunity", header: "Opportunity", render: (g) => <StatusPill value={g.opportunity} /> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
