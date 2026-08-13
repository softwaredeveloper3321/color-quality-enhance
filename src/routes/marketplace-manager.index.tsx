import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MarketplaceManagerModule } from "@/components/marketplace-manager/MarketplaceManagerModule";

export const Route = createFileRoute("/marketplace-manager/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Marketplace Manager — Software Vala" },
      { name: "description", content: "Manage the global marketplace, storefront, campaigns, and integrations." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ManagerGate,
});

// Admin server functions require a bearer token; render the module only once a
// session exists, otherwise send the visitor to sign in.
function ManagerGate() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      if (!session) navigate({ to: "/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      if (!data.session) navigate({ to: "/login" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  if (authed !== true) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </main>
    );
  }
  return <MarketplaceManagerModule />;
}

