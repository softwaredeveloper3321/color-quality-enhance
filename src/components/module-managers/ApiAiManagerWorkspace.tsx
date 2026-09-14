import { ArrowLeft, Brain, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { AISuitePage } from "@/components/dashboard/AISuitePage";

export function ApiAiManagerWorkspace() {
  return (
    <main className="min-h-screen bg-background px-4 py-5 text-foreground md:px-8 md:py-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <header className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" aria-label="Back to Control Panel">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Control Panel</p>
            <h1 className="text-2xl font-bold tracking-tight">API + AI Manager</h1>
          </div>
        </header>

        <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg md:p-8">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-primary/15 blur-3xl" aria-hidden="true" />
          <div className="relative flex max-w-3xl items-start gap-4">
            <Brain className="mt-1 h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Dedicated operations workspace</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">API + AI Manager</h2>
              <p className="mt-3 text-sm text-muted-foreground md:text-base">
                Open the existing AI tools and service controls without leaving the dedicated manager page.
              </p>
            </div>
          </div>
        </section>

        <AISuitePage onBack={() => undefined} />
      </div>
    </main>
  );
}