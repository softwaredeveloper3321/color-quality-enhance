import { createFileRoute, Link } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ArrowLeft, Store } from "lucide-react";
import { DemoUrlManager } from "@/components/marketplace/DemoUrlManager";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace Manager — Demo URL Management Center" },
      {
        name: "description",
        content:
          "Manage unlimited role-based demo URLs per product: credentials, environments, live reachability tests, response times and SSL status.",
      },
      { property: "og:title", content: "Marketplace Manager — Demo URL Management Center" },
      {
        property: "og:description",
        content:
          "Full CRUD demo URL manager with real HTTP status checks, response times, login-page validation and SSL monitoring.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketplacePage,
});

function MarketplacePage() {
  return (
    <TooltipProvider>
      <div
        className="dark min-h-screen w-full"
        style={{
          background:
            "radial-gradient(1200px 700px at 18% -10%, #163a72 0%, transparent 60%), radial-gradient(900px 600px at 100% 0%, #0f3a5c 0%, transparent 55%), #070f22",
        }}
      >
        <main className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 p-5">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/35 bg-primary/12 text-primary">
                <Store className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-extrabold tracking-[-0.02em] text-foreground">
                  Marketplace Manager — Demo URL Center
                </h1>
                <p className="text-[11px] font-medium text-foreground/50">
                  Unlimited demo environments and role-based credentials per product, with real status checking.
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2 text-[12px] font-semibold text-foreground/80 transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" /> Control Panel
            </Link>
          </header>

          <DemoUrlManager />
        </main>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
