import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Play } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import { KpiCard, Panel, QueryBoundary, StatusPill, formatDateTime, nf } from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions, useRunAutomation } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/scheduler")({
  head: seoHead("/scheduler", "Automation Scheduler", "Scheduled SEO automations with run history, success rates and manual triggers."),
  component: SchedulerScreen,
});

function SchedulerScreen() {
  const automations = useQuery(seoQueries.automations());
  const runs = useQuery(seoQueries.automationRuns());
  const run = useRunAutomation();
  const { update } = useRecordActions();

  const all = automations.data ?? [];
  const nameById = new Map(all.map((a) => [a.id, a.name]));

  return (
    <SeoShell title="Automation Scheduler" description="Recurring SEO jobs and their execution history.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Automations" value={all.length} />
        <KpiCard label="Active" value={all.filter((a) => a.status === "active").length} />
        <KpiCard label="Total runs" value={nf.format(all.reduce((a, x) => a + x.runs_count, 0))} />
        <KpiCard label="Avg success" value={all.length ? `${(all.reduce((a, x) => a + Number(x.success_rate), 0) / all.length).toFixed(1)}%` : "0%"} />
      </div>

      <Panel className="mt-4" title="Scheduled automations">
        <QueryBoundary query={automations} empty="No automations configured.">
          {() => (
            <DataTable<Row<"seo_automations">>
              rows={all}
              columns={[
                { key: "name", header: "Automation", render: (a) => (<div className="max-w-[280px]"><p className="font-medium text-foreground">{a.name}</p><p className="truncate text-xs text-muted-foreground">{a.description ?? a.automation_type}</p></div>) },
                { key: "schedule", header: "Schedule", render: (a) => <StatusPill value={a.schedule} tone="neutral" /> },
                { key: "status", header: "Status", render: (a) => <StatusPill value={a.status} /> },
                { key: "last", header: "Last run", render: (a) => <span className="text-xs text-muted-foreground">{formatDateTime(a.last_run_at)}</span> },
                { key: "next", header: "Next run", render: (a) => <span className="text-xs text-muted-foreground">{formatDateTime(a.next_run_at)}</span> },
                { key: "runs", header: "Runs", render: (a) => a.runs_count },
                { key: "success", header: "Success", render: (a) => `${Number(a.success_rate).toFixed(1)}%` },
                { key: "actions", header: "", render: (a) => (
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline" onClick={() => update.mutate({ table: "seo_automations", id: a.id, values: { status: a.status === "active" ? "paused" : "active" } })}>{a.status === "active" ? "Pause" : "Activate"}</Button>
                    <Button size="sm" disabled={run.isPending} onClick={() => run.mutate(a.id)}><Play className="h-4 w-4" /> Run</Button>
                  </div>
                ) },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>

      <Panel className="mt-4" title="Run history">
        <QueryBoundary query={runs} empty="No automation runs recorded.">
          {(rows) => (
            <DataTable<Row<"seo_automation_runs">>
              rows={rows}
              columns={[
                { key: "automation", header: "Automation", render: (r) => nameById.get(r.automation_id) ?? "—" },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                { key: "items", header: "Items", render: (r) => nf.format(r.items_processed) },
                { key: "message", header: "Message", render: (r) => <span className="block max-w-[360px] truncate text-xs text-muted-foreground">{r.message ?? "—"}</span> },
                { key: "started", header: "Started", render: (r) => <span className="text-xs text-muted-foreground">{formatDateTime(r.started_at)}</span> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
