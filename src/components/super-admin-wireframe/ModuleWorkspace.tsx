/**
 * MODULE WORKSPACE
 * =================
 * Renders the real module screen for every Control Panel sidebar entry.
 * Every module copied from the sapphire-cockpit source is wired here so that
 * nothing is "available but hidden" — Boss, R&D and all managers are reachable.
 */

import { memo, Suspense, lazy } from "react";
import type { RoleId } from "./ControlPanelSidebar";
import { ControlPanelDashboard } from "./ControlPanelDashboard";

const HomeDashboard = lazy(() => import("@/components/control-panel/HomeDashboard"));
const SecurityDashboard = lazy(() => import("@/components/control-panel/SecurityDashboard"));
const SettingsDashboard = lazy(() => import("@/components/control-panel/SettingsDashboard"));
const ContinentDashboard = lazy(() => import("./ContinentDashboard"));
const CountryAdminDashboard = lazy(() => import("./CountryAdminDashboard"));
const RnDDashboard = lazy(() => import("@/components/rnd/RnDDashboard"));

const DEMO_COUNTRY = {
  id: "in",
  name: "India",
  code: "IN",
  franchises: 42,
  resellers: 18,
  leads: 320,
  users: 12480,
  status: "healthy" as const,
  revenue: 4250000,
  coordinates: [78.9629, 20.5937] as [number, number],
  admin: "Country Head — India",
  performance: 92,
};

const MODULE_TITLES: Record<string, { title: string; subtitle: string }> = {
  boss_owner: { title: "Boss / Owner Command", subtitle: "Final authority • Full system ownership" },
  ceo: { title: "CEO Oversight", subtitle: "Vision, growth and read-only oversight" },
  rnd_dashboard: { title: "R&D Innovation Lab", subtitle: "Future lab • Prototypes • Technology radar" },
};

const Loading = () => (
  <div className="flex h-[60vh] items-center justify-center text-sm text-white/60">
    Loading module…
  </div>
);

export const ModuleWorkspace = memo(({ role }: { role: RoleId }) => {
  const meta = MODULE_TITLES[role];

  const body = (() => {
    switch (role) {
      case "home":
        return <HomeDashboard />;
      case "security":
        return <SecurityDashboard />;
      case "settings":
        return <SettingsDashboard />;
      case "continent_super_admin":
        return <ContinentDashboard continent="asia" />;
      case "country_head":
        return <CountryAdminDashboard country={DEMO_COUNTRY} continent="asia" onBack={() => {}} />;
      case "rnd_dashboard":
        return <RnDDashboard />;
      default:
        return <ControlPanelDashboard />;
    }
  })();

  return (
    <div className="min-w-0 flex-1">
      {meta && (
        <div className="mb-4">
          <h2 className="text-lg font-extrabold tracking-tight text-white">{meta.title}</h2>
          <p className="text-xs text-white/60">{meta.subtitle}</p>
        </div>
      )}
      <Suspense fallback={<Loading />}>{body}</Suspense>
    </div>
  );
});

ModuleWorkspace.displayName = "ModuleWorkspace";
export default ModuleWorkspace;
