import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { SeoShell } from "@/components/seo/SeoShell";
import { KpiCard, Panel, QueryBoundary, formatDate, nf } from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { seoQueries } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useSearchConsoleSync } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/performance")({
  head: seoHead(
    "/performance",
    "Performance",
    "Organic clicks, impressions, CTR, average position and Core Web Vitals trended over time.",
  ),
  component: PerformanceScreen,
});

const chartAxis = { stroke: "var(--color-muted-foreground)", fontSize: 11 };

function PerformanceScreen() {
  const metrics = useQuery(seoQueries.metrics());
  const sync = useSearchConsoleSync();
  const [site, setSite] = useState("https://softwarevala.com/");

  const rows = metrics.data ?? [];
  const data = useMemo(
    () =>
      rows.map((m) => ({
        date: formatDate(m.recorded_on),
        clicks: m.clicks,
        impressions: m.impressions,
        ctr: Number(m.ctr),
        position: Number(m.avg_position),
        sessions: m.organic_sessions,
        conversions: m.conversions,
        lcp: m.lcp_ms,
        inp: m.inp_ms,
        cls: Number(m.cls),
      })),
    [rows],
  );

  const last = data.at(-1);
  const first = data[0];
  const delta = (a?: number, b?: number) =>
    a == null || b == null || b === 0 ? undefined : `${a - b >= 0 ? "+" : ""}${(((a - b) / b) * 100).toFixed(1)}%`;

  return (
    <SeoShell
      title="Performance"
      description="Search Console trends and Core Web Vitals across the tracked window."
      actions={
        <div className="flex items-center gap-2">
          <Input value={site} onChange={(e) => setSite(e.target.value)} className="w-64" />
          <Button
            size="sm"
            variant="outline"
            disabled={sync.isPending}
            onClick={() => sync.mutate({ siteUrl: site, days: 28 })}
          >
            <RefreshCw className={sync.isPending ? "h-4 w-4 animate-spin" : "h-4 w-4"} /> Sync
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Clicks"
          value={nf.format(last?.clicks ?? 0)}
          {...(delta(last?.clicks, first?.clicks) ? { delta: delta(last?.clicks, first?.clicks) } : {})}
        />
        <KpiCard
          label="Impressions"
          value={nf.format(last?.impressions ?? 0)}
          {...(delta(last?.impressions, first?.impressions)
            ? { delta: delta(last?.impressions, first?.impressions) }
            : {})}
        />
        <KpiCard label="CTR" value={`${(last?.ctr ?? 0).toFixed(2)}%`} />
        <KpiCard label="Avg position" value={(last?.position ?? 0).toFixed(1)} />
      </div>

      <Panel className="mt-4" title="Clicks & impressions">
        <QueryBoundary query={metrics} empty="No performance data yet.">
          {() => (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="perfClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" {...chartAxis} minTickGap={32} />
                  <YAxis {...chartAxis} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--color-card)",
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="var(--color-primary)"
                    fill="url(#perfClicks)"
                    strokeWidth={2}
                  />
                  <Line type="monotone" dataKey="impressions" stroke="var(--color-info)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </QueryBoundary>
      </Panel>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Panel title="CTR vs average position">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" {...chartAxis} minTickGap={32} />
                <YAxis yAxisId="l" {...chartAxis} />
                <YAxis yAxisId="r" orientation="right" reversed {...chartAxis} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line yAxisId="l" type="monotone" dataKey="ctr" stroke="var(--color-success)" dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="position" stroke="var(--color-warning)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Sessions & conversions">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" {...chartAxis} minTickGap={32} />
                <YAxis {...chartAxis} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sessions" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="conversions" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <KpiCard label="LCP" value={`${((last?.lcp ?? 0) / 1000).toFixed(2)}s`} hint="target < 2.5s" />
        <KpiCard label="INP" value={`${last?.inp ?? 0}ms`} hint="target < 200ms" />
        <KpiCard label="CLS" value={(last?.cls ?? 0).toFixed(3)} hint="target < 0.1" />
      </div>
    </SeoShell>
  );
}
