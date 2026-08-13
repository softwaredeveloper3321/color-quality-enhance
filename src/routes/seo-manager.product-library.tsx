import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SeoShell } from "@/components/seo/SeoShell";
import { DataTable } from "@/components/seo/DataTable";
import {
  KpiCard,
  Panel,
  QueryBoundary,
  StatusPill,
} from "@/components/seo/primitives";
import { Button } from "@/components/ui/button";
import { seoQueries, type Row } from "@/lib/seo-queries";
import { seoHead } from "@/lib/seo-head";
import { useRecordActions } from "@/lib/use-seo-actions";

export const Route = createFileRoute("/product-library")({
  head: seoHead("/product-library", "Product SEO Library", "Product-level metadata, target keywords and schema markup for every Software Vala product."),
  component: Screen,
});

function Screen() {
  const query = useQuery(seoQueries.products());
  const { update } = useRecordActions();
  const all = query.data ?? [];

  return (
    <SeoShell title="Product SEO Library" description="Per-product metadata and structured data for every Software Vala product page.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Products" value={all.length} />
        <KpiCard label="Published" value={all.filter((r) => r.status === "published").length} />
        <KpiCard label="Categories" value={new Set(all.map((r) => r.category)).size} />
        <KpiCard label="With schema" value={all.filter((r) => Object.keys(r.structured_data ?? {}).length > 0).length} />
      </div>

      <Panel className="mt-4" title="Product entries">
        <QueryBoundary query={query} empty="No products in the library.">
          {() => (
            <DataTable<Row<"seo_product_entries">>
              rows={all}
              columns={[
                { key: "name", header: "Product", render: (r) => <div><p className="font-medium text-foreground">{r.product_name}</p><p className="text-xs text-muted-foreground">{r.category}</p></div> },
                { key: "keywords", header: "Target keywords", render: (r) => <span className="block max-w-[240px] truncate text-xs text-muted-foreground">{(r.target_keywords ?? []).join(", ")}</span> },
                { key: "meta", header: "Meta title", render: (r) => <span className="block max-w-[240px] truncate text-xs">{r.meta_title ?? "—"}</span> },
                { key: "schema", header: "Schema", render: (r) => Object.keys(r.structured_data ?? {}).length > 0 ? "✓" : "—" },
                { key: "status", header: "Status", render: (r) => <StatusPill value={r.status} /> },
                { key: "actions", header: "", render: (r) => (<Button size="sm" variant="outline" onClick={() => update.mutate({ table: "seo_product_entries", id: r.id, values: { status: r.status === "published" ? "draft" : "published" } })}>{r.status === "published" ? "Unpublish" : "Publish"}</Button>) },
              ]}
            />
          )}
        </QueryBoundary>
      </Panel>
    </SeoShell>
  );
}
