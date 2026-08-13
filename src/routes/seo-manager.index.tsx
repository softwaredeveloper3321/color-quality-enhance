import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, MousePointerClick, Eye, Gauge, Percent } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
  formatDate,
  nf,
} from "@/components/seo/primitives";
import { seoQueries } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";

export const Route = createFileRoute("/")({
  head: seoHead(
    "/",
    "SEO Command Center",
    "Live organic performance, keyword movement, technical health and automation status for Software Vala.",
  ),
  component: Overview,
});

function Overview() {
  const metrics = useQuery(seoQueries.metrics());
  const keywords = useQuery(seoQueries.keywords());
  const issues = useQuery(seoQueries.issues());
  const automations = useQuery(seoQueries.automations());
  const suggestions = useQuery(seoQueries.suggestions());

  const rows = metrics.data ?? [];
  const last28 = rows.slice(-28);
  const prev28 = rows.slice(-56, -28);
  const sum = (list: typeof rows, key: "clicks" | "impressions" | "conversions") =>
    list.reduce((acc, r) => acc + (r[key] ?? 0), 0);

  const clicks = sum(last28, "clicks");
  const prevClicks = sum(prev28, "clicks");
  const impressions = sum(last28, "impressions");
  const prevImpressions = sum(prev28, "impressions");
  const avgPosition =
    last28.length > 0
      ? last28.reduce((a, r) => a + Number(r.avg_position ?? 0), 0) / last28.length
      : 0;
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;

  const delta = (now: number, before: number) =>
    before === 0 ? undefined : `${now >= before ? "+" : ""}${(((now - before) / before) * 100).toFixed(1)}%`;

  const chartData = last28.map((r) => ({
    date: new Date(r.recorded_on).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    clicks: r.clicks,
    impressions: r.impressions,
  }));

  const movers = [...(keywords.data ?? [])]
    .filter((k) => k.position != null && k.previous_position != null)
    .sort(
      (a, b) =>
        Math.abs((b.previous_position ?? 0) - (b.position ?? 0)) -
        Math.abs((a.previous_position ?? 0) - (a.position ?? 0)),
    )
    .slice(0, 6);

  const openIssues = (issues.data ?? []).filter((i) => i.status !== "resolved").slice(0, 6);

  return (
    <SeoShell
      title="SEO Command Center"
      description="Everything running across optimization, intelligence and growth."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Clicks (28d)"
          value={nf.format(clicks)}
          delta={delta(clicks, prevClicks)}
          hint="vs prior 28d"
          icon={MousePointerClick}
        />
        <KpiCard
          label="Impressions (28d)"
          value={nf.format(impressions)}
          delta={delta(impressions, prevImpressions)}
          hint="vs prior 28d"
          icon={Eye}
        />
        <KpiCard label="Average CTR" value={`${ctr.toFixed(2)}%`} icon={Percent} hint="last 28 days" />
        <KpiCard
          label="Avg. position"
          value={avgPosition.toFixed(1)}
          icon={Gauge}
          hint="lower is better"
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          title="Organic performance"
          description="Clicks and impressions, last 28 days"
          className="xl:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -18, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="clicksFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="imprFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" minTickGap={24} />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="impressions"
                  stroke="var(--color-info)"
                  fill="url(#imprFill)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  stroke="var(--color-primary)"
                  fill="url(#clicksFill)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Automation status" description="Scheduled jobs and last run">
          <QueryBoundary query={automations} empty="No automations configured.">
            {(rows) => (
              <ul className="space-y-3">
                {rows.slice(0, 6).map((a) => (
                  <li key={a.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{a.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {a.schedule} · {a.runs_count} runs · {Number(a.success_rate).toFixed(0)}% success
                      </p>
                    </div>
                    <StatusPill value={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </QueryBoundary>
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          title="Biggest keyword movers"
          actions={
            <Link to="/keywords" className="text-xs text-primary hover:underline">
              All keywords
            </Link>
          }
        >
          <QueryBoundary query={keywords} empty="No keywords tracked.">
            {() => (
              <ul className="space-y-3">
                {movers.map((k) => {
                  const change = (k.previous_position ?? 0) - (k.position ?? 0);
                  return (
                    <li key={k.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{k.keyword}</p>
                        <p className="text-xs text-muted-foreground">
                          #{k.position} · {nf.format(k.search_volume ?? 0)} vol
                        </p>
                      </div>
                      <span
                        className={`numeric text-sm font-medium ${change >= 0 ? "text-success" : "text-destructive"}`}
                      >
                        {change >= 0 ? "+" : ""}
                        {change}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </QueryBoundary>
        </Panel>

        <Panel
          title="Open issues"
          actions={
            <Link to="/issues" className="text-xs text-primary hover:underline">
              Fix queue
            </Link>
          }
        >
          <QueryBoundary query={issues} empty="No issues detected.">
            {() => (
              <ul className="space-y-3">
                {openIssues.map((i) => (
                  <li key={i.id} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{i.issue_type}</p>
                      <p className="truncate text-xs text-muted-foreground">{i.page_url}</p>
                    </div>
                    <StatusPill value={i.severity} />
                  </li>
                ))}
              </ul>
            )}
          </QueryBoundary>
        </Panel>

        <Panel
          title="AI recommendations"
          actions={
            <Link to="/ai-assistant" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              Open assistant <ArrowUpRight className="h-3 w-3" />
            </Link>
          }
        >
          <QueryBoundary query={suggestions} empty="No suggestions yet.">
            {(rows) => (
              <ul className="space-y-3">
                {rows.slice(0, 5).map((s) => (
                  <li key={s.id}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-foreground">{s.title}</p>
                      <StatusPill value={s.impact} />
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{s.suggestion}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{formatDate(s.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </QueryBoundary>
        </Panel>
      </div>
    </SeoShell>
  );
}
