import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
  nf,
} from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/flows")({
  head: seoHead("/flows", "Automation Flows", "Trigger-based multi-step marketing flows with execution counts and conversion rates."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.flows());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Automation Flows" description="Trigger-based multi-step growth flows with conversion tracking.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Flows" value={all.length} />
        <KpiCard label="Active" value={all.filter((r) => r.status === "active").length} />
        <KpiCard label="Executions" value={nf.format(all.reduce((a, r) => a + r.executions, 0))} />
        <KpiCard label="Avg conversion" value={all.length ? `${(all.reduce((a, r) => a + Number(r.conversion_rate), 0) / all.length).toFixed(1)}%` : "0%"} />
      </div>

      <Panel className="mt-4" title="Flows">
        <QueryBoundary query={query} empty="No automation flows defined.">
          {() => (
            <DataTable<Row<"seo_automation_flows">>
              rows={all}
              columns={[
                { key: "name", header: "Flow", render: (r) => <div><p className="font-medium text-foreground">{r.name}</p><p className="text-xs text-muted-foreground">Trigger: {r.trigger_event.replace(/[_-]/g, " ")}</p></div> },
                { key: "steps", header: "Steps", render: (r) => <span className="block max-w-[320px] truncate text-xs text-muted-foreground">{(Array.isArray(r.steps) ? r.steps : []).map((s) => (typeof s === "string" ? s : JSON.stringify(s))).join(" → ")}</span> },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                { key: "executions", header: "Runs", render: (r) => nf.format(r.executions) },
                { key: "conversion", header: "Conversion", render: (r) => `${Number(r.conversion_rate).toFixed(1)}%` },
                { key: "actions", header: "", render: (r) => (<Button size="sm" variant="outline" onClick={() => update.mutate({ table: "seo_automation_flows", id: r.id, values: { status: r.status === "active" ? "paused" : "active" } })}>{r.status === "active" ? "Pause" : "Activate"}</Button>) },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
