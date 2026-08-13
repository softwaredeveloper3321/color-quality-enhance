import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link2 } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
  formatDate,
  nf,
} from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/backlinks")({
  head: seoHead(
    "/backlinks",
    "Backlinks",
    "Referring domains, anchor text, authority and toxicity scoring for the whole link profile.",
  ),
  component: BacklinksScreen,
});

function BacklinksScreen() {
  const backlinks = useQuery(seoQueries.backlinks());
  const { update } = useRecordActions();
  const all = backlinks.data ?? [];

  const live = all.filter((b) => b.status === "active").length;
  const toxic = all.filter((b) => b.spam_score >= 40).length;
  const avgDa = all.length ? Math.round(all.reduce((a, b) => a + b.domain_authority, 0) / all.length) : 0;

  return (
    <SeoShell title="Backlinks" description="Link profile health, authority distribution and disavow candidates.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Backlinks" value={nf.format(all.length)} icon={Link2} />
        <KpiCard label="Live links" value={nf.format(live)} />
        <KpiCard label="Referring domains" value={new Set(all.map((b) => b.source_domain)).size} />
        <KpiCard label="Toxic links" value={toxic} hint="spam score ≥ 40" />
      </div>

      <Panel className="mt-4" title="Link profile" description={`Average referring domain authority: ${avgDa}`}>
        <QueryBoundary query={backlinks} empty="No backlinks discovered yet.">
          {() => (
            <DataTable<Row<"seo_backlinks">>
              rows={all}
              columns={[
                {
                  key: "source",
                  header: "Source",
                  render: (b) => (
                    <div className="max-w-[280px]">
                      <p className="truncate font-medium text-foreground">{b.source_domain}</p>
                      <p className="truncate text-xs text-muted-foreground">{b.source_url}</p>
                    </div>
                  ),
                },
                {
                  key: "target",
                  header: "Target",
                  render: (b) => (
                    <span className="block max-w-[200px] truncate text-xs text-muted-foreground">{b.target_url}</span>
                  ),
                },
                { key: "anchor", header: "Anchor", render: (b) => b.anchor_text ?? "—" },
                { key: "da", header: "DA", render: (b) => b.domain_authority },
                { key: "type", header: "Type", render: (b) => <StatusPill value={b.link_type} tone="neutral" /> },
                {
                  key: "spam",
                  header: "Spam",
                  render: (b) => (
                    <span className={b.spam_score >= 40 ? "numeric text-destructive" : "numeric text-success"}>
                      {b.spam_score}
                    </span>
                  ),
                },
                { key: "status", header: "Status", render: (b) => <StatusPill value={b.status} /> },
                {
                  key: "seen",
                  header: "First seen",
                  render: (b) => <span className="text-xs text-muted-foreground">{formatDate(b.first_seen_at)}</span>,
                },
                {
                  key: "actions",
                  header: "",
                  render: (b) =>
                    b.status === "disavowed" ? (
                      <StatusPill value="disavowed" tone="neutral" />
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          update.mutate({
                            table: "seo_backlinks",
                            id: b.id,
                            values: { status: "disavowed" },
                          })
                        }
                      >
                        Disavow
                      </Button>
                    ),
                },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
