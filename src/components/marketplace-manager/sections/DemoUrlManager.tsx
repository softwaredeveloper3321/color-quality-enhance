// Marketplace Manager — Demo URL Center.
// Full CRUD + live health-check backed by product_demo_urls.
// Micro-level UX: search, multi-filter, sort, bulk actions, per-row pending,
// inline validation, credential reveal, CSV export, audit filtering.
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Plus, Save, Trash2, X, Loader2, Edit3, Copy, Play, ExternalLink,
  Power, PowerOff, ShieldCheck, ShieldAlert, Activity, Wifi, WifiOff, Gauge, History,
  Search as SearchIcon, Download, Eye, EyeOff, ArrowUpDown, RotateCw, KeyRound,
} from "lucide-react";
import {
  listDemoUrls, upsertDemoUrl, deleteDemoUrl, duplicateDemoUrl,
  toggleDemoUrl, testDemoUrl, testAllDemoUrls, listDemoAuditLog,
  type DemoUrl, type DemoAuditEntry,
} from "@/lib/marketplace-demo.functions";
import { listProductsAdmin } from "@/lib/marketplace.functions";

import { Card, PageHeader, PillButton } from "../ui";
import { BrandMark } from "../BrandMark";
import { Tilt3D } from "../Tilt3D";
import { ShotStudioButton, ShotStudioModal } from "../ShotStudio";

const EMPTY: Partial<DemoUrl> = {
  demo_name: "", role_name: "User", url: "", username: "", password: "",
  description: "", environment: "production", status: "active", sort_order: 0,
  product_id: null,
};

const ROLE_PRESETS = [
  "User","Admin","Super Admin","Teacher","Student","Parent","Vendor","Author",
  "Reseller","Franchise","Accountant","Manager","Employee","Support","Guest",
];

type SortKey = "sort_order" | "demo_name" | "role_name" | "environment" | "health" | "last_checked_at";

export function DemoUrlManagerSection() {
  const qc = useQueryClient();
  const listFn = useServerFn(listDemoUrls);
  const upsertFn = useServerFn(upsertDemoUrl);
  const deleteFn = useServerFn(deleteDemoUrl);
  const duplicateFn = useServerFn(duplicateDemoUrl);
  const toggleFn = useServerFn(toggleDemoUrl);
  const testFn = useServerFn(testDemoUrl);
  const testAllFn = useServerFn(testAllDemoUrls);
  const productsFn = useServerFn(listProductsAdmin);
  const auditFn = useServerFn(listDemoAuditLog);

  const { data: rows = [], isLoading, isFetching, refetch } = useQuery<DemoUrl[]>({
    queryKey: ["demo_urls"],
    queryFn: async () => (await listFn()) as unknown as DemoUrl[],
  });
  const { data: products = [] } = useQuery<{ id: string; name: string }[]>({
    queryKey: ["mp_products_admin_slim"],
    queryFn: async () => (await productsFn()) as unknown as { id: string; name: string }[],
  });
  const { data: audit = [], isLoading: auditLoading } = useQuery<DemoAuditEntry[]>({
    queryKey: ["demo_audit_log"],
    queryFn: async () => (await auditFn({ data: { limit: 100 } })) as unknown as DemoAuditEntry[],
  });

  const [editing, setEditing] = useState<Partial<DemoUrl> | null>(null);
  const [filter, setFilter] = useState<"all" | "working" | "slow" | "offline" | "untested" | "inactive">("all");
  const [envFilter, setEnvFilter] = useState<"all" | DemoUrl["environment"]>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("sort_order");
  const [sortAsc, setSortAsc] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [busyIds, setBusyIds] = useState<string[]>([]);
  const [auditAction, setAuditAction] = useState<string>("all");

  const mark = (id: string, on: boolean) =>
    setBusyIds((p) => (on ? [...new Set([...p, id])] : p.filter((x) => x !== id)));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["demo_urls"] });
    qc.invalidateQueries({ queryKey: ["demo_audit_log"] });
  };

  const upsertMut = useMutation({
    mutationFn: (v: Partial<DemoUrl>) => upsertFn({ data: v as any }),
    onSuccess: () => { invalidate(); toast.success("Demo saved"); setEditing(null); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: async (id: string) => { mark(id, true); try { return await deleteFn({ data: { id } }); } finally { mark(id, false); } },
    onSuccess: (_d, id) => { invalidate(); setSelected((p) => p.filter((x) => x !== id)); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const dupMut = useMutation({
    mutationFn: async (id: string) => { mark(id, true); try { return await duplicateFn({ data: { id } }); } finally { mark(id, false); } },
    onSuccess: () => { invalidate(); toast.success("Duplicated"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const toggleMut = useMutation({
    mutationFn: async (v: { id: string; status: "active" | "inactive" }) => {
      mark(v.id, true); try { return await toggleFn({ data: v }); } finally { mark(v.id, false); }
    },
    onSuccess: (_d, v) => { invalidate(); toast.success(v.status === "active" ? "Enabled" : "Disabled"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const testMut = useMutation({
    mutationFn: async (id: string) => { mark(id, true); try { return await testFn({ data: { id } }); } finally { mark(id, false); } },
    onSuccess: (r: any) => {
      invalidate();
      const res = r?.last_result ?? "unknown";
      if (res === "working") toast.success(`Working · ${r?.last_response_ms ?? "—"} ms`);
      else if (res === "slow") toast.warning(`Slow · ${r?.last_response_ms ?? "—"} ms`);
      else toast.error(`Offline · HTTP ${r?.last_http_status ?? 0}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const testAllMut = useMutation({
    mutationFn: async () => testAllFn(),
    onSuccess: (r: any) => { invalidate(); toast.success(`Checked ${Array.isArray(r) ? r.length : 0} demos`); },
    onError: (e: Error) => toast.error(e.message),
  });

  /* ---------- bulk ---------- */
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);
  const [bulkBusy, setBulkBusy] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState({ done: 0, total: 0 });

  async function execBulk(kind: "test" | "enable" | "disable" | "delete") {
    const ids = [...selected];
    setBulkBusy(kind);
    setBulkProgress({ done: 0, total: ids.length });
    let ok = 0, fail = 0;
    for (const id of ids) {
      mark(id, true);
      try {
        if (kind === "test") await testFn({ data: { id } });
        if (kind === "enable") await toggleFn({ data: { id, status: "active" } });
        if (kind === "disable") await toggleFn({ data: { id, status: "inactive" } });
        if (kind === "delete") await deleteFn({ data: { id } });
        ok++;
      } catch { fail++; }
      finally { mark(id, false); }
      setBulkProgress((p) => ({ ...p, done: p.done + 1 }));
    }
    setBulkBusy(null);
    setBulkProgress({ done: 0, total: 0 });
    invalidate();
    if (kind === "delete") setSelected([]);
    fail ? toast.warning(`${ok} done · ${fail} failed`) : toast.success(`${ok} demo(s) ${kind}d`);
  }

  function runBulk(kind: "test" | "enable" | "disable" | "delete") {
    if (selected.length === 0) return;
    const labels: Record<string, string> = { test: "Test", enable: "Enable", disable: "Disable", delete: "Delete" };
    setConfirmState({
      title: `${labels[kind]} ${selected.length} demo URL${selected.length > 1 ? "s" : ""}?`,
      body: kind === "delete"
        ? "This permanently removes the selected demo URLs and cannot be undone."
        : `This will ${kind} every selected demo URL and log each action in the audit trail.`,
      confirmLabel: labels[kind] ?? "Confirm",
      danger: kind === "delete",
      onConfirm: () => { void execBulk(kind); },
    });
  }


  const stats = useMemo(() => {
    const t = rows.length;
    const active = rows.filter((r) => r.status === "active").length;
    const working = rows.filter((r) => r.last_result === "working").length;
    const slow = rows.filter((r) => r.last_result === "slow").length;
    const offline = rows.filter((r) => r.last_result === "offline").length;
    const ssl = rows.filter((r) => r.ssl_valid === true).length;
    const tested = rows.filter((r) => r.last_result && r.last_result !== "unknown").length;
    const avgMs = (() => {
      const v = rows.map((r) => r.last_response_ms).filter((n): n is number => typeof n === "number");
      return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
    })();
    const health = tested ? Math.round(((working + slow) / tested) * 100) : null;
    const lastChecked = rows
      .map((r) => (r.last_checked_at ? new Date(r.last_checked_at).getTime() : 0))
      .reduce((a, b) => Math.max(a, b), 0);
    return { t, active, working, slow, offline, ssl, avgMs, health, lastChecked };
  }, [rows]);

  const roles = useMemo(
    () => [...new Set(rows.map((r) => r.role_name).filter(Boolean))].sort(),
    [rows],
  );
  const productName = (id: string | null) =>
    id ? products.find((p) => p.id === id)?.name ?? "—" : "—";

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const healthOf = (r: DemoUrl) =>
      r.status === "inactive" ? "inactive" : (r.last_result === "unknown" || !r.last_result ? "untested" : r.last_result);
    let list = rows.filter((r) => {
      if (filter !== "all" && healthOf(r) !== filter) return false;
      if (envFilter !== "all" && r.environment !== envFilter) return false;
      if (roleFilter !== "all" && r.role_name !== roleFilter) return false;
      if (productFilter !== "all" && (r.product_id ?? "none") !== productFilter) return false;
      if (needle) {
        const hay = [r.demo_name, r.role_name, r.url, r.username, r.description, productName(r.product_id)]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
    const order = { working: 0, slow: 1, untested: 2, offline: 3, inactive: 4 } as Record<string, number>;
    list = [...list].sort((a, b) => {
      let d = 0;
      if (sortKey === "health") d = (order[healthOf(a)] ?? 9) - (order[healthOf(b)] ?? 9);
      else if (sortKey === "sort_order") d = a.sort_order - b.sort_order;
      else if (sortKey === "last_checked_at")
        d = new Date(a.last_checked_at ?? 0).getTime() - new Date(b.last_checked_at ?? 0).getTime();
      else d = String(a[sortKey] ?? "").localeCompare(String(b[sortKey] ?? ""));
      return sortAsc ? d : -d;
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, filter, envFilter, roleFilter, productFilter, sortKey, sortAsc, products]);

  const allVisibleSelected = filtered.length > 0 && filtered.every((r) => selected.includes(r.id));
  const toggleSelectAll = () =>
    setSelected(allVisibleSelected ? [] : filtered.map((r) => r.id));

  const clearFilters = () => {
    setQ(""); setFilter("all"); setEnvFilter("all"); setRoleFilter("all"); setProductFilter("all");
  };
  const filtersActive = q !== "" || filter !== "all" || envFilter !== "all" || roleFilter !== "all" || productFilter !== "all";

  function exportCsv() {
    const cols = ["demo_name","role_name","product","environment","url","username","status","last_result","last_response_ms","last_http_status","ssl_valid","last_checked_at"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = filtered.map((r) => [
      r.demo_name, r.role_name, productName(r.product_id), r.environment, r.url, r.username,
      r.status, r.last_result, r.last_response_ms, r.last_http_status, r.ssl_valid, r.last_checked_at,
    ].map(esc).join(","));
    const blob = new Blob([[cols.join(","), ...body].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `demo-urls-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast.success(`Exported ${filtered.length} row(s)`);
  }

  const [shotOpen, setShotOpen] = useState(false);

  const auditActions = useMemo(
    () => [...new Set(audit.map((a) => a.action))].sort(),
    [audit],
  );
  const auditRows = useMemo(
    () => (auditAction === "all" ? audit : audit.filter((a) => a.action === auditAction)),
    [audit, auditAction],
  );

  return (
    <div className="px-4 py-8 md:px-8">
      <PageHeader
        eyebrow="Product Demos · Live Health"
        title="Demo URL Manager"
        description="Manage unlimited role-based demo environments per product. Test URLs live, track uptime, response time and SSL status."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              <BrandMark size={20} glow={false} /> Software Vala
            </span>
            <PillButton variant="ghost" onClick={() => refetch()}>
              <span className="inline-flex items-center gap-1.5">
                <RotateCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} /> Refresh
              </span>
            </PillButton>
            <PillButton variant="ghost" onClick={exportCsv}>
              <span className="inline-flex items-center gap-1.5"><Download className="h-3.5 w-3.5" /> Export CSV</span>
            </PillButton>
            <PillButton variant="ghost" onClick={() => testAllMut.mutate()}>
              <span className="inline-flex items-center gap-1.5">
                {testAllMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Activity className="h-3.5 w-3.5"/>}
                Test All
              </span>
            </PillButton>
            <ShotStudioButton onClick={() => setShotOpen(true)} label="4K Report Shot" />
            <PillButton variant="primary" onClick={() => setEditing({ ...EMPTY })}>
              <span className="inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> New Demo URL</span>
            </PillButton>
          </div>
        }
      />

      {/* Dashboard */}
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-9">
        <Stat label="Total" value={stats.t} />
        <Stat label="Active" value={stats.active} tone="accent" />
        <Stat label="Working" value={stats.working} tone="success" icon={<Wifi className="h-3.5 w-3.5"/>} />
        <Stat label="Slow" value={stats.slow} tone="warning" icon={<Gauge className="h-3.5 w-3.5"/>} />
        <Stat label="Offline" value={stats.offline} tone="danger" icon={<WifiOff className="h-3.5 w-3.5"/>} />
        <Stat label="SSL Valid" value={stats.ssl} tone="success" icon={<ShieldCheck className="h-3.5 w-3.5"/>} />
        <Stat label="Health" value={stats.health == null ? "—" : `${stats.health}%`}
          tone={stats.health == null ? undefined : stats.health >= 90 ? "success" : stats.health >= 60 ? "warning" : "danger"} />
        <Stat label="Avg Response" value={stats.avgMs == null ? "—" : `${stats.avgMs} ms`} />
        <Stat label="Last Check" value={stats.lastChecked ? new Date(stats.lastChecked).toLocaleTimeString() : "—"} />
      </div>

      {/* Toolbar: search + filters */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search demo, role, URL, product, username…"
            className="w-full rounded-full border border-border bg-background/40 py-2 pl-9 pr-8 text-sm outline-none focus:border-accent"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <select className={sel} value={envFilter} onChange={(e) => setEnvFilter(e.target.value as any)}>
          <option value="all">All environments</option>
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="testing">Testing</option>
        </select>
        <select className={sel} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All roles</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select className={sel} value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
          <option value="all">All products</option>
          <option value="none">Unassigned</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className={sel} value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)}>
          <option value="sort_order">Sort: Order</option>
          <option value="demo_name">Sort: Name</option>
          <option value="role_name">Sort: Role</option>
          <option value="environment">Sort: Environment</option>
          <option value="health">Sort: Health</option>
          <option value="last_checked_at">Sort: Last check</option>
        </select>
        <button onClick={() => setSortAsc((s) => !s)} title={sortAsc ? "Ascending" : "Descending"}
          className="rounded-full border border-border bg-background/40 p-2 text-muted-foreground hover:text-foreground">
          <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
        {filtersActive && (
          <button onClick={clearFilters} className="rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
            Clear filters
          </button>
        )}
      </div>

      {/* Health chips */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {(["all","working","slow","offline","untested","inactive"] as const).map((k) => {
          const count =
            k === "all" ? rows.length :
            k === "inactive" ? rows.filter((r) => r.status === "inactive").length :
            k === "untested" ? rows.filter((r) => r.status === "active" && (!r.last_result || r.last_result === "unknown")).length :
            rows.filter((r) => r.status === "active" && r.last_result === k).length;
          return (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                filter === k ? "bg-accent text-accent-foreground" : "bg-background/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {k} <span className="opacity-70">({count})</span>
            </button>
          );
        })}
        <span className="ml-auto text-[11px] text-muted-foreground">
          Showing {filtered.length} of {rows.length}
        </span>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-3 py-2 text-xs">
          <span className="font-semibold">{selected.length} selected</span>
          <BulkBtn onClick={() => runBulk("test")} busy={bulkBusy === "test"} icon={<Play className="h-3 w-3"/>}>Test</BulkBtn>
          <BulkBtn onClick={() => runBulk("enable")} busy={bulkBusy === "enable"} icon={<Power className="h-3 w-3"/>}>Enable</BulkBtn>
          <BulkBtn onClick={() => runBulk("disable")} busy={bulkBusy === "disable"} icon={<PowerOff className="h-3 w-3"/>}>Disable</BulkBtn>
          <BulkBtn onClick={() => runBulk("delete")} busy={bulkBusy === "delete"} danger icon={<Trash2 className="h-3 w-3"/>}>Delete</BulkBtn>
          {bulkBusy && bulkProgress.total > 0 && (
            <span className="inline-flex items-center gap-2 text-[11px] text-muted-foreground" role="status" aria-live="polite">
              <span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.round((bulkProgress.done / bulkProgress.total) * 100)}%` }} />
              </span>
              {bulkProgress.done}/{bulkProgress.total}
            </span>
          )}
          <button onClick={() => setSelected([])} disabled={!!bulkBusy} className="ml-auto text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-40">Clear selection</button>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-xl border border-border bg-white/[0.03]" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent/15 text-accent"><KeyRound className="h-5 w-5"/></div>
            <div className="text-sm font-semibold">
              {rows.length === 0 ? "No demo URLs yet" : "No demos match your filters"}
            </div>
            <div className="max-w-md text-xs text-muted-foreground">
              {rows.length === 0
                ? "Add your first demo — unlimited role-based environments and credentials per product, with live health checks."
                : "Try a different search term or clear the active filters."}
            </div>
            {rows.length === 0 ? (
              <PillButton variant="primary" onClick={() => setEditing({ ...EMPTY })}>
                <span className="inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> New Demo URL</span>
              </PillButton>
            ) : (
              <PillButton variant="ghost" onClick={clearFilters}>Clear filters</PillButton>
            )}
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.03] text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <Th>
                  <input type="checkbox" aria-label="Select all" checked={allVisibleSelected} onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 accent-[var(--accent)]" />
                </Th>
                <Th>Demo</Th><Th>Role</Th><Th>Product</Th><Th>Env</Th><Th>URL</Th>
                <Th>Creds</Th><Th>Health</Th><Th>Last Check</Th><Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const busy = busyIds.includes(r.id);
                const show = revealed.includes(r.id);
                return (
                <tr key={r.id} className={`border-t border-border/60 align-middle transition-colors hover:bg-white/[0.03] ${busy ? "opacity-60" : ""} ${selected.includes(r.id) ? "bg-accent/5" : ""}`}>
                  <Td>
                    <input type="checkbox" aria-label={`Select ${r.demo_name}`} checked={selected.includes(r.id)}
                      onChange={(e) => setSelected((p) => e.target.checked ? [...p, r.id] : p.filter((x) => x !== r.id))}
                      className="h-3.5 w-3.5 accent-[var(--accent)]" />
                  </Td>
                  <Td className="font-medium">
                    <div className="flex items-center gap-2">
                      {r.demo_name}
                      {r.status === "inactive" && <Badge tone="muted">off</Badge>}
                    </div>
                    {r.description && <div className="max-w-[220px] truncate text-[11px] text-muted-foreground" title={r.description}>{r.description}</div>}
                  </Td>
                  <Td>{r.role_name}</Td>
                  <Td className="text-muted-foreground">{productName(r.product_id)}</Td>
                  <Td><EnvChip env={r.environment} /></Td>
                  <Td>
                    <div className="flex max-w-[280px] items-center gap-1">
                      <span className="truncate text-muted-foreground" title={r.url}>{r.url}</span>
                      <IconBtn label="Copy URL" onClick={() => copy(r.url, "URL copied")}><Copy className="h-3 w-3"/></IconBtn>
                      <IconBtn label="Open" onClick={() => window.open(r.url, "_blank", "noopener,noreferrer")}><ExternalLink className="h-3 w-3"/></IconBtn>
                    </div>
                  </Td>
                  <Td>
                    <div className="flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="max-w-[140px] truncate">{r.username || "—"}</span>
                        {r.username && <IconBtn label="Copy user" onClick={() => copy(r.username!, "Username copied")}><Copy className="h-3 w-3"/></IconBtn>}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="max-w-[140px] truncate font-mono">{r.password ? (show ? r.password : "••••••••") : "—"}</span>
                        {r.password && (
                          <IconBtn label={show ? "Hide password" : "Reveal password"}
                            onClick={() => setRevealed((p) => show ? p.filter((x) => x !== r.id) : [...p, r.id])}>
                            {show ? <EyeOff className="h-3 w-3"/> : <Eye className="h-3 w-3"/>}
                          </IconBtn>
                        )}
                        {r.password && <IconBtn label="Copy pass" onClick={() => copy(r.password!, "Password copied")}><Copy className="h-3 w-3"/></IconBtn>}
                      </div>
                      {(r.username || r.password) && (
                        <button
                          onClick={() => copy(`${r.url}\n${r.username ?? ""} / ${r.password ?? ""}`, "Credentials copied")}
                          className="mt-0.5 text-left text-[10px] uppercase tracking-wider text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                          Copy all
                        </button>
                      )}
                    </div>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-1">
                      <HealthChip r={r} />
                      {r.ssl_valid === true && <span title="SSL valid"><ShieldCheck className="h-3.5 w-3.5 text-emerald-300"/></span>}
                      {r.ssl_valid === false && <span title="SSL problem"><ShieldAlert className="h-3.5 w-3.5 text-rose-300"/></span>}
                    </div>
                  </Td>
                  <Td className="text-[11px] text-muted-foreground">
                    {r.last_checked_at ? new Date(r.last_checked_at).toLocaleString() : "—"}
                    {r.last_response_ms != null && <div>{r.last_response_ms} ms · HTTP {r.last_http_status ?? "—"}</div>}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1">
                      <IconBtn label="Test now" disabled={busy} onClick={() => testMut.mutate(r.id)}>
                        {busy ? <Loader2 className="h-3 w-3 animate-spin"/> : <Play className="h-3 w-3"/>}
                      </IconBtn>
                      <IconBtn label={r.status === "active" ? "Disable" : "Enable"} disabled={busy}
                        onClick={() => toggleMut.mutate({ id: r.id, status: r.status === "active" ? "inactive" : "active" })}>
                        {r.status === "active" ? <Power className="h-3 w-3 text-emerald-400"/> : <PowerOff className="h-3 w-3 text-muted-foreground"/>}
                      </IconBtn>
                      <IconBtn label="Edit" disabled={busy} onClick={() => setEditing(r)}><Edit3 className="h-3 w-3"/></IconBtn>
                      <IconBtn label="Duplicate" disabled={busy} onClick={() => dupMut.mutate(r.id)}><Copy className="h-3 w-3"/></IconBtn>
                      <IconBtn label="Delete" disabled={busy} danger
                        onClick={() => setConfirmState({
                          title: `Delete "${r.demo_name}"?`,
                          body: "This permanently removes the demo URL and its credentials. The action is recorded in the audit log.",
                          confirmLabel: "Delete",
                          danger: true,
                          onConfirm: () => delMut.mutate(r.id),
                        })}>
                        <Trash2 className="h-3 w-3"/>
                      </IconBtn>
                    </div>
                  </Td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 text-sm font-semibold">
              <History className="h-4 w-4" /> Audit Log
              <span className="text-[11px] font-normal text-muted-foreground">
                (showing {auditRows.length} of {audit.length})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select className={sel} value={auditAction} onChange={(e) => setAuditAction(e.target.value)}>
                <option value="all">All actions</option>
                {auditActions.map((a) => <option key={a} value={a}>{a.replace("demo_url.", "")}</option>)}
              </select>
              <button
                onClick={() => qc.invalidateQueries({ queryKey: ["demo_audit_log"] })}
                className="text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              >
                Refresh
              </button>
            </div>
          </div>
          {auditLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading…</div>
          ) : auditRows.length === 0 ? (
            <div className="text-sm text-muted-foreground">No audit entries yet. Actions on demo URLs will appear here.</div>
          ) : (
            <div className="max-h-[420px] overflow-y-auto overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-[12px]">
                <thead className="sticky top-0 bg-white/[0.04] text-[10px] uppercase tracking-wider text-muted-foreground">
                  <tr><Th>When</Th><Th>Actor</Th><Th>Action</Th><Th>Demo</Th><Th>Details</Th></tr>
                </thead>
                <tbody>
                  {auditRows.map((a) => {
                    const demoName = a.demo_url_id
                      ? rows.find((r) => r.id === a.demo_url_id)?.demo_name ?? a.demo_url_id.slice(0, 8)
                      : "—";
                    const meta = a.metadata && typeof a.metadata === "object" ? a.metadata : {};
                    return (
                      <tr key={a.id} className="border-t border-border/60 align-top hover:bg-white/[0.03]">
                        <Td className="whitespace-nowrap text-muted-foreground">{new Date(a.created_at).toLocaleString()}</Td>
                        <Td className="text-muted-foreground">{a.actor_email ?? a.actor_id?.slice(0, 8) ?? "system"}</Td>
                        <Td><span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">{a.action.replace("demo_url.", "")}</span></Td>
                        <Td className="font-medium">{demoName}</Td>
                        <Td className="max-w-[380px] truncate text-muted-foreground">
                          <span title={JSON.stringify(meta)}>
                            {Object.entries(meta as Record<string, unknown>)
                              .filter(([k]) => k !== "actor" && k !== "ts")
                              .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                              .join(" · ") || "—"}
                          </span>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
      <ShotStudioModal
        open={shotOpen}
        onClose={() => setShotOpen(false)}
        title="Demo Health 4K Report"
        subtitle={`${stats.t} demo environment(s) · health ${stats.health == null ? "—" : stats.health + "%"}`}
        fileName="demo-health-report"
      >
        {(dev) => (
          <div className="bg-[oklch(0.12_0.03_262)] p-8" style={{ width: dev.width }}>
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">
                  Software Vala · Demo URL Manager
                </p>
                <p className="mt-1 text-2xl font-bold text-white">Live Demo Health Report</p>
              </div>
              <p className="text-[11px] text-white/60">{new Date().toLocaleString()}</p>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-3">
              {([
                ["Total", String(stats.t)],
                ["Active", String(stats.active)],
                ["Working", String(stats.working)],
                ["Slow", String(stats.slow)],
                ["Offline", String(stats.offline)],
                ["SSL Valid", String(stats.ssl)],
                ["Health", stats.health == null ? "—" : `${stats.health}%`],
                ["Avg Response", stats.avgMs == null ? "—" : `${stats.avgMs} ms`],
                ["Last Check", stats.lastChecked ? new Date(stats.lastChecked).toLocaleTimeString() : "—"],
              ] as const).map(([l, v]) => (
                <div key={l} className="rounded-xl border border-white/12 bg-white/[0.06] p-4">
                  <p className="text-[10px] uppercase tracking-wider text-white/55">{l}</p>
                  <p className="mt-1 text-xl font-bold text-white">{v}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-xl border border-white/12">
              <table className="w-full text-left text-[12px] text-white/85">
                <thead className="bg-white/[0.07] text-[10px] uppercase tracking-wider text-white/55">
                  <tr>
                    <th className="px-3 py-2">Demo</th>
                    <th className="px-3 py-2">Environment</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Health</th>
                    <th className="px-3 py-2">Response</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 18).map((r) => (
                    <tr key={r.id} className="border-t border-white/8">
                      <td className="px-3 py-2">
                        <span className="font-semibold text-white">{r.demo_name || r.url}</span>
                        <span className="ml-2 text-white/45">{r.url}</span>
                      </td>
                      <td className="px-3 py-2 capitalize">{r.environment}</td>
                      <td className="px-3 py-2 capitalize">{r.status}</td>
                      <td className="px-3 py-2 capitalize">{r.last_result ?? "untested"}</td>
                      <td className="px-3 py-2">{r.last_response_ms == null ? "—" : `${r.last_response_ms} ms`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </ShotStudioModal>


      {editing && (
        <DemoEditor
          value={editing}
          products={products}
          onCancel={() => setEditing(null)}
          onSave={(v) => upsertMut.mutate(v)}
          saving={upsertMut.isPending}
        />
      )}

      <ConfirmDialog state={confirmState} onClose={() => setConfirmState(null)} />
    </div>

  );
}

function DemoEditor({
  value, products, onCancel, onSave, saving,
}: {
  value: Partial<DemoUrl>;
  products: { id: string; name: string }[];
  onCancel: () => void;
  onSave: (v: Partial<DemoUrl>) => void;
  saving: boolean;
}) {
  const [v, setV] = useState<Partial<DemoUrl>>(value);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPw, setShowPw] = useState(false);
  const set = <K extends keyof DemoUrl>(k: K, val: DemoUrl[K]) => setV((p) => ({ ...p, [k]: val }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  const errors: Record<string, string> = {};
  if (!v.demo_name?.trim()) errors.demo_name = "Demo name is required";
  if (!v.role_name?.trim()) errors.role_name = "Role is required";
  if (!v.url?.trim()) errors.url = "URL is required";
  else {
    try {
      const u = new URL(v.url);
      if (!/^https?:$/.test(u.protocol)) errors.url = "URL must start with http:// or https://";
    } catch { errors.url = "Enter a valid URL (https://…)"; }
  }
  const valid = Object.keys(errors).length === 0;

  const submit = () => {
    setTouched({ demo_name: true, role_name: true, url: true });
    if (!valid) { toast.error(Object.values(errors)[0]); return; }
    onSave(v);
  };

  const err = (k: string) => (touched[k] ? errors[k] : undefined);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border border-border bg-[color:var(--surface)] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">{v.id ? "Edit Demo URL" : "New Demo URL"}</h3>
            <p className="text-[11px] text-muted-foreground">Press Esc to close · ⌘/Ctrl + Enter to save</p>
          </div>
          <button onClick={onCancel} aria-label="Close"><X className="h-4 w-4"/></button>
        </div>
        <div
          className="grid gap-3 sm:grid-cols-2"
          onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit(); }}
        >
          <Field label="Demo name" error={err("demo_name")}>
            <input className={inp} value={v.demo_name ?? ""} autoFocus
              onBlur={() => setTouched((t) => ({ ...t, demo_name: true }))}
              onChange={(e) => set("demo_name", e.target.value)} placeholder="Admin Demo"/>
          </Field>
          <Field label="Role name" error={err("role_name")}>
            <input list="role-presets" className={inp} value={v.role_name ?? ""}
              onBlur={() => setTouched((t) => ({ ...t, role_name: true }))}
              onChange={(e) => set("role_name", e.target.value)} placeholder="Admin / Teacher / Vendor…"/>
            <datalist id="role-presets">
              {ROLE_PRESETS.map((r) => <option key={r} value={r} />)}
            </datalist>
          </Field>
          <Field label="Product">
            <select className={inp} value={v.product_id ?? ""} onChange={(e) => set("product_id", (e.target.value || null) as any)}>
              <option value="">— Unassigned —</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Environment">
            <select className={inp} value={v.environment ?? "production"} onChange={(e) => set("environment", e.target.value as any)}>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="testing">Testing</option>
            </select>
          </Field>
          <Field label="URL" full error={err("url")} hint="Must be reachable over http(s) for health checks">
            <div className="flex gap-2">
              <input className={inp} value={v.url ?? ""}
                onBlur={() => setTouched((t) => ({ ...t, url: true }))}
                onChange={(e) => set("url", e.target.value)} placeholder="https://demo.example.com"/>
              <button type="button" title="Open URL" disabled={!!errors.url}
                onClick={() => window.open(v.url!, "_blank", "noopener,noreferrer")}
                className="shrink-0 rounded-lg border border-border px-3 text-muted-foreground hover:text-foreground disabled:opacity-40">
                <ExternalLink className="h-3.5 w-3.5"/>
              </button>
            </div>
          </Field>
          <Field label="Username / Email"><input className={inp} value={v.username ?? ""} onChange={(e) => set("username", e.target.value)} /></Field>
          <Field label="Password">
            <div className="flex gap-2">
              <input className={inp} type={showPw ? "text" : "password"} value={v.password ?? ""} onChange={(e) => set("password", e.target.value)} />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? "Hide" : "Show"}
                className="shrink-0 rounded-lg border border-border px-3 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-3.5 w-3.5"/> : <Eye className="h-3.5 w-3.5"/>}
              </button>
            </div>
          </Field>
          <Field label="Description" full>
            <textarea rows={2} className={inp} maxLength={2000} value={v.description ?? ""} onChange={(e) => set("description", e.target.value)} />
            <div className="mt-1 text-right text-[10px] text-muted-foreground">{(v.description ?? "").length}/2000</div>
          </Field>
          <Field label="Status">
            <select className={inp} value={v.status ?? "active"} onChange={(e) => set("status", e.target.value as any)}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Sort order"><input type="number" className={inp} value={v.sort_order ?? 0} onChange={(e) => set("sort_order", Number(e.target.value))} /></Field>
        </div>
        <div className="mt-6 flex items-center justify-end gap-2">
          {!valid && <span className="mr-auto text-[11px] text-rose-300">Fix required fields to save</span>}
          <PillButton variant="ghost" onClick={onCancel}>Cancel</PillButton>
          <PillButton variant="primary" onClick={submit}>
            <span className="inline-flex items-center gap-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Save className="h-3.5 w-3.5"/>} Save
            </span>
          </PillButton>
        </div>
      </div>
    </div>
  );
}

/* ---------- bits ---------- */
const inp = "w-full rounded-lg border border-border bg-background/40 px-3 py-2 text-sm outline-none focus:border-accent";
const sel = "rounded-full border border-border bg-background/40 px-3 py-2 text-xs outline-none focus:border-accent";

function Field({ label, children, full, hint, error }: { label: string; children: ReactNode; full?: boolean; hint?: string; error?: string }) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      {children}
      {error ? (
        <div className="mt-1 text-[10px] font-semibold text-rose-300">{error}</div>
      ) : hint ? (
        <div className="mt-1 text-[10px] text-muted-foreground">{hint}</div>
      ) : null}
    </label>
  );
}
function Th({ children }: { children: ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2 text-left font-semibold">{children}</th>;
}
function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--background)]";
function IconBtn({ children, onClick, label, disabled, danger }: { children: ReactNode; onClick: () => void; label: string; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled}
      className={`rounded border border-border p-1 text-muted-foreground transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS} ${
        danger ? "hover:border-rose-400/50 hover:text-rose-300" : "hover:text-foreground"
      }`}>
      {children}
    </button>
  );
}
function BulkBtn({ children, onClick, busy, icon, danger }: { children: ReactNode; onClick: () => void; busy?: boolean; icon?: ReactNode; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={busy}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold disabled:opacity-50 ${FOCUS} ${
        danger ? "border-rose-400/40 text-rose-300 hover:bg-rose-500/10" : "border-border text-foreground hover:bg-white/[0.06]"
      }`}>
      {busy ? <Loader2 className="h-3 w-3 animate-spin"/> : icon}{children}
    </button>
  );
}

/* ---------- Confirmation modal ---------- */
export type ConfirmState = {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
} | null;

function ConfirmDialog({ state, onClose }: { state: ConfirmState; onClose: () => void }) {
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter") { state.onConfirm(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state, onClose]);
  if (!state) return null;
  return (
    <div className="fixed inset-0 z-[120] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-label={state.title} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-[color:var(--surface)] p-5 shadow-2xl">
        <h3 className="text-sm font-semibold text-foreground">{state.title}</h3>
        <p className="mt-1.5 text-xs text-muted-foreground">{state.body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className={`rounded-full border border-border px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground ${FOCUS}`}>
            Cancel
          </button>
          <button type="button" autoFocus onClick={() => { state.onConfirm(); onClose(); }}
            className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${FOCUS} ${
              state.danger ? "bg-rose-500/20 text-rose-200 hover:bg-rose-500/30" : "bg-accent/20 text-accent hover:bg-accent/30"
            }`}>
            {state.confirmLabel}
          </button>
        </div>
        <p className="mt-3 text-[10px] text-muted-foreground">Enter to confirm · Esc to cancel</p>
      </div>
    </div>
  );
}
function Stat({ label, value, tone, icon }: { label: string; value: number | string; tone?: "success"|"warning"|"danger"|"accent"; icon?: ReactNode }) {
  const color =
    tone === "success" ? "text-emerald-300" :
    tone === "warning" ? "text-amber-300" :
    tone === "danger"  ? "text-rose-300" :
    tone === "accent"  ? "text-accent" : "text-foreground";
  return (
    <Tilt3D max={9}>
      <div className="glass rounded-xl p-3">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {icon}{label}
        </div>
        <div className={`mt-1 text-xl font-bold ${color}`}>{value}</div>
      </div>
    </Tilt3D>
  );
}
function EnvChip({ env }: { env: DemoUrl["environment"] }) {
  const map = {
    production: "bg-emerald-500/15 text-emerald-300",
    staging: "bg-amber-500/15 text-amber-300",
    testing: "bg-sky-500/15 text-sky-300",
  } as const;
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${map[env] ?? "bg-muted/40 text-muted-foreground"}`}>{env}</span>;
}
function HealthChip({ r }: { r: DemoUrl }) {
  if (r.status === "inactive") return <Badge tone="muted">Disabled</Badge>;
  if (r.last_result === "working") return <Badge tone="success">✅ Working</Badge>;
  if (r.last_result === "slow") return <Badge tone="warning">⚠ Slow</Badge>;
  if (r.last_result === "offline") return <Badge tone="danger">❌ Offline</Badge>;
  return <Badge tone="muted">Untested</Badge>;
}
function Badge({ tone, children }: { tone: "success"|"warning"|"danger"|"muted"; children: ReactNode }) {
  const map = {
    success: "bg-emerald-500/15 text-emerald-300",
    warning: "bg-amber-500/15 text-amber-300",
    danger:  "bg-rose-500/15 text-rose-300",
    muted:   "bg-muted/40 text-muted-foreground",
  } as const;
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${map[tone]}`}>{children}</span>;
}
async function copy(text: string, msg: string) {
  try { await navigator.clipboard.writeText(text); toast.success(msg); }
  catch { toast.error("Copy failed"); }
}
