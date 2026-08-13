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

export const Route = createFileRoute("/email")({
  head: seoHead("/email", "Email Automation", "Lifecycle email campaigns with open, click and reply performance by segment."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.emailCampaigns());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Email Automation" description="Lifecycle email campaigns with delivery, open, click and reply rates.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Campaigns" value={all.length} />
        <KpiCard label="Sent" value={nf.format(all.reduce((a, r) => a + r.sent_count, 0))} />
        <KpiCard label="Opens" value={nf.format(all.reduce((a, r) => a + r.opened_count, 0))} />
        <KpiCard label="Replies" value={nf.format(all.reduce((a, r) => a + r.replied_count, 0))} />
      </div>

      <Panel className="mt-4" title="Email campaigns">
        <QueryBoundary query={query} empty="No email campaigns yet.">
          {() => (
            <DataTable<Row<"seo_email_campaigns">>
              rows={all}
              columns={[
                { key: "name", header: "Campaign", render: (r) => <div><p className="font-medium text-foreground">{r.name}</p><p className="max-w-[240px] truncate text-xs text-muted-foreground">{r.subject}</p></div> },
                { key: "segment", header: "Segment", render: (r) => <StatusPill value={r.segment} tone="neutral" /> },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                { key: "sent", header: "Sent", render: (r) => nf.format(r.sent_count) },
                { key: "open", header: "Open rate", render: (r) => r.sent_count ? `${((r.opened_count / r.sent_count) * 100).toFixed(1)}%` : "—" },
                { key: "click", header: "Click rate", render: (r) => r.sent_count ? `${((r.clicked_count / r.sent_count) * 100).toFixed(1)}%` : "—" },
                { key: "scheduled", header: "Scheduled", render: (r) => <span className="text-xs text-muted-foreground">{formatDateTime(r.scheduled_at)}</span> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
