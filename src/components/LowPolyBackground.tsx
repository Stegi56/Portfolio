// LowPolyBackground.tsx
import { useEffect, useRef } from "react";

type RGB = { r: number; g: number; b: number };

export type LowPolyProps = Partial<{
  cols: number;          // grid columns
  rows: number;          // grid rows
  speed: number;         // animation speed multiplier (1 = default)
  wobble: number;        // px amplitude of the per‑vertex wobble
  parallax: number;      // px mouse parallax shift (±)
  glow: number;          // 0..1+ glow intensity near cursor
  glowRadius: number;    // px radius of glow falloff
  colorJitter: number;   // extra lighten from noise (0..1)
  opacity: number;       // canvas opacity
  zIndex: number;        // canvas z-index
  dprCap: number;        // clamp DPR for perf (e.g. 2)
  from: RGB;             // palette start
  to: RGB;               // palette end
}>;

const DEF = {
  cols: 28, rows: 18,
  speed: 1,
  wobble: 6,
  parallax: 10,
  glow: 0.18,
  glowRadius: 420,
  colorJitter: 0.06,
  opacity: 0.75,
  zIndex: -1,
  dprCap: 2,
  from: { r: 22, g: 35, b: 56 },
  to:   { r: 60, g: 52, b: 120 },
} as const;

export default function LowPolyBackground(props: LowPolyProps) {
  const cfg = { ...DEF, ...props };
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const mouse = { x: 0.5, y: 0.5 };
    let dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
    let rafId = 0;

    const vp = () => ({
      vw: Math.round(visualViewport?.width ?? window.innerWidth),
      vh: Math.round(visualViewport?.height ?? window.innerHeight),
    });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
      const { vw, vh } = vp();
      canvas.style.width = vw + "px";
      canvas.style.height = vh + "px";
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);
    visualViewport?.addEventListener("resize", resize);

    const onPointer = (e: PointerEvent) => {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    const loop = (now: number) => {
      const seconds = (now * 0.001) * cfg.speed; // single speed knob
      const angle = seconds * 0.12;
      const tNoise = seconds * 0.8;

      const { vw, vh } = vp();
      ctx.clearRect(0, 0, vw, vh);

      const snap = (v: number) => Math.round(v * dpr) / dpr;
      const cellW = vw / cfg.cols, cellH = vh / cfg.rows;

      const dx = Math.cos(angle), dy = Math.sin(angle);
      const shiftX = (mouse.x - 0.5) * cfg.parallax;
      const shiftY = (mouse.y - 0.5) * cfg.parallax;

      const points = Array.from({ length: cfg.rows + 1 }, (_, y) =>
        Array.from({ length: cfg.cols + 1 }, (_, x) => {
          const px = x * cellW + shiftX;
          const py = y * cellH + shiftY;
          const n = noise(x * 0.8, y * 0.7, tNoise);
          const wob = cfg.wobble * n;
          return { x: snap(px + wob), y: snap(py + wob), n };
        })
      );

      const tri = (a: any, b: any, c: any) => {
        const cx = (a.x + b.x + c.x) / 3, cy = (a.y + b.y + c.y) / 3;
        const grad = clamp01((cx * dx + cy * dy) / Math.hypot(vw, vh));
        const mx = mouse.x * vw, my = mouse.y * vh;
        const dist = Math.hypot(cx - mx, cy - my);
        const glow = Math.max(0, 1 - dist / cfg.glowRadius) * cfg.glow;

        const base = mix(cfg.from, cfg.to, grad * 0.9);
        const jitter = (a.n + b.n + c.n) / 3;
        const col = lighten(base, cfg.colorJitter * jitter + glow);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = `rgb(${col.r},${col.g},${col.b})`;
        ctx.fill();
      };

      for (let y = 0; y < cfg.rows; y++) {
        for (let x = 0; x < cfg.cols; x++) {
          const p00 = points[y][x], p10 = points[y][x + 1];
          const p01 = points[y + 1][x], p11 = points[y + 1][x + 1];
          tri(p00, p10, p11);
          tri(p00, p11, p01);
        }
      }

      rafId = requestAnimationFrame(loop);
    };

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || cfg.speed === 0) {
      // Draw one static frame
      loop(performance.now());
    } else {
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      visualViewport?.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, [
    cfg.cols, cfg.rows, cfg.speed, cfg.wobble, cfg.parallax,
    cfg.glow, cfg.glowRadius, cfg.colorJitter, cfg.dprCap,
    cfg.from.r, cfg.from.g, cfg.from.b, cfg.to.r, cfg.to.g, cfg.to.b
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: cfg.zIndex,
        opacity: cfg.opacity,
        pointerEvents: "none",
      }}
    />
  );
}

/* tiny utilities */
function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function mix(a: RGB, b: RGB, t: number): RGB {
  return { r: ir(a.r + (b.r - a.r) * t), g: ir(a.g + (b.g - a.g) * t), b: ir(a.b + (b.b - a.b) * t) };
}
function lighten(c: RGB, amt: number): RGB {
  return { r: ir(c.r + 255 * amt), g: ir(c.g + 255 * amt), b: ir(c.b + 255 * amt) };
}
function ir(n: number) { return Math.round(Math.max(0, Math.min(255, n))); }
function noise(x: number, y: number, t: number) {
  return Math.sin(1.2 * x + 0.7 * y + 0.6 * t) * Math.cos(0.7 * x - 1.1 * y + 0.4 * t);
}
