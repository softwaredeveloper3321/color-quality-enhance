import { useEffect, useMemo, useState } from "react";
import { CornerDownLeft, Keyboard, Search, Sparkles, X } from "lucide-react";
import { SECTIONS, type SectionId } from "./TopBar";
import { BrandMark } from "./BrandMark";

const KEY_CAP =
  "inline-grid h-5 min-w-5 place-items-center rounded-md border border-border bg-surface px-1.5 text-[10px] font-bold text-foreground shadow-[inset_0_1px_0_oklch(1_0_0/0.14)]";

/** Global module search — wires the header search button to real navigation. */
export function CommandPalette({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean;
  onClose: () => void;
  onNavigate: (id: SectionId) => void;
}) {
  const [q, setQ] = useState("");
  const [cursor, setCursor] = useState(0);

  const results = useMemo(() => {
    const n = q.trim().toLowerCase();
    const list = SECTIONS as unknown as Array<{
      id: string;
      label: string;
      groupLabel?: string;
      icon: React.ComponentType<{ className?: string }>;
    }>;
    if (!n) return list.slice(0, 12);
    return list
      .filter((s) => `${s.label} ${s.groupLabel ?? ""}`.toLowerCase().includes(n))
      .slice(0, 24);
  }, [q]);

  useEffect(() => {
    if (open) {
      setQ("");
      setCursor(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (e.key === "Home") {
        e.preventDefault();
        setCursor(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        setCursor(Math.max(results.length - 1, 0));
      }
      if (e.key === "Enter" && results[cursor]) {
        onNavigate(results[cursor].id as SectionId);
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, cursor, onClose, onNavigate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center bg-background/80 p-4 backdrop-blur-md">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close search" />
      <div
        role="dialog"
        aria-label="Module search"
        className="relative mt-[10vh] w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_40px_120px_-40px_oklch(0.62_0.19_255/0.7)]"
      >
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <BrandMark size={26} glow={false} />
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setCursor(0);
            }}
            placeholder="Search every module — try “hero”, “seo”, “demo”…"
            aria-label="Search modules"
            className="w-full rounded-md bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
          <span className={KEY_CAP}>esc</span>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!q && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2 text-[11px] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-accent" />
            <span className="mr-1">Tips:</span>
            {["hero slides", "notifications", "seo", "demo urls", "deployment"].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setQ(t);
                  setCursor(0);
                }}
                className="rounded-full border border-border px-2 py-0.5 transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <div className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">No module matches “{q}”.</p>
          )}
          {results.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onMouseEnter={() => setCursor(i)}
                onFocus={() => setCursor(i)}
                aria-selected={i === cursor}
                onClick={() => {
                  onNavigate(s.id as SectionId);
                  onClose();
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  i === cursor
                    ? "bg-primary/20 text-foreground shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--color-primary)_45%,transparent)]"
                    : "text-muted-foreground hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate font-medium">{s.label}</span>
                <span className="hidden shrink-0 text-[10px] uppercase tracking-wider text-muted-foreground sm:inline">
                  {s.groupLabel}
                </span>
                {i === cursor && <CornerDownLeft className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-border bg-surface/60 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Keyboard className="h-3.5 w-3.5" /> Shortcuts
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={KEY_CAP}>↑</span>
            <span className={KEY_CAP}>↓</span> navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={KEY_CAP}>↵</span> open
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={KEY_CAP}>⌘</span>
            <span className={KEY_CAP}>K</span> toggle
          </span>
          <span className="ml-auto">{results.length} module(s)</span>
        </div>
      </div>
    </div>
  );
}
