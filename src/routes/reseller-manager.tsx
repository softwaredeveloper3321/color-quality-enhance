import { createFileRoute } from "@tanstack/react-router";
import { ResellerManagerWorkspace } from "@/components/module-managers/ResellerManagerWorkspace";

export const Route = createFileRoute("/reseller-manager")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reseller Manager — Software Vala" },
      { name: "description", content: "Dedicated Reseller Manager workspace inside the Software Vala Control Panel." },
      { property: "og:title", content: "Reseller Manager — Software Vala" },
      { property: "og:description", content: "Dedicated Reseller Manager workspace inside the Software Vala Control Panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResellerManagerWorkspace,
});