import { useCallback, useRef, type ReactNode } from "react";

/**
 * Pointer-driven 3D tilt + parallax wrapper.
 * Adds depth/glow on hover, respects prefers-reduced-motion.
 */
export function Tilt3D({
  children,
  className = "",
  max = 8,
  glow = true,
}: {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  max?: number;
  glow?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      el.style.setProperty("--tx", `${(px - 0.5) * 2 * max}deg`);
      el.style.setProperty("--ty", `${(0.5 - py) * 2 * max}deg`);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
      el.dataset["tilting"] = "true";
    },
    [max],
  );

  const reset = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tx", "0deg");
    el.style.setProperty("--ty", "0deg");
    delete el.dataset["tilting"];
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={`tilt3d ${glow ? "tilt3d--glow" : ""} ${className}`}
    >
      <div className="tilt3d__inner">{children}</div>
    </div>
  );
}
