import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Gauge, RefreshCw } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
  formatDateTime,
} from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useTechnicalChecks } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/technical")({
  head: seoHead(
    "/technical",
    "Technical SEO",
    "Robots, sitemaps, schema, canonicals, redirects and speed checks monitored continuously.",
  ),
  component: TechnicalScreen,
});

function TechnicalScreen() {
  const checks = useQuery(seoQueries.technicalChecks());
  const run = useTechnicalChecks();

  const all = checks.data ?? [];
  const passing = all.filter((c) => c.status === "pass").length;
  const warnings = all.filter((c) => c.status === "warning").length;
  const failing = all.filter((c) => c.status === "fail").length;

  const categories = [...new Set(all.map((c) => c.category))];

  return (
    <SeoShell title="Technical SEO" description="Continuous checks across crawlability, markup and speed." actions={<Button size="sm" disabled={run.isPending} onClick={() => run.mutate()}><RefreshCw className={run.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Run live checks</Button>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Checks" value={all.length} icon={Gauge} />
        <KpiCard label="Passing" value={passing} />
        <KpiCard label="Warnings" value={warnings} />
        <KpiCard label="Failing" value={failing} />
      </div>

      {categories.map((category) => (
        <Panel key={category} className="mt-4" title={category.replace(/[_-]/g, " ")}>
          <QueryBoundary query={checks} empty="No checks recorded.">
            {() => (
              <DataTable<Row<"seo_technical_checks">>
                rows={all.filter((c) => c.category === category)}
                columns={[
                  { key: "name", header: "Check", render: (c) => <span className="font-medium">{c.name}</span> },
                  { key: "status", header: "Status", render: (c) => <StatusPill value={c.status} /> },
                  {
                    key: "detail",
                    header: "Detail",
                    render: (c) => (
                      <span className="block max-w-[420px] text-xs text-muted-foreground">{c.detail ?? "—"}</span>
                    ),
                  },
                  { key: "urls", header: "Affected URLs", render: (c) => c.affected_urls },
                  {
                    key: "checked",
                    header: "Last checked",
                    render: (c) => (
                      <span className="text-xs text-muted-foreground">{formatDateTime(c.last_checked_at)}</span>
                    ),
                  },
                  {
                    key: "actions",
                    header: "",
                    render: (c) => (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={run.isPending}
                        onClick={() => run.mutate()}
                      >
                        Re-run
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </QueryBoundary>
        </Panel>
      ))}
    </SeoShell>
  );
}
