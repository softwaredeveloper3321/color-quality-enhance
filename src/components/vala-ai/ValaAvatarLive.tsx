import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import valaAgent from "@/assets/vala-ai-agent.png";

export type ValaState = "idle" | "listening" | "thinking" | "speaking" | "welcome";

/**
 * LIVING VALA AVATAR
 * A layered, GPU-accelerated composite: portrait + animated SVG energy circuits,
 * rotating chest AI core, blink/eye-tracking overlays, holographic particles and
 * a voice waveform. Every layer animates via transform/opacity only (60fps).
 */

type CircuitPath = { d: string; dur: number; delay: number; width: number; opacity: number };

// Circuit network mapped over the character silhouette (viewBox 0 0 100 150).
const CIRCUITS: CircuitPath[] = [
  // face / cheek lines
  { d: "M46 24 C43 27, 42 31, 44 35", dur: 2.6, delay: 0, width: 0.7, opacity: 0.95 },
  { d: "M55 24 C58 27, 59 31, 57 35", dur: 3.1, delay: 0.4, width: 0.7, opacity: 0.85 },
  { d: "M44 20 C48 18, 53 18, 57 20", dur: 3.6, delay: 0.9, width: 0.6, opacity: 0.7 },
  // neck to core
  { d: "M48 38 L48 46 L50 50", dur: 2.2, delay: 0.2, width: 0.9, opacity: 1 },
  { d: "M54 38 L54 46 L52 50", dur: 2.4, delay: 0.6, width: 0.9, opacity: 1 },
  // shoulders
  { d: "M50 52 C42 52, 36 56, 33 64", dur: 3, delay: 0.1, width: 1, opacity: 0.95 },
  { d: "M52 52 C60 52, 66 56, 69 64", dur: 3.2, delay: 0.5, width: 1, opacity: 0.95 },
  // arms
  { d: "M33 64 C30 76, 30 88, 33 100", dur: 4, delay: 0.3, width: 0.8, opacity: 0.8 },
  { d: "M69 64 C72 76, 72 88, 69 100", dur: 4.2, delay: 0.8, width: 0.8, opacity: 0.8 },
  // torso ribs
  { d: "M44 60 C40 68, 40 76, 44 84", dur: 3.4, delay: 0.15, width: 0.7, opacity: 0.85 },
  { d: "M58 60 C62 68, 62 76, 58 84", dur: 3.7, delay: 0.55, width: 0.7, opacity: 0.85 },
  { d: "M46 88 L51 92 L56 88", dur: 2.8, delay: 1, width: 0.6, opacity: 0.7 },
  // legs
  { d: "M47 96 C45 110, 45 124, 46 138", dur: 4.6, delay: 0.2, width: 0.7, opacity: 0.75 },
  { d: "M55 96 C57 110, 57 124, 56 138", dur: 4.9, delay: 0.7, width: 0.7, opacity: 0.75 },
];

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  left: 18 + ((i * 37) % 66),
  delay: (i * 0.83) % 6,
  dur: 5 + ((i * 1.7) % 4),
  size: 1.5 + ((i * 0.7) % 2),
}));

export function ValaAvatarLive({
  state = "idle",
  className,
  showWaveform = true,
}: {
  state?: ValaState;
  className?: string;
  showWaveform?: boolean;
}) {
  const [entered, setEntered] = useState(false);
  const [gaze, setGaze] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  // Smooth welcome entrance: fade in + circuits boot from the chest outward.
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Eye / head tracking towards the pointer.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.22;
      setGaze({
        x: Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2))),
        y: Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2))),
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const active = state === "speaking" || state === "listening" || state === "thinking";
  const flowScale = state === "speaking" ? 0.45 : state === "listening" ? 0.6 : state === "thinking" ? 0.7 : 1;
  const bars = useMemo(() => [0.35, 0.7, 1, 0.55, 0.85, 0.45, 0.75, 0.3], []);

  return (
    <div
      ref={ref}
      data-state={state}
      className={cn(
        "relative isolate select-none [transform:translateZ(0)] [will-change:transform]",
        "transition-[opacity,transform] duration-[1200ms] ease-out",
        entered ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        className,
      )}
    >
      {/* Ambient bloom */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[95%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-opacity duration-700",
          state === "listening" && "bg-accent/55",
          state === "thinking" && "bg-primary/55",
          state === "speaking" && "bg-primary-glow/60",
          (state === "idle" || state === "welcome") && "bg-primary/35",
        )}
        style={{ animation: `vala-bloom ${active ? 1.8 : 4.5}s ease-in-out infinite` }}
      />

      {/* Character with breathing / idle sway / head micro-motion */}
      <div
        className="relative h-full w-full [transform-style:preserve-3d]"
        style={{
          animation: `vala-breathe ${active ? 3.4 : 5.2}s ease-in-out infinite, vala-sway ${active ? 6 : 9}s ease-in-out infinite`,
          transform: `perspective(700px) rotateY(${gaze.x * 4}deg) rotateX(${-gaze.y * 2.5}deg)`,
          transition: "transform 700ms cubic-bezier(.22,1,.36,1)",
        }}
      >
        <img
          src={valaAgent}
          alt="Vala AI executive assistant, a futuristic female android with glowing blue energy circuits"
          width={832}
          height={1216}
          className={cn(
            "h-full w-auto object-contain drop-shadow-[0_22px_60px_rgba(45,150,255,0.6)]",
            state === "speaking" && "animate-[vala-talk_0.55s_ease-in-out_infinite]",
          )}
        />

        {/* Eye blink + gaze shimmer */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-[42%] top-[13.5%] h-[1.6%] w-[16%] rounded-full bg-[rgba(10,20,40,0.55)] blur-[1px]"
          style={{ animation: "vala-blink 6.4s ease-in-out infinite" }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute left-[42%] top-[13%] h-[2.4%] w-[16%] rounded-full bg-[radial-gradient(circle,rgba(120,220,255,0.75),transparent_70%)] blur-[2px]"
          style={{
            transform: `translate(${gaze.x * 12}%, ${gaze.y * 8}%)`,
            transition: "transform 600ms cubic-bezier(.22,1,.36,1)",
            opacity: state === "listening" ? 1 : 0.55,
          }}
        />

        {/* Energy circuit network */}
        <svg
          aria-hidden
          viewBox="0 0 100 150"
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        >
          <defs>
            <filter id="vala-bloom-filter" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="1.1" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="vala-line" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.92 0.13 205)" />
              <stop offset="100%" stopColor="oklch(0.68 0.19 250)" />
            </linearGradient>
          </defs>

          <g filter="url(#vala-bloom-filter)">
            {CIRCUITS.map((c, i) => (
              <g key={i}>
                {/* base trace, softly breathing */}
                <path
                  d={c.d}
                  fill="none"
                  stroke="url(#vala-line)"
                  strokeWidth={c.width}
                  strokeLinecap="round"
                  opacity={c.opacity * (active ? 0.75 : 0.5)}
                  style={{
                    animation: `vala-trace ${3 + (i % 4)}s ease-in-out ${c.delay}s infinite`,
                    // circuits boot up one by one from the chest on welcome
                    animationDelay: `${entered ? c.delay : i * 0.12}s`,
                  }}
                />
                {/* travelling energy pulse */}
                <path
                  d={c.d}
                  fill="none"
                  stroke="oklch(0.96 0.12 200)"
                  strokeWidth={c.width * 1.25}
                  strokeLinecap="round"
                  pathLength={100}
                  strokeDasharray="14 86"
                  style={{
                    animation: `vala-pulse ${(c.dur * flowScale).toFixed(2)}s linear ${c.delay}s infinite`,
                    filter: "drop-shadow(0 0 2px oklch(0.9 0.14 210))",
                  }}
                />
              </g>
            ))}
          </g>

          {/* Chest AI core */}
          <g transform="translate(51 57)">
            <circle
              r="5.6"
              fill="none"
              stroke="oklch(0.9 0.13 205)"
              strokeWidth="0.6"
              strokeDasharray="4 3"
              opacity="0.85"
              style={{ animation: `vala-spin ${state === "speaking" ? 3 : 7}s linear infinite` }}
            />
            <circle
              r="3.6"
              fill="none"
              stroke="oklch(0.82 0.15 235)"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              opacity="0.9"
              style={{ animation: `vala-spin-rev ${state === "speaking" ? 2.2 : 5}s linear infinite` }}
            />
            <circle
              r="2"
              fill="oklch(0.93 0.12 205)"
              style={{
                animation: `vala-core ${state === "speaking" ? 0.8 : state === "thinking" ? 1.2 : 2.6}s ease-in-out infinite`,
                filter: "drop-shadow(0 0 3px oklch(0.9 0.15 210))",
              }}
            />
            {/* energy release ring every few seconds */}
            <circle
              r="2"
              fill="none"
              stroke="oklch(0.9 0.13 205)"
              strokeWidth="0.5"
              style={{ animation: `vala-ring ${state === "speaking" ? 1.6 : 3.6}s ease-out infinite` }}
            />
          </g>
        </svg>

        {/* Holographic particles */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="absolute bottom-0 rounded-full bg-accent/70"
              style={{
                left: `${p.left}%`,
                height: p.size,
                width: p.size,
                animation: `vala-particle ${p.dur}s linear ${p.delay}s infinite`,
                filter: "drop-shadow(0 0 3px oklch(0.9 0.14 210))",
              }}
            />
          ))}
        </div>
      </div>

      {/* Voice waveform */}
      {showWaveform && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-1 flex items-end justify-center gap-[3px] transition-opacity duration-300",
            state === "speaking" || state === "listening" ? "opacity-100" : "opacity-0",
          )}
        >
          {bars.map((b, i) => (
            <span
              key={i}
              className="w-[3px] rounded-full bg-gradient-to-t from-primary to-accent"
              style={{
                height: `${8 + b * 14}px`,
                animation: `vala-wave ${0.5 + b * 0.4}s ease-in-out ${i * 0.06}s infinite`,
                transformOrigin: "bottom",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ValaAvatarLive;
