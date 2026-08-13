import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import { KpiCard, Panel, QueryBoundary, StatusPill, formatDateTime } from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useSearchConsoleSync, useSemrushSync } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/integrations")({
  head: seoHead("/integrations", "Settings & Integrations", "Connect Search Console, Semrush, analytics and social providers to sync live SEO data."),
  component: IntegrationsScreen,
});

function IntegrationsScreen() {
  const integrations = useQuery(seoQueries.integrations());
  const gsc = useSearchConsoleSync();
  const semrush = useSemrushSync();
  const [site, setSite] = useState("https://softwarevala.com/");
  const [domain, setDomain] = useState("softwarevala.com");

  const all = integrations.data ?? [];

  return (
    <SeoShell title="Settings & Integrations" description="Live data sources powering the SEO Manager.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Integrations" value={all.length} />
        <KpiCard label="Connected" value={all.filter((i) => i.status === "connected").length} />
        <KpiCard label="Disconnected" value={all.filter((i) => i.status !== "connected").length} />
        <KpiCard label="Categories" value={new Set(all.map((i) => i.category)).size} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="Google Search Console" description="Pull clicks, impressions, CTR and position">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="gsc-site">Property URL</Label>
              <Input id="gsc-site" value={site} onChange={(e) => setSite(e.target.value)} />
            </div>
            <Button disabled={gsc.isPending} onClick={() => gsc.mutate({ siteUrl: site, days: 28 })}>
              <RefreshCw className={gsc.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Sync last 28 days
            </Button>
          </div>
        </Panel>

        <Panel title="Semrush" description="Import organic keyword positions">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="sem-domain">Domain</Label>
              <Input id="sem-domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
            </div>
            <Button disabled={semrush.isPending} onClick={() => semrush.mutate({ domain, database: "us" })}>
              <RefreshCw className={semrush.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Import keywords
            </Button>
          </div>
        </Panel>
      </div>

      <Panel className="mt-4" title="All integrations">
        <QueryBoundary query={integrations} empty="No integrations registered.">
          {() => (
            <DataTable<Row<"seo_integrations">>
              rows={all}
              columns={[
                { key: "name", header: "Provider", render: (i) => (<div><p className="font-medium text-foreground">{i.display_name}</p><p className="text-xs text-muted-foreground">{i.provider}</p></div>) },
                { key: "category", header: "Category", render: (i) => <StatusPill value={i.category} tone="neutral" /> },
                { key: "status", header: "Status", render: (i) => <StatusPill value={i.status} /> },
                { key: "sync", header: "Last sync", render: (i) => <span className="text-xs text-muted-foreground">{formatDateTime(i.last_sync_at)}</span> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
