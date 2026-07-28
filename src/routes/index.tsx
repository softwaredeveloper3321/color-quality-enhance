import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bot,
  Box,
  Brain,
  Building2,
  CheckCircle,
  Cpu,
  DollarSign,
  Eye,
  FileCheck,
  Flag,
  Gauge,
  Globe2,
  HardDrive,
  Headphones,
  Info,
  MemoryStick,
  Percent,
  PiggyBank,
  Rocket,
  Server,
  ShieldCheck,
  Star,
  Target,
  Terminal,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

import ControlPanelSidebar, {
  type RoleId,
} from "@/components/super-admin-wireframe/ControlPanelSidebar";
import { ControlPanelContent } from "@/components/control-panel";
import { KPIGrid, KPIBox } from "@/components/boss/KPIGrid";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Master Control Panel — Boss Cockpit" },
      {
        name: "description",
        content:
          "Boss/Owner master control panel: premium violet cockpit with live sidebar and a unified 2x20 grid of 40 KPI cards.",
      },
      { property: "og:title", content: "Master Control Panel — Boss Cockpit" },
      {
        property: "og:description",
        content:
          "Unified 40-card control cockpit: revenue, servers, AI, franchise, finance and alerts in one 2x20 grid.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Status = "healthy" | "warning" | "critical" | "action";
type Urgency = "low" | "medium" | "high" | "critical";

interface Kpi {
  id: string;
  label: string;
  value: string;
  subValues: string[];
  status: Status;
  icon: React.ElementType;
  source: string;
  urgency: Urgency;
  lastUpdate: string;
}

// ===== MERGED 2 × 20 = 40 KPI CARDS (all 14 dashboard boxes folded in) =====
const KPI_BOXES: Kpi[] = [
  // KEY STATS
  { id: "revenue", label: "Total Revenue", value: "₹42.5L", subValues: ["Finance ledger"], status: "healthy", icon: DollarSign, source: "Key Stats", urgency: "low", lastUpdate: "2 min ago" },
  { id: "growth", label: "Growth", value: "+18%", subValues: ["Month over month"], status: "healthy", icon: TrendingUp, source: "Key Stats", urgency: "low", lastUpdate: "2 min ago" },
  { id: "users", label: "Active Users", value: "2,847", subValues: ["Across all products"], status: "healthy", icon: Users, source: "Key Stats", urgency: "low", lastUpdate: "1 min ago" },
  { id: "countries", label: "Countries", value: "12", subValues: ["4 continents"], status: "healthy", icon: Globe2, source: "Key Stats", urgency: "low", lastUpdate: "10 min ago" },
  { id: "franchises", label: "Franchises", value: "24", subValues: ["22 active, 2 pending"], status: "warning", icon: Building2, source: "Key Stats", urgency: "medium", lastUpdate: "8 min ago" },
  // SYSTEM HEALTH
  { id: "server-status", label: "Server Status", value: "ONLINE", subValues: ["All nodes reachable"], status: "healthy", icon: Server, source: "System Health", urgency: "low", lastUpdate: "just now" },
  { id: "uptime", label: "Uptime", value: "99.97%", subValues: ["Last 30 days"], status: "healthy", icon: Activity, source: "System Health", urgency: "low", lastUpdate: "5 min ago" },
  { id: "cpu-load", label: "CPU Load", value: "32%", subValues: ["Cluster average"], status: "healthy", icon: Cpu, source: "System Health", urgency: "low", lastUpdate: "30 sec ago" },
  { id: "ram", label: "RAM Usage", value: "58%", subValues: ["128 GB pool"], status: "warning", icon: MemoryStick, source: "System Health", urgency: "medium", lastUpdate: "30 sec ago" },
  { id: "storage", label: "Storage Used", value: "38%", subValues: ["1.9 TB free"], status: "healthy", icon: HardDrive, source: "Server Mgmt", urgency: "low", lastUpdate: "25 min ago" },
  // LIVE ACTIVITY + APPROVALS
  { id: "live-activity", label: "Live Activity", value: "45", subValues: ["Events in last hour"], status: "action", icon: Zap, source: "Live Activity", urgency: "medium", lastUpdate: "just now" },
  { id: "approvals", label: "Pending Approvals", value: "6", subValues: ["3 role · 2 deploy · 1 legal"], status: "action", icon: FileCheck, source: "Approvals", urgency: "high", lastUpdate: "9 min ago" },
  { id: "role-approvals", label: "Role Approvals", value: "3", subValues: ["Awaiting boss sign-off"], status: "action", icon: BadgeCheck, source: "Approvals", urgency: "high", lastUpdate: "9 min ago" },
  { id: "deploy-approvals", label: "Deployment Requests", value: "2", subValues: ["Build #4521 queued"], status: "warning", icon: Rocket, source: "Approvals", urgency: "medium", lastUpdate: "5 min ago" },
  { id: "completed-today", label: "Completed Today", value: "12", subValues: ["Across all teams"], status: "healthy", icon: CheckCircle, source: "CEO Overview", urgency: "low", lastUpdate: "12 min ago" },
  // CEO OVERVIEW
  { id: "active-tasks", label: "Active Tasks", value: "24", subValues: ["CEO workstream"], status: "action", icon: Target, source: "CEO Overview", urgency: "medium", lastUpdate: "6 min ago" },
  { id: "performance", label: "Performance", value: "92%", subValues: ["On track"], status: "healthy", icon: Gauge, source: "CEO Overview", urgency: "low", lastUpdate: "1 hr ago" },
  // VALA AI
  { id: "ai-jobs", label: "AI Active Jobs", value: "12", subValues: ["Vala AI workers"], status: "action", icon: Brain, source: "Vala AI", urgency: "medium", lastUpdate: "just now" },
  { id: "ai-queue", label: "AI Queue Count", value: "45", subValues: ["Avg wait 42 sec"], status: "warning", icon: Bot, source: "Vala AI", urgency: "high", lastUpdate: "just now" },
  { id: "clone-status", label: "Clone Status", value: "Ready", subValues: ["Last clone 2 min ago"], status: "healthy", icon: Terminal, source: "Vala AI", urgency: "low", lastUpdate: "2 min ago" },
  { id: "deploy-status", label: "Deploy Status", value: "Ready", subValues: ["Pipeline green"], status: "healthy", icon: Rocket, source: "Vala AI", urgency: "low", lastUpdate: "4 min ago" },
  { id: "server-alerts", label: "Server Alerts", value: "0", subValues: ["Health excellent"], status: "healthy", icon: ShieldCheck, source: "Server Mgmt", urgency: "low", lastUpdate: "20 min ago" },
  // CONTINENT / COUNTRY
  { id: "continents", label: "Active Continents", value: "4", subValues: ["Top region: Asia"], status: "healthy", icon: Globe2, source: "Geo Control", urgency: "low", lastUpdate: "40 min ago" },
  { id: "risk", label: "Region Risk Level", value: "Low", subValues: ["No escalations"], status: "healthy", icon: Flag, source: "Geo Control", urgency: "low", lastUpdate: "40 min ago" },
  { id: "compliance", label: "Compliance", value: "100%", subValues: ["12 countries cleared"], status: "healthy", icon: BadgeCheck, source: "Legal", urgency: "low", lastUpdate: "1 day ago" },
  // FRANCHISE
  { id: "franchise-active", label: "Franchise Active", value: "22", subValues: ["2 onboarding"], status: "healthy", icon: Building2, source: "Franchise", urgency: "low", lastUpdate: "50 min ago" },
  { id: "revenue-share", label: "Revenue Share", value: "₹18.2L", subValues: ["+15% growth"], status: "healthy", icon: PiggyBank, source: "Franchise", urgency: "low", lastUpdate: "1 hr ago" },
  // SALES & SUPPORT
  { id: "tickets", label: "Open Tickets", value: "34", subValues: ["28 resolved today"], status: "warning", icon: Headphones, source: "Sales & Support", urgency: "medium", lastUpdate: "3 min ago" },
  { id: "today-revenue", label: "Today Revenue", value: "₹2.4L", subValues: ["SLA on track"], status: "healthy", icon: DollarSign, source: "Sales & Support", urgency: "low", lastUpdate: "7 min ago" },
  { id: "csat", label: "CSAT Score", value: "4.7/5", subValues: ["1,204 ratings"], status: "healthy", icon: Star, source: "Support", urgency: "low", lastUpdate: "15 min ago" },
  // PRODUCT
  { id: "products", label: "Total Products", value: "18", subValues: ["14 live · 4 in dev"], status: "healthy", icon: Box, source: "Product Mgr", urgency: "low", lastUpdate: "35 min ago" },
  { id: "update-requests", label: "Update Requests", value: "6", subValues: ["2 pending review"], status: "action", icon: UserPlus, source: "Product Mgr", urgency: "medium", lastUpdate: "22 min ago" },
  // DEMO / LIVE
  { id: "demos", label: "Active Demos", value: "8", subValues: ["5 scheduled"], status: "action", icon: Terminal, source: "Demo Manager", urgency: "medium", lastUpdate: "18 min ago" },
  { id: "conversion", label: "Demo Conversion", value: "42%", subValues: ["12 demo requests"], status: "healthy", icon: Percent, source: "Demo Manager", urgency: "low", lastUpdate: "18 min ago" },
  { id: "live-software", label: "Live Software", value: "14", subValues: ["All deployments stable"], status: "healthy", icon: Eye, source: "Demo Manager", urgency: "low", lastUpdate: "30 min ago" },
  // FINANCE
  { id: "wallet", label: "Wallet Balance", value: "₹8.5L", subValues: ["Payout processed"], status: "healthy", icon: Wallet, source: "Finance", urgency: "low", lastUpdate: "12 min ago" },
  { id: "inflow", label: "Monthly Inflow", value: "₹24.3L", subValues: ["+9% MoM"], status: "healthy", icon: TrendingUp, source: "Finance", urgency: "low", lastUpdate: "1 hr ago" },
  { id: "outflow", label: "Monthly Outflow", value: "₹12.1L", subValues: ["Within budget"], status: "warning", icon: TrendingDown, source: "Finance", urgency: "medium", lastUpdate: "1 hr ago" },
  { id: "net-profit", label: "Net Profit", value: "+₹12.2L", subValues: ["Margin 50.2%"], status: "healthy", icon: PiggyBank, source: "Finance", urgency: "low", lastUpdate: "1 hr ago" },
  // ALERTS
  { id: "alerts", label: "Alert Summary", value: "10", subValues: ["0 critical · 3 warning · 7 info"], status: "critical", icon: AlertTriangle, source: "Alerts", urgency: "critical", lastUpdate: "just now" },
];

function CockpitBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-primary/30 p-6 sm:p-8">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/60 to-accent/70" />
      <div className="absolute -left-16 -top-20 h-64 w-64 rounded-full bg-primary/60 blur-3xl" />
      <div className="absolute -right-10 bottom-[-6rem] h-72 w-72 rounded-full bg-accent/60 blur-3xl" />
      <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.35)_1px,transparent_0)] [background-size:22px_22px]" />

      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-background/25 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            Boss / Owner • Live Cockpit
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl">
            Master Control Panel
          </h1>
          <p className="mt-2 max-w-xl text-sm text-primary-foreground/80">
            Har module ek hi jagah — revenue, servers, Vala AI, franchise, finance aur alerts.
            40 unified KPI cards, ek 2 × 20 grid me.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { label: "Open Approvals", icon: FileCheck },
              { label: "Deploy Now", icon: Rocket },
              { label: "Ask Vala AI", icon: Brain },
            ].map((a) => (
              <button
                key={a.label}
                onClick={() => toast.info(`${a.label} — coming soon`)}
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-background/25 px-4 py-2 text-xs font-semibold text-primary-foreground backdrop-blur transition-colors hover:bg-background/40"
              >
                <a.icon className="h-3.5 w-3.5" />
                {a.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-3 gap-3">
          {[
            { k: "Revenue", v: "₹42.5L" },
            { k: "Uptime", v: "99.97%" },
            { k: "AI Jobs", v: "12" },
          ].map((s) => (
            <div
              key={s.k}
              className="rounded-2xl border border-primary-foreground/20 bg-background/25 px-4 py-3 text-center backdrop-blur"
            >
              <p className="text-[10px] uppercase tracking-wider text-primary-foreground/70">{s.k}</p>
              <p className="mt-1 whitespace-nowrap text-lg font-bold text-primary-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Index() {
  const [activeRole, setActiveRole] = useState<RoleId>("boss_owner");
  const [selectedKpi, setSelectedKpi] = useState<string | null>(null);

  return (
    <TooltipProvider>
      <div className="dark flex min-h-screen w-full" style={{ background: "#120b23" }}>
        <div className="w-[320px] flex-shrink-0">
          <ControlPanelSidebar
            activeRole={activeRole}
            onRoleSelect={(roleId) => {
              setActiveRole(roleId);
              toast.success(`Switched to ${roleId.replace(/_/g, " ")}`);
            }}
            onLogout={() => toast.info("Logging out...")}
          />
        </div>

        <main className="flex min-w-0 flex-1 flex-col gap-6 p-5">
          <CockpitBanner />

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground/70">
                Master KPI Grid — 2 × 20 (40 Cards)
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>
            <KPIGrid>
              {KPI_BOXES.map((kpi) => (
                <KPIBox
                  key={kpi.id}
                  {...kpi}
                  isSelected={selectedKpi === kpi.id}
                  onClick={() => setSelectedKpi(kpi.id === selectedKpi ? null : kpi.id)}
                />
              ))}
            </KPIGrid>
          </section>
        </main>

        <aside
          className="hidden w-[280px] flex-shrink-0 overflow-y-auto xl:block"
          style={{ background: "#1a1030", borderLeft: "1px solid #2c2048" }}
        >
          <div className="px-3 py-3" style={{ borderBottom: "1px solid #2c2048" }}>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Control Panel
            </h2>
          </div>
          <ControlPanelContent />
        </aside>
      </div>
      <Toaster />
    </TooltipProvider>
  );
}
