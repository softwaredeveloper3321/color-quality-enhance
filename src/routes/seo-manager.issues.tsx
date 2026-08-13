import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";

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
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/issues")({
  head: seoHead(
    "/issues",
    "Issues & Fixes",
    "Every detected SEO defect with severity, affected URL and the recommended fix.",
  ),
  component: IssuesScreen,
});

const FILTERS = ["all", "high", "medium", "low"] as const;

function IssuesScreen() {
  const issues = useQuery(seoQueries.issues());
  const { update } = useRecordActions();
  const [severity, setSeverity] = useState<(typeof FILTERS)[number]>("all");

  const all = issues.data ?? [];
  const rows = useMemo(
    () => (severity === "all" ? all : all.filter((i) => i.severity === severity)),
    [all, severity],
  );

  const open = all.filter((i) => i.status !== "resolved");

  return (
    <SeoShell title="Issues & Fixes" description="Prioritised defects with one-click resolution tracking.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open issues" value={open.length} icon={AlertTriangle} />
        <KpiCard label="High severity" value={open.filter((i) => i.severity === "high").length} />
        <KpiCard label="Medium" value={open.filter((i) => i.severity === "medium").length} />
        <KpiCard label="Resolved" value={all.length - open.length} />
      </div>

      <Panel
        className="mt-4"
        title="Issue queue"
        actions={
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={severity === f ? "default" : "outline"}
                onClick={() => setSeverity(f)}
              >
                {f}
              </Button>
            ))}
          </div>
        }
      >
        <QueryBoundary query={issues} empty="No issues detected.">
          {() => (
            <DataTable<Row<"seo_issues">>
              rows={rows}
              columns={[
                {
                  key: "issue",
                  header: "Issue",
                  render: (i) => (
                    <div className="max-w-[340px]">
                      <p className="font-medium text-foreground">{i.issue_type.replace(/[_-]/g, " ")}</p>
                      <p className="truncate text-xs text-muted-foreground">{i.page_url}</p>
                    </div>
                  ),
                },
                { key: "category", header: "Category", render: (i) => <StatusPill value={i.category} tone="neutral" /> },
                { key: "severity", header: "Severity", render: (i) => <StatusPill value={i.severity} /> },
                {
                  key: "description",
                  header: "Detail",
                  render: (i) => (
                    <div className="max-w-[360px] space-y-1">
                      <p className="text-xs text-foreground">{i.description}</p>
                      {i.fix_suggestion ? (
                        <p className="text-xs text-primary">Fix: {i.fix_suggestion}</p>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "detected",
                  header: "Detected",
                  render: (i) => (
                    <span className="text-xs text-muted-foreground">{formatDateTime(i.detected_at)}</span>
                  ),
                },
                { key: "status", header: "Status", render: (i) => <StatusPill value={i.status} /> },
                {
                  key: "actions",
                  header: "",
                  render: (i) =>
                    i.status === "resolved" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          update.mutate({
                            table: "seo_issues",
                            id: i.id,
                            values: { status: "open", resolved_at: null },
                          })
                        }
                      >
                        Reopen
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() =>
                          update.mutate({
                            table: "seo_issues",
                            id: i.id,
                            values: { status: "resolved", resolved_at: new Date().toISOString() },
                          })
                        }
                      >
                        Mark fixed
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
