import { toPng, toJpeg } from "html-to-image";

export type ShotFormat = "png" | "jpeg";

export const SHOT_RESOLUTIONS = [
  { id: "hd", label: "1080p", width: 1920 },
  { id: "qhd", label: "1440p", width: 2560 },
  { id: "uhd", label: "4K UHD", width: 3840 },
  { id: "uhd2", label: "8K", width: 7680 },
] as const;

export type ShotResolutionId = (typeof SHOT_RESOLUTIONS)[number]["id"];

export function resolutionWidth(id: ShotResolutionId): number {
  return SHOT_RESOLUTIONS.find((r) => r.id === id)?.width ?? 3840;
}

function slug(s: string) {
  return (s || "shot").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);
}

/** Renders a live DOM node to a high-resolution image data URL. */
export async function captureNode(
  node: HTMLElement,
  opts: { targetWidth?: number; format?: ShotFormat; background?: string } = {},
): Promise<string> {
  const targetWidth = opts.targetWidth ?? 3840;
  const format = opts.format ?? "png";
  const rect = node.getBoundingClientRect();
  const pixelRatio = Math.max(1, Math.min(8, targetWidth / Math.max(rect.width, 1)));
  const config = {
    pixelRatio,
    cacheBust: true,
    backgroundColor: opts.background ?? "#0b1020",
    skipFonts: true,
  };
  return format === "jpeg" ? toJpeg(node, { ...config, quality: 0.96 }) : toPng(node, config);
}

/** Captures a node and triggers a browser download. */
export async function exportNode(
  node: HTMLElement,
  opts: { targetWidth?: number; format?: ShotFormat; background?: string; name?: string } = {},
): Promise<string> {
  const format = opts.format ?? "png";
  const dataUrl = await captureNode(node, opts);
  const a = document.createElement("a");
  const w = opts.targetWidth ?? 3840;
  a.href = dataUrl;
  a.download = `${slug(opts.name ?? "software-vala-shot")}-${w}w.${format === "jpeg" ? "jpg" : "png"}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  return dataUrl;
}

/** Copies a captured node to the clipboard as a PNG (best-effort). */
export async function copyNodeToClipboard(node: HTMLElement, targetWidth = 3840): Promise<void> {
  const dataUrl = await captureNode(node, { targetWidth, format: "png" });
  const blob = await (await fetch(dataUrl)).blob();
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}
