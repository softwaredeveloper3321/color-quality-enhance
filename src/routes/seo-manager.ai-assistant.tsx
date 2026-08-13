import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { KpiCard, Panel, QueryBoundary, StatusPill, formatDateTime } from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { seoQueries } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useAiGeneration, useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/ai-assistant")({
  head: seoHead(
    "/ai-assistant",
    "AI SEO Assistant",
    "Ask the AI copilot about live rankings, issues and content gaps, and store its recommendations.",
  ),
  component: AiAssistantScreen,
});

const PRESETS = [
  "What should we fix first this week?",
  "Which keywords are closest to page one?",
  "Draft a content plan for hospital management software",
  "Where are competitors beating us?",
];

function AiAssistantScreen() {
  const issues = useQuery(seoQueries.issues());
  const keywords = useQuery(seoQueries.keywords());
  const suggestions = useQuery(seoQueries.suggestions());
  const ai = useAiGeneration();
  const { update } = useRecordActions();
  const [prompt, setPrompt] = useState("");

  const openIssues = (issues.data ?? []).filter((i) => i.status !== "resolved");
  const kws = keywords.data ?? [];

  const context = [
    `Open issues (${openIssues.length}): ${openIssues
      .slice(0, 15)
      .map((i) => `${i.severity} ${i.issue_type} on ${i.page_url}`)
      .join("; ")}`,
    `Top keywords: ${kws
      .slice(0, 20)
      .map((k) => `${k.keyword} (pos ${k.position ?? "-"}, vol ${k.search_volume})`)
      .join("; ")}`,
  ].join("\n");

  const ask = (q: string) => {
    setPrompt(q);
    ai.mutate({ task: "assistant", prompt: q, context });
  };

  return (
    <SeoShell title="AI SEO Assistant" description="Grounded in your live SEO data — never generic advice.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Open issues in context" value={openIssues.length} icon={Sparkles} />
        <KpiCard label="Keywords in context" value={kws.length} />
        <KpiCard label="Stored recommendations" value={(suggestions.data ?? []).length} />
        <KpiCard
          label="Pending review"
          value={(suggestions.data ?? []).filter((s) => s.status === "pending").length}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Ask the copilot">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <Button key={p} size="sm" variant="outline" onClick={() => ask(p)} disabled={ai.isPending}>
                  {p}
                </Button>
              ))}
            </div>
            <Textarea
              rows={4}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything about rankings, pages, competitors or content…"
            />
            <div className="flex gap-2">
              <Button
                disabled={prompt.trim().length < 3 || ai.isPending}
                onClick={() => ai.mutate({ task: "assistant", prompt: prompt.trim(), context })}
              >
                <Sparkles className={ai.isPending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} /> Ask
              </Button>
              <Button
                variant="outline"
                disabled={ai.isPending}
                onClick={() =>
                  ai.mutate({
                    task: "suggestions",
                    prompt: "Generate this week's prioritised SEO action plan.",
                    context,
                    persist: true,
                  })
                }
              >
                Generate & save action plan
              </Button>
            </div>
            {ai.data ? (
              <div className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground">
                {ai.data.text}
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel title="Saved recommendations">
          <QueryBoundary query={suggestions} empty="No AI recommendations stored yet.">
            {(rows) => (
              <div className="space-y-3">
                {rows.slice(0, 12).map((s) => (
                  <div key={s.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <StatusPill value={s.status} />
                    </div>
                    <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-xs text-muted-foreground">
                      {s.suggestion}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">
                        {s.impact} impact · {s.confidence}% · {formatDateTime(s.created_at)}
                      </span>
                      {s.status === "pending" ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              update.mutate({
                                table: "seo_ai_suggestions",
                                id: s.id,
                                values: { status: "dismissed" },
                              })
                            }
                          >
                            Dismiss
                          </Button>
                          <Button
                            size="sm"
                            onClick={() =>
                              update.mutate({
                                table: "seo_ai_suggestions",
                                id: s.id,
                                values: { status: "applied" },
                              })
                            }
                          >
                            Apply
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </QueryBoundary>
        </Panel>
      </div>
    </SeoShell>
  );
}
