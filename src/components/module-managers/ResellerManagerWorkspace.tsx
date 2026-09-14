import { useState } from "react";
import { ArrowLeft, ChevronRight, Handshake, Layers3, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ResellerCenterPage } from "@/components/dashboard/ResellerCenterPage";
import { ResellerModulePage } from "@/components/dashboard/ResellerModulePage";
import { RESELLER_CENTER_ORDER, RESELLER_CENTERS, type CenterKey } from "@/lib/reseller-extras";
import { ROLES } from "@/lib/roles";

type Selection =
  | { kind: "module"; key: string }
  | { kind: "center"; key: CenterKey }
  | null;

export function ResellerManagerWorkspace() {
  const [selection, setSelection] = useState<Selection>(null);
  const [search, setSearch] = useState("");
  const reseller = ROLES.reseller;
  const query = search.trim().toLowerCase();
  const modules = reseller.modules.filter((item) => item.label.toLowerCase().includes(query));
  const centers = RESELLER_CENTER_ORDER.filter((key) => RESELLER_CENTERS[key].label.toLowerCase().includes(query));

  if (selection?.kind === "module") {
    return <ResellerModulePage role={reseller} moduleKey={selection.key} onBack={() => setSelection(null)} />;
  }

  if (selection?.kind === "center") {
    return <ResellerCenterPage centerKey={selection.key} onBack={() => setSelection(null)} />;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground md:px-8 md:py-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="outline" size="icon" aria-label="Back to Control Panel">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Control Panel</p>
              <h1 className="text-2xl font-bold tracking-tight">Reseller Manager</h1>
            </div>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reseller workspace"
              aria-label="Search reseller workspace"
              className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition focus:ring-2 focus:ring-ring"
            />
          </div>
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Dedicated operations workspace</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Manage reseller operations</h2>
            <p className="mt-3 text-sm text-muted-foreground md:text-base">
              Open the existing client, license, lead, finance, reporting, and reseller-center workspaces directly.
            </p>
          </div>
        </section>

        <WorkspaceSection title="Reseller modules" icon={<Layers3 className="h-4 w-4" />}>
          {modules.map((item) => (
            <WorkspaceCard key={item.key} label={item.label} onClick={() => setSelection({ kind: "module", key: item.key })} />
          ))}
        </WorkspaceSection>

        <WorkspaceSection title="Reseller centers" icon={<Handshake className="h-4 w-4" />}>
          {centers.map((key) => (
            <WorkspaceCard key={key} label={RESELLER_CENTERS[key].label} onClick={() => setSelection({ kind: "center", key })} />
          ))}
        </WorkspaceSection>
      </div>
    </main>
  );
}

function WorkspaceSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-primary">{icon}</span>
        {title}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function WorkspaceCard({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-20 items-center justify-between rounded-xl border border-border bg-card px-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg"
    >
      <span className="text-sm font-semibold">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
    </button>
  );
}