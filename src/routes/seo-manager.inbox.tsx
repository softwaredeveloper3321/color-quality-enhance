import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
} from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/inbox")({
  head: seoHead("/inbox", "Comments & Inbox", "Unified inbox for social, chat and form messages with AI-drafted replies."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.inbox());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Comments & Inbox" description="Unified inbox for social comments, chat and form messages with AI replies.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Messages" value={all.length} />
        <KpiCard label="Unread" value={all.filter((r) => r.status === "unread").length} />
        <KpiCard label="Replied" value={all.filter((r) => r.status === "replied").length} />
        <KpiCard label="Channels" value={new Set(all.map((r) => r.channel)).size} />
      </div>

      <Panel className="mt-4" title="Messages">
        <QueryBoundary query={query} empty="Inbox is empty.">
          {() => (
            <DataTable<Row<"seo_inbox_messages">>
              rows={all}
              columns={[
                { key: "contact", header: "Contact", render: (r) => <div><p className="font-medium text-foreground">{r.contact_name}</p><p className="text-xs text-muted-foreground">{r.contact_handle ?? r.channel}</p></div> },
                { key: "channel", header: "Channel", render: (r) => <StatusPill value={r.channel} tone="neutral" /> },
                { key: "message", header: "Message", render: (r) => <span className="block max-w-[320px] truncate text-sm text-foreground">{r.message}</span> },
                { key: "reply", header: "Draft reply", render: (r) => <span className="block max-w-[280px] truncate text-xs text-muted-foreground">{r.auto_reply ?? "—"}</span> },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                { key: "actions", header: "", render: (r) => (<Button size="sm" variant="outline" disabled={r.status === "replied"} onClick={() => update.mutate({ table: "seo_inbox_messages", id: r.id, values: { status: "replied", replied_at: new Date().toISOString() } })}>Mark replied</Button>) },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
