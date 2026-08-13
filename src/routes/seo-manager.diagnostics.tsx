import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Activity, CheckCircle2, Gauge } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

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
import { useResolveError, useRunBenchmarks } from "@/lib/use-diagnostics";

export const Route = createFileRoute("/diagnostics")({
  head: seoHead(
    "/diagnostics",
    "Admin Diagnostics",
    "Live data-layer benchmarks (TTFB, pagination, report generation) and captured server errors for the SEO Manager.",
  ),
  component: DiagnosticsScreen,
});

const ms = (v: number | string | null) => `${Number(v ?? 0).toFixed(1)}ms`;

function DiagnosticsScreen() {
  const benchmarks = useQuery(seoQueries.benchmarks());
  const errors = useQuery(seoQueries.errorEvents());
  const run = useRunBenchmarks();
  const resolve = useResolveError();

  const rows = benchmarks.data ?? [];
  const errorRows = errors.data ?? [];

  // Latest run = the newest row per label.
  const latest = useMemo(() => {
    const seen = new Map<string, Row<"seo_benchmark_runs">>();
    for (const r of rows) if (!seen.has(r.label)) seen.set(r.label, r);
    return [...seen.values()];
  }, [rows]);

  const avgTtfb = latest.length
    ? latest.reduce((s, r) => s + Number(r.ttfb_ms), 0) / latest.filter((r) => Number(r.ttfb_ms) > 0).length || 0
    : 0;
  const avgPagination = latest.length
    ? latest.reduce((s, r) => s + Number(r.pagination_ms), 0) /
        latest.filter((r) => Number(r.pagination_ms) > 0).length || 0
    : 0;
  const reportMs = Number(latest.find((r) => Number(r.report_ms) > 0)?.report_ms ?? 0);
  const openErrors = errorRows.filter((e) => !e.resolved);

  const chartData = latest.map((r) => ({
    name: r.label,
    ttfb: Number(r.ttfb_ms),
    query: Number(r.query_ms),
    pagination: Number(r.pagination_ms),
    report: Number(r.report_ms),
  }));

  return (
    <SeoShell
      title="Admin Diagnostics"
      description="Measured data-layer performance and captured production failures."
      actions={
        <Button size="sm" disabled={run.isPending} onClick={() => run.mutate()}>
          <Gauge className={run.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Run benchmarks
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Avg TTFB" value={ms(avgTtfb)} hint="target < 300ms" />
        <KpiCard label="Avg pagination" value={ms(avgPagination)} hint="next page fetch" />
        <KpiCard label="Report generation" value={ms(reportMs)} hint="90-day executive report" />
        <KpiCard label="Open errors" value={nf.format(openErrors.length)} hint="unresolved captures" />
      </div>

      <Panel className="mt-4" title="Latest benchmark run" description="Milliseconds per stage, measured live">
        <QueryBoundary query={benchmarks} empty="No benchmarks recorded yet — run the suite.">
          {() => (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="ttfb" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="query" fill="var(--color-info)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="pagination" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="report" fill="var(--color-warning)" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </QueryBoundary>
      </Panel>

      <Panel className="mt-4" title="Benchmark history">
        <QueryBoundary query={benchmarks} empty="No benchmark history yet.">
          {() => (
            <DataTable<Row<"seo_benchmark_runs">>
              rows={rows.slice(0, 40)}
              columns={[
                {
                  key: "label",
                  header: "Check",
                  render: (r) => (
                    <div>
                      <p className="font-medium text-foreground">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.target}</p>
                    </div>
                  ),
                },
                { key: "ttfb", header: "TTFB", render: (r) => ms(r.ttfb_ms) },
                { key: "query", header: "Query", render: (r) => ms(r.query_ms) },
                { key: "page", header: "Pagination", render: (r) => ms(r.pagination_ms) },
                { key: "report", header: "Report", render: (r) => ms(r.report_ms) },
                { key: "rows", header: "Rows", render: (r) => nf.format(r.rows_scanned) },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                {
                  key: "when",
                  header: "Recorded",
                  render: (r) => (
                    <span className="text-xs text-muted-foreground">{formatDateTime(r.created_at)}</span>
                  ),
                },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>

      <Panel
        className="mt-4"
        title="Captured errors"
        description="Server functions, routes and SSR failures with context"
      >
        <QueryBoundary query={errors} empty="No errors captured — the module is healthy.">
          {() => (
            <DataTable<Row<"seo_error_events">>
              rows={errorRows}
              columns={[
                {
                  key: "err",
                  header: "Error",
                  render: (e) => (
                    <div className="max-w-md">
                      <p className="font-medium text-foreground">{e.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{e.message}</p>
                    </div>
                  ),
                },
                { key: "source", header: "Source", render: (e) => <StatusPill value={e.source} tone="neutral" /> },
                {
                  key: "where",
                  header: "Where",
                  render: (e) => (
                    <span className="text-xs text-muted-foreground">{e.fn_name ?? e.route ?? "—"}</span>
                  ),
                },
                { key: "sev", header: "Severity", render: (e) => <StatusPill value={e.severity} /> },
                { key: "count", header: "Count", render: (e) => nf.format(e.occurrences) },
                {
                  key: "seen",
                  header: "Last seen",
                  render: (e) => (
                    <span className="text-xs text-muted-foreground">{formatDateTime(e.last_seen_at)}</span>
                  ),
                },
                {
                  key: "action",
                  header: "",
                  render: (e) =>
                    e.resolved ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Resolved
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={resolve.isPending}
                        onClick={() => resolve.mutate(e.id)}
                      >
                        <Activity className="h-3.5 w-3.5" /> Resolve
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
