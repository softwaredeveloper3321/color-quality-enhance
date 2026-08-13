import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { History, Play, Shield } from "lucide-react";

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
import {
  ALL,
  DateFilter,
  FilterBar,
  SearchFilter,
  SelectFilter,
  optionsFrom,
} from "@/components/seo/FilterBar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useSiteAudit } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/audit")({
  head: seoHead(
    "/audit",
    "Site Audit",
    "Full-site crawls scoring on-page, technical, content and off-page health for Software Vala.",
  ),
  component: AuditScreen,
});

type Breakdown = Record<string, number>;

function AuditScreen() {
  const audits = useQuery(seoQueries.audits());
  const activity = useQuery(seoQueries.activity());
  const audit = useSiteAudit();

  const all = audits.data ?? [];
  const latest = all[0];

  const [auditSearch, setAuditSearch] = useState("");
  const [auditStatus, setAuditStatus] = useState(ALL);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [logTable, setLogTable] = useState(ALL);
  const [logAction, setLogAction] = useState(ALL);

  const auditStatuses = useMemo(() => optionsFrom(all, (a) => a.status), [all]);
  const filteredAudits = useMemo(() => {
    const term = auditSearch.trim().toLowerCase();
    const fromTime = from ? new Date(`${from}T00:00:00`).getTime() : null;
    const toTime = to ? new Date(`${to}T23:59:59`).getTime() : null;
    return all.filter((a) => {
      if (term && !a.name.toLowerCase().includes(term)) return false;
      if (auditStatus !== ALL && a.status !== auditStatus) return false;
      const started = new Date(a.started_at).getTime();
      if (fromTime !== null && started < fromTime) return false;
      if (toTime !== null && started > toTime) return false;
      return true;
    });
  }, [all, auditSearch, auditStatus, from, to]);
  const auditFiltersActive =
    auditSearch !== "" || auditStatus !== ALL || from !== "" || to !== "";

  const activityRows = activity.data ?? [];
  const logTables = useMemo(() => optionsFrom(activityRows, (r) => r.table_name), [activityRows]);
  const logActions = useMemo(() => optionsFrom(activityRows, (r) => r.action), [activityRows]);
  const filteredActivity = useMemo(
    () =>
      activityRows.filter(
        (r) =>
          (logTable === ALL || r.table_name === logTable) &&
          (logAction === ALL || r.action === logAction),
      ),
    [activityRows, logAction, logTable],
  );
  const logFiltersActive = logTable !== ALL || logAction !== ALL;
  const breakdown = (latest?.breakdown ?? {}) as Breakdown;

  return (
    <SeoShell
      title="Site Audit"
      description="Scheduled and on-demand crawls with category-level scoring."
      actions={
        <Button
          size="sm"
          disabled={audit.isPending}
          onClick={() => audit.mutate()}
        >
          <Play className={audit.isPending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} /> Run audit
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Latest score" value={latest?.score ?? 0} icon={Shield} hint="0–100" />
        <KpiCard label="Pages crawled" value={nf.format(latest?.pages_crawled ?? 0)} />
        <KpiCard label="Issues found" value={nf.format(latest?.issues_found ?? 0)} />
        <KpiCard label="Audits run" value={all.length} />
      </div>

      <Panel className="mt-4" title="Latest audit breakdown" description={latest?.name}>
        {Object.keys(breakdown).length === 0 ? (
          <p className="text-sm text-muted-foreground">Run an audit to see a category breakdown.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="capitalize text-muted-foreground">{key.replace(/[_-]/g, " ")}</span>
                  <span className="numeric font-medium text-foreground">{value}</span>
                </div>
                <Progress value={Number(value)} />
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel className="mt-4" title="Audit history">
        <FilterBar
          active={auditFiltersActive}
          onReset={() => {
            setAuditSearch("");
            setAuditStatus(ALL);
            setFrom("");
            setTo("");
          }}
          resultLabel={`${filteredAudits.length} of ${all.length} audits`}
        >
          <SearchFilter
            value={auditSearch}
            onChange={setAuditSearch}
            label="Search audits by name"
            placeholder="Search audits…"
          />
          <SelectFilter
            value={auditStatus}
            onChange={setAuditStatus}
            label="Status"
            options={auditStatuses}
          />
          <DateFilter value={from} onChange={setFrom} label="From" />
          <DateFilter value={to} onChange={setTo} label="To" />
        </FilterBar>
        <QueryBoundary query={audits} empty="No audits run yet.">
          {() => (
            <DataTable<Row<"seo_audits">>
              rows={filteredAudits}
              columns={[
                { key: "name", header: "Audit", render: (a) => <span className="font-medium">{a.name}</span> },
                { key: "status", header: "Status", render: (a) => <StatusPill value={a.status} /> },
                { key: "score", header: "Score", render: (a) => a.score },
                { key: "pages", header: "Pages", render: (a) => nf.format(a.pages_crawled) },
                { key: "issues", header: "Issues", render: (a) => nf.format(a.issues_found) },
                {
                  key: "started",
                  header: "Started",
                  render: (a) => <span className="text-xs text-muted-foreground">{formatDateTime(a.started_at)}</span>,
                },
                {
                  key: "completed",
                  header: "Completed",
                  render: (a) => (
                    <span className="text-xs text-muted-foreground">{formatDateTime(a.completed_at)}</span>
                  ),
                },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>

      <Panel className="mt-4" title="Immutable activity trail" description="Database-recorded changes across the SEO Manager">
        <FilterBar
          active={logFiltersActive}
          onReset={() => {
            setLogTable(ALL);
            setLogAction(ALL);
          }}
          resultLabel={`${filteredActivity.length} of ${activityRows.length} entries`}
        >
          <SelectFilter value={logTable} onChange={setLogTable} label="Area" options={logTables} />
          <SelectFilter
            value={logAction}
            onChange={setLogAction}
            label="Action"
            options={logActions}
          />
        </FilterBar>
        <QueryBoundary query={activity} empty="No SEO Manager changes recorded yet.">
          {() => (
            <DataTable<Row<"seo_activity_log">>
              rows={filteredActivity}
              columns={[
                { key: "time", header: "Time", render: (row) => <span className="text-xs text-muted-foreground">{formatDateTime(row.occurred_at)}</span> },
                { key: "action", header: "Action", render: (row) => <StatusPill value={row.action.toLowerCase()} /> },
                { key: "table", header: "Area", render: (row) => <span className="font-medium">{row.table_name.replace(/^seo_/, "").replace(/_/g, " ")}</span> },
                { key: "record", header: "Record", render: (row) => <span className="numeric text-xs text-muted-foreground">{row.record_id?.slice(0, 8) ?? "—"}</span> },
                { key: "actor", header: "Actor", render: (row) => <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><History aria-hidden="true" className="h-3.5 w-3.5" />{row.actor.replace(/_/g, " ")}</span> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
