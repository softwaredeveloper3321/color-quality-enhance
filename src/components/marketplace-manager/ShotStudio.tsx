import { useRef, useState } from "react";
import { Camera, Copy, Download, Loader2, Monitor, Smartphone, Tablet, X } from "lucide-react";
import { toast } from "sonner";
import { PillButton } from "./ui";
import { BrandMark } from "./BrandMark";
import {
  SHOT_RESOLUTIONS,
  copyNodeToClipboard,
  exportNode,
  resolutionWidth,
  type ShotFormat,
  type ShotResolutionId,
} from "@/lib/shot-export";

const DEVICES = [
  { id: "desktop", label: "Desktop", icon: Monitor, width: 1440 },
  { id: "tablet", label: "Tablet", icon: Tablet, width: 834 },
  { id: "mobile", label: "Mobile", icon: Smartphone, width: 390 },
] as const;
type DeviceId = (typeof DEVICES)[number]["id"];

/**
 * Shared 4K capture studio — renders any surface at true device width inside a
 * scaled stage and exports it as a high-resolution PNG/JPEG.
 */
export function ShotStudioModal({
  open,
  onClose,
  title,
  subtitle,
  fileName,
  children,
  defaultDevice = "desktop",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fileName: string;
  /** Surface to capture — receives the active device width in CSS px. */
  children: (device: { id: DeviceId; width: number }) => React.ReactNode;
  defaultDevice?: DeviceId;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<DeviceId>(defaultDevice);
  const [res, setRes] = useState<ShotResolutionId>("uhd");
  const [format, setFormat] = useState<ShotFormat>("png");
  const [busy, setBusy] = useState<null | "export" | "copy">(null);

  if (!open) return null;
  const dev = DEVICES.find((d) => d.id === device)!;
  const outW = resolutionWidth(res);
  const scaleFactor = outW / dev.width;

  const run = async (kind: "export" | "copy") => {
    const node = stageRef.current;
    if (!node) return;
    setBusy(kind);
    try {
      if (kind === "copy") {
        await copyNodeToClipboard(node, outW);
        toast.success(`Copied ${outW}px shot to clipboard`);
      } else {
        await exportNode(node, { targetWidth: outW, format, name: `${fileName}-${device}` });
        toast.success(`Exported ${outW}px ${format.toUpperCase()}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Capture failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-background/88 p-4 backdrop-blur-md">
      <div className="my-6 w-full max-w-[1400px] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_50px_140px_-50px_oklch(0.62_0.19_255/0.8)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark size={30} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold">{title}</p>
              <p className="truncate text-[11px] text-muted-foreground">
                {subtitle ?? "High-resolution storefront capture"} · output {outW}×auto px
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center gap-1 rounded-full border border-border bg-background/40 p-1">
              {DEVICES.map((d) => {
                const I = d.icon;
                return (
                  <button
                    key={d.id}
                    onClick={() => setDevice(d.id)}
                    title={`${d.label} · ${d.width}px`}
                    className={`inline-flex h-7 w-8 items-center justify-center rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      device === d.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <I className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-1 rounded-full border border-border bg-background/40 p-1">
              {SHOT_RESOLUTIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRes(r.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    res === r.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-full border border-border bg-background/40 p-1">
              {(["png", "jpeg"] as ShotFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    format === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "jpeg" ? "jpg" : f}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close capture studio"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scaled stage — captured node always renders at true device width */}
        <div className="overflow-auto bg-[oklch(0.12_0.03_262)] p-6">
          <div
            className="mx-auto"
            style={{ width: "100%", maxWidth: dev.width, overflow: "hidden" }}
          >
            <div
              style={{
                width: dev.width,
                transformOrigin: "top left",
                transform: "scale(var(--shot-scale, 1))",
              }}
              ref={(el) => {
                if (!el) return;
                const parent = el.parentElement;
                if (!parent) return;
                const s = Math.min(1, parent.clientWidth / dev.width);
                el.style.setProperty("--shot-scale", String(s));
                parent.style.height = `${el.scrollHeight * s}px`;
              }}
            >
              <div ref={stageRef} style={{ width: dev.width }}>
                {children(dev)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3">
          <p className="text-[11px] text-muted-foreground">
            Rendered at {dev.width}px, upscaled ×{scaleFactor.toFixed(1)} for a crisp {outW}px export.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <PillButton variant="ghost" onClick={() => void run("copy")}>
              <span className="inline-flex items-center gap-1.5">
                {busy === "copy" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                Copy image
              </span>
            </PillButton>
            <PillButton variant="primary" onClick={() => void run("export")}>
              <span className="inline-flex items-center gap-1.5">
                {busy === "export" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Export {SHOT_RESOLUTIONS.find((r) => r.id === res)?.label}
              </span>
            </PillButton>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Small trigger used in section toolbars. */
export function ShotStudioButton({ onClick, label = "4K Export" }: { onClick: () => void; label?: string }) {
  return (
    <PillButton variant="ghost" onClick={onClick}>
      <span className="inline-flex items-center gap-1.5">
        <Camera className="h-3.5 w-3.5" /> {label}
      </span>
    </PillButton>
  );
}
