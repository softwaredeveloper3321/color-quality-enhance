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
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/social")({
  head: seoHead("/social", "Social Auto-Post", "Scheduled and published cross-platform social posts with reach and engagement tracking."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.socialPosts());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Social Auto-Post" description="Scheduled and published social posts with reach and engagement.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Posts" value={all.length} />
        <KpiCard label="Scheduled" value={all.filter((r) => r.status === "scheduled").length} />
        <KpiCard label="Impressions" value={nf.format(all.reduce((a, r) => a + r.impressions, 0))} />
        <KpiCard label="Engagements" value={nf.format(all.reduce((a, r) => a + r.engagements, 0))} />
      </div>

      <Panel className="mt-4" title="Social queue">
        <QueryBoundary query={query} empty="No social posts scheduled.">
          {() => (
            <DataTable<Row<"seo_social_posts">>
              rows={all}
              columns={[
                { key: "platform", header: "Platform", render: (r) => <StatusPill value={r.platform} tone="neutral" /> },
                { key: "content", header: "Content", render: (r) => <span className="block max-w-[360px] truncate text-sm text-foreground">{r.content}</span> },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                { key: "when", header: "When", render: (r) => <span className="text-xs text-muted-foreground">{formatDateTime(r.published_at ?? r.scheduled_at)}</span> },
                { key: "impressions", header: "Impressions", render: (r) => nf.format(r.impressions) },
                { key: "engagements", header: "Engagements", render: (r) => nf.format(r.engagements) },
                { key: "actions", header: "", render: (r) => (<Button size="sm" variant="outline" onClick={() => update.mutate({ table: "seo_social_posts", id: r.id, values: { status: "published", published_at: new Date().toISOString() } })} disabled={r.status === "published"}>Publish now</Button>) },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
