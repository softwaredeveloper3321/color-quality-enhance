import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Sparkles, Trash2 } from "lucide-react";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import { KpiCard, Panel, QueryBoundary, StatusPill, nf } from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useAiGeneration, useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/meta-rules")({
  head: seoHead(
    "/meta-rules",
    "Meta Rules",
    "Pattern-based title, description and Open Graph templates applied automatically across URL groups.",
  ),
  component: MetaRulesScreen,
});

function MetaRulesScreen() {
  const rules = useQuery(seoQueries.metaRules());
  const { insert, update, remove } = useRecordActions();
  const ai = useAiGeneration();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pattern, setPattern] = useState("/");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiSubject, setAiSubject] = useState("");

  const all = rules.data ?? [];
  const active = all.filter((r) => r.status === "active").length;
  const covered = all.reduce((a, r) => a + r.applies_to, 0);

  return (
    <SeoShell
      title="Meta Rules"
      description="Templated metadata that keeps thousands of URLs optimised without manual edits."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Rules" value={all.length} />
        <KpiCard label="Active" value={active} />
        <KpiCard label="URLs covered" value={nf.format(covered)} />
        <KpiCard label="Draft rules" value={all.length - active} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Rules"
          description="Highest priority wins when patterns overlap"
          actions={
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" /> New rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New meta rule</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="mr-name">Name</Label>
                    <Input id="mr-name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mr-pattern">URL pattern</Label>
                    <Input id="mr-pattern" value={pattern} onChange={(e) => setPattern(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mr-title">Title template</Label>
                    <Input id="mr-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mr-desc">Description template</Label>
                    <Textarea
                      id="mr-desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    disabled={!name.trim() || !title.trim() || insert.isPending}
                    onClick={() =>
                      insert.mutate(
                        {
                          table: "seo_meta_rules",
                          values: {
                            name: name.trim(),
                            url_pattern: pattern.trim(),
                            title_template: title.trim(),
                            description_template: description.trim(),
                            priority: all.length + 1,
                            applies_to: 0,
                            status: "draft",
                          },
                        },
                        { onSuccess: () => setOpen(false) },
                      )
                    }
                  >
                    Create rule
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          }
        >
          <QueryBoundary query={rules} empty="No meta rules defined.">
            {() => (
              <DataTable<Row<"seo_meta_rules">>
                rows={all}
                columns={[
                  {
                    key: "name",
                    header: "Rule",
                    render: (r) => (
                      <div className="min-w-0 max-w-[260px]">
                        <p className="truncate font-medium text-foreground">{r.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.url_pattern}</p>
                      </div>
                    ),
                  },
                  {
                    key: "templates",
                    header: "Templates",
                    render: (r) => (
                      <div className="max-w-[320px] space-y-1">
                        <p className="truncate text-xs text-foreground">{r.title_template}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.description_template}</p>
                      </div>
                    ),
                  },
                  { key: "priority", header: "Priority", render: (r) => r.priority },
                  { key: "applies", header: "URLs", render: (r) => nf.format(r.applies_to) },
                  { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                  {
                    key: "actions",
                    header: "",
                    render: (r) => (
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            update.mutate({
                              table: "seo_meta_rules",
                              id: r.id,
                              values: { status: r.status === "active" ? "paused" : "active" },
                            })
                          }
                        >
                          {r.status === "active" ? "Pause" : "Activate"}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Delete ${r.name}`}
                          onClick={() => remove.mutate({ table: "seo_meta_rules", id: r.id })}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </QueryBoundary>
        </Panel>

        <Panel title="AI meta writer" description="Generate a compliant title and description">
          <div className="space-y-3">
            <Textarea
              rows={4}
              value={aiSubject}
              onChange={(e) => setAiSubject(e.target.value)}
              placeholder="Describe the page, e.g. 'Restaurant POS software pricing page for Indian SMBs'"
            />
            <Button
              className="w-full"
              disabled={aiSubject.trim().length < 3 || ai.isPending}
              onClick={() => ai.mutate({ task: "meta", prompt: aiSubject.trim() })}
            >
              <Sparkles className={ai.isPending ? "h-4 w-4 animate-pulse" : "h-4 w-4"} /> Generate metadata
            </Button>
            {ai.data ? (
              <pre className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-xs text-foreground">
                {ai.data.text}
              </pre>
            ) : null}
          </div>
        </Panel>
      </div>
    </SeoShell>
  );
}
