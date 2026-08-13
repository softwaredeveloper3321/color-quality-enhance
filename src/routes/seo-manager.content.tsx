import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import { KpiCard, Panel, QueryBoundary, StatusPill, formatDate, nf } from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useAiGeneration, useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/content")({
  head: seoHead(
    "/content",
    "Content Generator",
    "Generate, score and publish SEO articles, landing copy and FAQs from live keyword data.",
  ),
  component: ContentScreen,
});

function ContentScreen() {
  const content = useQuery(seoQueries.content());
  const ai = useAiGeneration();
  const { update } = useRecordActions();
  const [topic, setTopic] = useState("");
  const [brief, setBrief] = useState("");

  const all = content.data ?? [];

  return (
    <SeoShell title="Content Generator" description="AI drafting wired to your keyword targets and page inventory.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Content items" value={all.length} />
        <KpiCard label="Published" value={all.filter((c) => c.status === "published").length} />
        <KpiCard label="Drafts" value={all.filter((c) => c.status === "draft").length} />
        <KpiCard label="Words written" value={nf.format(all.reduce((a, c) => a + c.word_count, 0))} />
      </div>

      <Panel className="mt-4" title="Generate new content">
        <div className="space-y-3">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Target keyword or title" />
          <Textarea
            rows={3}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Brief: audience, angle, must-include points"
          />
          <Button
            disabled={topic.trim().length < 3 || ai.isPending}
            onClick={() =>
              ai.mutate({
                task: "content",
                prompt: topic.trim(),
                ...(brief.trim() ? { context: brief.trim() } : {}),
                persist: true,
              })
            }
          >
            <Sparkles className={ai.isPending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} /> Generate article
          </Button>
          {ai.data ? (
            <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground">
              {ai.data.text}
            </div>
          ) : null}
        </div>
      </Panel>

      <Panel className="mt-4" title="Content library">
        <QueryBoundary query={content} empty="No content generated yet.">
          {() => (
            <DataTable<Row<"seo_content_items">>
              rows={all}
              columns={[
                {
                  key: "title",
                  header: "Title",
                  render: (c) => (
                    <div className="max-w-[320px]">
                      <p className="truncate font-medium text-foreground">{c.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{c.target_keyword ?? "—"}</p>
                    </div>
                  ),
                },
                { key: "type", header: "Type", render: (c) => <StatusPill value={c.content_type} tone="neutral" /> },
                { key: "words", header: "Words", render: (c) => nf.format(c.word_count) },
                { key: "score", header: "SEO score", render: (c) => c.seo_score },
                { key: "status", header: "Status", render: (c) => <StatusPill value={c.status} /> },
                {
                  key: "date",
                  header: "Created",
                  render: (c) => <span className="text-xs text-muted-foreground">{formatDate(c.created_at)}</span>,
                },
                {
                  key: "actions",
                  header: "",
                  render: (c) => (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={c.status === "published"}
                      onClick={() =>
                        update.mutate({
                          table: "seo_content_items",
                          id: c.id,
                          values: { status: "published", published_at: new Date().toISOString() },
                        })
                      }
                    >
                      Publish
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
