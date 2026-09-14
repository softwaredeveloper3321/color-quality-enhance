import { createFileRoute } from "@tanstack/react-router";
import { ApiAiManagerWorkspace } from "@/components/module-managers/ApiAiManagerWorkspace";

export const Route = createFileRoute("/api-ai-manager")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "API + AI Manager — Software Vala" },
      { name: "description", content: "Dedicated API + AI Manager workspace inside the Software Vala Control Panel." },
      { property: "og:title", content: "API + AI Manager — Software Vala" },
      { property: "og:description", content: "Dedicated API + AI Manager workspace inside the Software Vala Control Panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ApiAiManagerWorkspace,
});