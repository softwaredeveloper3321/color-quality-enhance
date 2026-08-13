import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import { KpiCard, Panel, QueryBoundary, StatusPill, formatDate, nf } from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useAiGeneration } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/reels")({
  head: seoHead("/reels", "AI Reels Creator", "Generate short-form vertical video scripts from SEO topics and track their reach."),
  component: ReelsScreen,
});

function ReelsScreen() {
  const reels = useQuery(seoQueries.reels());
  const ai = useAiGeneration();
  const [prompt, setPrompt] = useState("");
  const all = reels.data ?? [];

  return (
    <SeoShell title="AI Reels Creator" description="Short-form video scripts generated from your winning SEO topics.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Reels" value={all.length} />
        <KpiCard label="Published" value={all.filter((r) => r.status === "published").length} />
        <KpiCard label="Views" value={nf.format(all.reduce((a, r) => a + r.views, 0))} />
        <KpiCard label="Platforms" value={new Set(all.map((r) => r.platform)).size} />
      </div>

      <Panel className="mt-4" title="Generate a reel script">
        <div className="space-y-3">
          <Textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Topic, e.g. 'Why clinics switch to our hospital management software'" />
          <Button disabled={prompt.trim().length < 3 || ai.isPending} onClick={() => ai.mutate({ task: "reel", prompt: prompt.trim(), persist: true })}>
            <Sparkles className={ai.isPending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} /> Generate script
          </Button>
          {ai.data ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-4 text-sm text-foreground">{ai.data.text}</pre>
          ) : null}
        </div>
      </Panel>

      <Panel className="mt-4" title="Reel library">
        <QueryBoundary query={reels} empty="No reels generated yet.">
          {() => (
            <DataTable<Row<"seo_reels">>
              rows={all}
              columns={[
                { key: "title", header: "Title", render: (r) => <span className="block max-w-[280px] truncate font-medium text-foreground">{r.title}</span> },
                { key: "platform", header: "Platform", render: (r) => <StatusPill value={r.platform} tone="neutral" /> },
                { key: "duration", header: "Length", render: (r) => `${r.duration_seconds}s` },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                { key: "views", header: "Views", render: (r) => nf.format(r.views) },
                { key: "created", header: "Created", render: (r) => <span className="text-xs text-muted-foreground">{formatDate(r.created_at)}</span> },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
