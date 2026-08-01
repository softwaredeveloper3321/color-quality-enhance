import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Activity,
  CheckSquare,
  Copy,
  CopyPlus,
  ExternalLink,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  Pencil,
  Plus,
  Power,
  PowerOff,
  RefreshCw,
  ShieldCheck,
  Square,
  Trash2,
  Upload,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { checkDemoUrl } from "@/lib/demo-check.functions";
import {
  addDemo,
  addProduct,
  deleteDemo,
  deleteMany,
  duplicateDemo,
  importDemos,
  parseImportText,
  setActiveMany,
  toggleDemo,
  updateDemo,
  useDemoState,
  type DemoDraft,
  type DemoEnvironment,
  type DemoUrl,
} from "./demoUrlStore";


const ROLE_PRESETS = [
  "User", "Admin", "Super Admin", "Teacher", "Student", "Parent", "Vendor",
  "Author", "Reseller", "Franchise", "Accountant", "Manager", "Employee",
];

const HEALTH_STYLE: Record<DemoUrl["health"], { label: string; cls: string }> = {
  working: { label: "✅ Working", cls: "border-emerald-400/40 bg-emerald-400/12 text-emerald-300" },
  slow: { label: "⚠ Slow", cls: "border-amber-400/40 bg-amber-400/12 text-amber-300" },
  offline: { label: "❌ Offline", cls: "border-red-400/40 bg-red-400/12 text-red-300" },
  unknown: { label: "• Not checked", cls: "border-white/15 bg-white/5 text-foreground/55" },
};

const EMPTY: DemoDraft = {
  productId: "",
  demoName: "",
  roleName: "User",
  url: "https://",
  username: "",
  password: "",
  description: "",
  environment: "production",
  active: true,
};

function copy(value: string, what: string) {
  if (!value) return toast.error(`No ${what} saved`);
  void navigator.clipboard.writeText(value);
  toast.success(`${what} copied`);
}

function StatCard({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] p-4"
      style={{
        backgroundImage:
          "linear-gradient(162deg,#152238 0%,#0d1728 48%,#080e1c 100%)",
        boxShadow: "0 1px 0 0 rgba(255,255,255,0.07) inset, 0 24px 48px -28px rgba(0,0,0,0.95)",
      }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-foreground/55">{label}</p>
      <p className={cn("mt-1.5 text-3xl font-extrabold leading-none tracking-[-0.03em]", tone)}>{value}</p>
      {hint && <p className="mt-1.5 truncate text-[10px] font-medium text-foreground/40">{hint}</p>}
    </div>
  );
}

export function DemoUrlManager() {
  const { products, demos } = useDemoState();
  const runCheck = useServerFn(checkDemoUrl);

  const [productFilter, setProductFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DemoDraft>({ ...EMPTY, productId: products[0]?.id ?? "" });
  const [testing, setTesting] = useState<Record<string, boolean>>({});
  const [bulkTesting, setBulkTesting] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importProduct, setImportProduct] = useState("");


  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return demos.filter(
      (d) =>
        (productFilter === "all" || d.productId === productFilter) &&
        (!q ||
          `${d.demoName} ${d.roleName} ${d.url} ${d.username} ${d.description}`
            .toLowerCase()
            .includes(q)),
    );
  }, [demos, productFilter, query]);

  const stats = useMemo(() => {
    const lastChecked = demos
      .map((d) => d.lastChecked)
      .filter(Boolean)
      .sort()
      .pop();
    return {
      total: demos.length,
      working: demos.filter((d) => d.health === "working").length,
      slow: demos.filter((d) => d.health === "slow").length,
      offline: demos.filter((d) => d.health === "offline").length,
      failedLogin: demos.filter((d) => d.loginPageAccessible === false && d.health !== "unknown").length,
      ssl: demos.filter((d) => d.ssl).length,
      lastChecked: lastChecked ? new Date(lastChecked).toLocaleString() : "Never",
    };
  }, [demos]);

  async function testOne(demo: DemoUrl, silent = false) {
    setTesting((t) => ({ ...t, [demo.id]: true }));
    try {
      const result = await runCheck({ data: { url: demo.url } });
      updateDemo(demo.id, {
        health: result.verdict,
        httpStatus: result.httpStatus,
        responseTimeMs: result.responseTimeMs,
        lastChecked: result.checkedAt,
        ssl: result.ssl,
        loginPageAccessible: result.loginPageAccessible,
      });
      if (!silent) {
        const msg = `${demo.demoName}: ${result.message}`;
        if (result.verdict === "working") toast.success(msg);
        else if (result.verdict === "slow") toast.warning(msg);
        else toast.error(msg);
      }
    } catch (error) {
      updateDemo(demo.id, {
        health: "offline",
        httpStatus: null,
        lastChecked: new Date().toISOString(),
        loginPageAccessible: false,
      });
      if (!silent) toast.error(error instanceof Error ? error.message : "Test failed");
    } finally {
      setTesting((t) => ({ ...t, [demo.id]: false }));
    }
  }

  async function testAll() {
    setBulkTesting(true);
    for (const demo of filtered) await testOne(demo, true);
    setBulkTesting(false);
    toast.success(`Tested ${filtered.length} demo URLs`);
  }

  /* ------------------------------ bulk actions ----------------------------- */

  const selectedDemos = useMemo(
    () => demos.filter((d) => selected.includes(d.id)),
    [demos, selected],
  );
  const allFilteredSelected = filtered.length > 0 && filtered.every((d) => selected.includes(d.id));

  function toggleSelect(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  function toggleSelectAll() {
    setSelected(allFilteredSelected ? [] : filtered.map((d) => d.id));
  }

  function bulkSetActive(active: boolean) {
    if (!selected.length) return toast.error("Select at least one demo URL");
    setActiveMany(selected, active);
    toast.success(`${selected.length} demo URLs ${active ? "enabled" : "disabled"}`);
  }

  function bulkDelete() {
    if (!selected.length) return toast.error("Select at least one demo URL");
    const count = selected.length;
    deleteMany(selected);
    setSelected([]);
    toast.success(`${count} demo URLs deleted`);
  }

  async function bulkTest() {
    if (!selectedDemos.length) return toast.error("Select at least one demo URL");
    setBulkTesting(true);
    for (const demo of selectedDemos) await testOne(demo, true);
    setBulkTesting(false);
    toast.success(`Tested ${selectedDemos.length} selected demo URLs`);
  }

  function runImport() {
    const rows = parseImportText(importText);
    if (!rows.length) return toast.error("Nothing to import — check the CSV/JSON format");
    const fallback = importProduct || productFilter !== "all" ? importProduct || productFilter : products[0]?.id ?? "";
    if (!fallback) return toast.error("Create a product first");
    const count = importDemos(rows, fallback);
    if (!count) return toast.error("No valid rows (each row needs a http(s) URL)");
    toast.success(`Imported ${count} demo URLs`);
    setImportText("");
    setImportOpen(false);
  }


  function openCreate() {
    setEditingId(null);
    setDraft({ ...EMPTY, productId: productFilter !== "all" ? productFilter : products[0]?.id ?? "" });
    setDialogOpen(true);
  }

  function openEdit(demo: DemoUrl) {
    setEditingId(demo.id);
    setDraft({
      productId: demo.productId,
      demoName: demo.demoName,
      roleName: demo.roleName,
      url: demo.url,
      username: demo.username,
      password: demo.password,
      description: demo.description,
      environment: demo.environment,
      active: demo.active,
    });
    setDialogOpen(true);
  }

  function save() {
    if (!draft.demoName.trim()) return toast.error("Demo Name is required");
    if (!draft.productId) return toast.error("Select a product");
    if (!/^https?:\/\/.+/i.test(draft.url.trim())) return toast.error("Enter a valid http(s) URL");
    if (editingId) {
      updateDemo(editingId, { ...draft, ssl: draft.url.toLowerCase().startsWith("https://") });
      toast.success("Demo URL updated");
    } else {
      addDemo(draft);
      toast.success("Demo URL added");
    }
    setDialogOpen(false);
  }

  function newProduct() {
    const name = window.prompt("New product name");
    if (!name?.trim()) return;
    const product = addProduct(name.trim());
    setProductFilter(product.id);
    toast.success(`Product "${product.name}" added`);
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Dashboard */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total Demo URLs" value={String(stats.total)} tone="text-foreground" hint={`${products.length} products`} />
        <StatCard label="Working" value={String(stats.working)} tone="text-emerald-300" hint="HTTP 200 / 3xx" />
        <StatCard label="Slow" value={String(stats.slow)} tone="text-amber-300" hint="> 2.5s response" />
        <StatCard label="Offline" value={String(stats.offline)} tone="text-red-300" hint="Unreachable" />
        <StatCard label="Failed Login Pages" value={String(stats.failedLogin)} tone="text-orange-300" hint="No login form found" />
        <StatCard label="SSL Secured" value={`${stats.ssl}/${stats.total}`} tone="text-sky-300" hint="HTTPS endpoints" />
        <StatCard label="Last Checked" value={stats.lastChecked === "Never" ? "—" : "Live"} tone="text-primary" hint={stats.lastChecked} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3">
        <Select value={productFilter} onValueChange={setProductFilter}>
          <SelectTrigger className="h-9 w-[220px]">
            <SelectValue placeholder="All products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All products</SelectItem>
            {products.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search demo, role, URL, username…"
          className="h-9 w-[260px]"
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button className="btn-graphite btn-premium-hover text-[12px]" onClick={newProduct}>
            <Plus className="h-4 w-4" /> Product
          </button>
          <button
            className="btn-graphite btn-premium-hover text-[12px]"
            onClick={() => {
              setImportProduct(productFilter !== "all" ? productFilter : products[0]?.id ?? "");
              setImportOpen(true);
            }}
          >
            <Upload className="h-4 w-4" /> Bulk Import
          </button>
          <button
            className="btn-graphite btn-premium-hover text-[12px]"
            onClick={testAll}
            disabled={bulkTesting || filtered.length === 0}
          >
            {bulkTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            Test All
          </button>
          <button className="btn-premium btn-premium-hover text-[12px]" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Add Demo URL
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-primary/25 bg-[linear-gradient(180deg,rgba(40,68,120,0.4),rgba(12,24,46,0.65))] p-2.5">
        <button className="btn-graphite btn-premium-hover text-[12px]" onClick={toggleSelectAll} disabled={filtered.length === 0}>
          {allFilteredSelected ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
          {allFilteredSelected ? "Clear selection" : "Select all"}
        </button>
        <span className="rounded-md border border-white/12 bg-white/[0.06] px-2 py-1 text-[11px] font-bold text-foreground/70">
          {selected.length} selected
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button className="btn-graphite btn-premium-hover text-[12px]" onClick={() => bulkSetActive(true)} disabled={!selected.length}>
            <Power className="h-4 w-4 text-emerald-300" /> Enable
          </button>
          <button className="btn-graphite btn-premium-hover text-[12px]" onClick={() => bulkSetActive(false)} disabled={!selected.length}>
            <PowerOff className="h-4 w-4 text-amber-300" /> Disable
          </button>
          <button
            className="btn-premium btn-premium-hover text-[12px]"
            onClick={() => void bulkTest()}
            disabled={bulkTesting || !selected.length}
          >
            {bulkTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            Test Selected
          </button>
          <button className="btn-graphite btn-premium-hover text-[12px] text-rose-200" onClick={bulkDelete} disabled={!selected.length}>
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      </div>


      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-sm text-foreground/50">
            No demo URLs yet. Click “Add Demo URL” to create one.
          </div>
        )}

        {filtered.map((demo) => {
          const health = HEALTH_STYLE[demo.health];
          const product = products.find((p) => p.id === demo.productId);
          return (
            <div
              key={demo.id}
              className={cn(
                "relative overflow-hidden rounded-2xl border border-white/[0.08] p-4",
                !demo.active && "opacity-55",
              )}
              style={{
                backgroundImage: "linear-gradient(162deg,#152238 0%,#0d1728 48%,#080e1c 100%)",
                boxShadow: "0 1px 0 0 rgba(255,255,255,0.07) inset, 0 24px 48px -30px rgba(0,0,0,0.95)",
              }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <button
                    type="button"
                    aria-label={`Select ${demo.demoName}`}
                    onClick={() => toggleSelect(demo.id)}
                    className="mt-0.5 shrink-0 rounded-md border border-white/15 bg-white/[0.05] p-1 transition-colors hover:border-primary/60"
                  >
                    {selected.includes(demo.id) ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 text-foreground/45" />
                    )}
                  </button>
                  <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">

                    <h3 className="truncate text-base font-extrabold tracking-[-0.02em] text-foreground">
                      {demo.demoName}
                    </h3>
                    <span className="rounded-md border border-primary/35 bg-primary/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                      {demo.roleName}
                    </span>
                    <span className="rounded-md border border-white/12 bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-foreground/60">
                      {demo.environment}
                    </span>
                    <span className={cn("rounded-md border px-1.5 py-0.5 text-[10px] font-bold", health.cls)}>
                      {health.label}
                    </span>
                    {demo.ssl && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-sky-400/35 bg-sky-400/10 px-1.5 py-0.5 text-[10px] font-bold text-sky-300">
                        <ShieldCheck className="h-3 w-3" /> SSL
                      </span>
                    )}
                  </div>
                  <p className="mt-1 truncate text-[11px] font-medium text-foreground/45">
                    {product?.name ?? "Unassigned"} · {demo.description || "No description"}
                  </p>
                  <a
                    href={demo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 truncate text-[12px] font-semibold text-primary hover:underline"
                  >
                    <Globe className="h-3.5 w-3.5" /> {demo.url}
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={demo.active} onCheckedChange={() => toggleDemo(demo.id)} aria-label="Enable demo" />
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEdit(demo)} title="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => duplicateDemo(demo.id)} title="Duplicate">
                    <CopyPlus className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-red-300 hover:text-red-200"
                    title="Delete"
                    onClick={() => {
                      deleteDemo(demo.id);
                      toast.success("Demo URL deleted");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* credentials + metrics */}
              <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5">
                  <User className="h-3.5 w-3.5 text-foreground/45" />
                  <span className="truncate text-[11px] font-semibold text-foreground/80">{demo.username || "—"}</span>
                  <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={() => copy(demo.username, "Username")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-foreground/45" />
                  <span className="truncate font-mono text-[11px] text-foreground/70">
                    {demo.password ? "••••••••" : "—"}
                  </span>
                  <Button variant="ghost" size="icon" className="ml-auto h-6 w-6" onClick={() => copy(demo.password, "Password")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-semibold text-foreground/70">
                  <span>HTTP {demo.httpStatus ?? "—"}</span>
                  <span className="tabular-nums">{demo.responseTimeMs != null ? `${demo.responseTimeMs} ms` : "— ms"}</span>
                  <span className="inline-flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {demo.loginPageAccessible == null ? "—" : demo.loginPageAccessible ? "Login OK" : "No login"}
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5">
                  <span className="truncate text-[11px] font-medium text-foreground/50">
                    {demo.lastChecked ? new Date(demo.lastChecked).toLocaleString() : "Never checked"}
                  </span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={() => void testOne(demo)} disabled={!!testing[demo.id]}>
                  {testing[demo.id] ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}
                  Test Demo
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.open(demo.url, "_blank", "noopener,noreferrer")}>
                  <ExternalLink className="mr-1 h-3.5 w-3.5" /> Open Demo
                </Button>
                <Button variant="outline" size="sm" onClick={() => copy(demo.url, "URL")}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy URL
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Demo URL" : "Add Demo URL"}</DialogTitle>
            <DialogDescription>
              Unlimited role-based demo environments per product.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Product</Label>
              <Select value={draft.productId} onValueChange={(v) => setDraft({ ...draft, productId: v })}>
                <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Demo Name</Label>
              <Input value={draft.demoName} onChange={(e) => setDraft({ ...draft, demoName: e.target.value })} placeholder="Admin Demo" maxLength={120} />
            </div>
            <div className="grid gap-1.5">
              <Label>Role Name</Label>
              <Input
                value={draft.roleName}
                onChange={(e) => setDraft({ ...draft, roleName: e.target.value })}
                list="demo-role-presets"
                placeholder="Teacher / Vendor / custom"
                maxLength={60}
              />
              <datalist id="demo-role-presets">
                {ROLE_PRESETS.map((r) => <option key={r} value={r} />)}
              </datalist>
            </div>
            <div className="grid gap-1.5">
              <Label>Environment</Label>
              <Select
                value={draft.environment}
                onValueChange={(v) => setDraft({ ...draft, environment: v as DemoEnvironment })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="production">Production</SelectItem>
                  <SelectItem value="staging">Staging</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5 md:col-span-2">
              <Label>URL</Label>
              <Input value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://demo.example.com/admin" maxLength={500} />
            </div>
            <div className="grid gap-1.5">
              <Label>Username / Email</Label>
              <Input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} maxLength={160} />
            </div>
            <div className="grid gap-1.5">
              <Label>Password</Label>
              <Input value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} maxLength={160} />
            </div>
            <div className="grid gap-1.5 md:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="flex items-center gap-2.5 md:col-span-2">
              <Switch checked={draft.active} onCheckedChange={(v) => setDraft({ ...draft, active: v })} />
              <Label className="cursor-pointer">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editingId ? "Save changes" : "Add Demo URL"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DemoUrlManager;
