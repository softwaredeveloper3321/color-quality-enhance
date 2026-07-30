/**
 * SLIDER BANNER — plain (no image) 3D poster-style auto slider.
 * Feeds from bannerFeed store: alerts / notifications / approvals / to-dos.
 * Every button is functional.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ListTodo,
  Pause,
  Play,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  completeBannerItem,
  resolveBannerItem,
  useBannerFeed,
  type BannerKind,
} from "./bannerFeed";

const KIND_STYLE: Record<
  BannerKind,
  { label: string; icon: typeof Bell; hue: string; glow: string; chip: string }
> = {
  alert: {
    label: "Alert",
    icon: AlertTriangle,
    hue: "linear-gradient(135deg,#ff7a45 0%,#ff4d6d 55%,#7a1f5c 100%)",
    glow: "rgba(255,110,90,0.55)",
    chip: "bg-orange-400/20 text-orange-200 border-orange-300/40",
  },
  approval: {
    label: "Approval",
    icon: ClipboardCheck,
    hue: "linear-gradient(135deg,#2f7dff 0%,#48c6ff 55%,#0b2a63 100%)",
    glow: "rgba(72,168,255,0.6)",
    chip: "bg-sky-400/20 text-sky-200 border-sky-300/40",
  },
  notification: {
    label: "Notification",
    icon: Bell,
    hue: "linear-gradient(135deg,#3b6bff 0%,#7f5bff 55%,#12184a 100%)",
    glow: "rgba(120,120,255,0.55)",
    chip: "bg-indigo-400/20 text-indigo-200 border-indigo-300/40",
  },
  todo: {
    label: "To-Do",
    icon: ListTodo,
    hue: "linear-gradient(135deg,#0fb99a 0%,#34d0ff 55%,#0a2d4d 100%)",
    glow: "rgba(46,214,190,0.55)",
    chip: "bg-emerald-400/20 text-emerald-200 border-emerald-300/40",
  },
};

interface SliderBannerProps {
  className?: string;
  intervalMs?: number;
  compact?: boolean;
}

export function SliderBanner({ className, intervalMs = 5000, compact = false }: SliderBannerProps) {
  const items = useBannerFeed();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const count = items.length;
  const safeIndex = count ? index % count : 0;
  const item = items[safeIndex];

  useEffect(() => {
    if (!playing || count < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), intervalMs);
    return () => clearInterval(t);
  }, [playing, count, intervalMs]);

  const go = useCallback(
    (dir: number) => setIndex((i) => (count ? (i + dir + count) % count : 0)),
    [count],
  );

  const style = useMemo(() => KIND_STYLE[item?.kind ?? "notification"], [item?.kind]);

  if (!item) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-3xl border-2 border-primary/40 p-8 text-sm font-semibold text-foreground/70",
          className,
        )}
        style={{ background: "linear-gradient(160deg,#10254a,#060d1d)" }}
      >
        All clear, Boss — koi pending alert, approval ya to-do nahi hai.
      </div>
    );
  }

  const Icon = style.icon;
  const primaryLabel =
    item.primaryLabel ??
    (item.kind === "approval" ? "Approve" : item.kind === "todo" ? "Mark Done" : "Acknowledge");

  return (
    <section
      className={cn("relative select-none [perspective:1400px]", className)}
      aria-roledescription="carousel"
      onMouseEnter={() => setPlaying(false)}
      onMouseLeave={() => setPlaying(true)}
    >
      {/* glow base layer (3D poster depth) */}
      <div
        className="absolute inset-x-6 -bottom-3 h-16 rounded-[2rem] blur-2xl transition-all duration-700"
        style={{ background: style.glow, opacity: 0.85 }}
        aria-hidden
      />

      <div
        key={item.id}
        className={cn(
          "relative overflow-hidden rounded-3xl border-2 border-primary-glow/45 animate-fade-in",
          "shadow-[0_36px_90px_-32px] shadow-primary/90",
          compact ? "p-4" : "p-6 sm:p-8",
        )}
        style={{ background: style.hue, transform: "rotateX(0.6deg)" }}
      >
        {/* shine + density layers */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_10%_-20%,rgba(255,255,255,0.38),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent_35%,rgba(0,0,0,0.42))]" />
        <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.45)_1px,transparent_0)] [background-size:18px_18px]" />
        <div className="pointer-events-none absolute -left-16 -top-24 h-64 w-64 rounded-full bg-white/25 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-12 bg-white/20 blur-xl"
          style={{ animation: "kpi-sweep 4.5s ease-in-out infinite" }}
        />

        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.18em] backdrop-blur",
                  style.chip,
                )}
              >
                <Icon className="h-3 w-3" />
                {style.label}
              </span>
              {item.meta && (
                <span className="rounded-full border border-white/25 bg-black/25 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur">
                  {item.meta}
                </span>
              )}
              {item.done && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300/50 bg-emerald-400/20 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-100">
                  <CheckCircle2 className="h-3 w-3" /> Done
                </span>
              )}
            </div>

            <h2
              className={cn(
                "mt-3 font-extrabold leading-tight tracking-[-0.02em] text-white drop-shadow-[0_6px_18px_rgba(0,0,0,0.55)]",
                compact ? "text-base" : "text-2xl sm:text-3xl",
              )}
            >
              {item.title}
            </h2>
            <p className={cn("mt-2 max-w-2xl text-white/85", compact ? "text-[11px]" : "text-sm")}>
              {item.detail}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (item.kind === "todo") {
                    completeBannerItem(item.id);
                    toast.success(`Marked done: ${item.title}`);
                  } else {
                    resolveBannerItem(item.id);
                    toast.success(`${primaryLabel}d: ${item.title}`);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-extrabold text-[#0b1a35] shadow-[0_12px_30px_-12px_rgba(0,0,0,0.9)] transition-transform hover:scale-105 active:scale-95"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {primaryLabel}
              </button>
              <button
                type="button"
                onClick={() => {
                  resolveBannerItem(item.id);
                  toast.info(`Dismissed: ${item.title}`);
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/25 px-4 py-2 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-black/40"
              >
                <X className="h-3.5 w-3.5" />
                {item.secondaryLabel ?? "Dismiss"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPlaying((p) => !p);
                  toast.message(playing ? "Slider paused" : "Slider playing");
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/35 bg-black/25 px-3 py-2 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-black/40"
              >
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? "Pause" : "Play"}
              </button>
            </div>
          </div>

          {/* nav */}
          <div className="flex items-center gap-2 self-end lg:self-center">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => go(-1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur transition-transform hover:scale-110"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="rounded-full border border-white/30 bg-black/30 px-3 py-1 text-[11px] font-bold text-white">
              {safeIndex + 1}/{count}
            </span>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => go(1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/35 bg-black/25 text-white backdrop-blur transition-transform hover:scale-110"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* dots */}
        <div className="relative mt-4 flex items-center gap-1.5">
          {items.map((it, i) => (
            <button
              key={it.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === safeIndex ? "w-8 bg-white" : "w-3 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SliderBanner;
