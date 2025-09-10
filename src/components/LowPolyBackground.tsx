// LowPolyBackground.tsx
import { useEffect, useRef } from "react";

type RGB = { r: number; g: number; b: number };

export type LowPolyProps = Partial<{
  cols: number; rows: number;
  speed: number; wobble: number; parallax: number;
  glow: number; glowRadius: number; colorJitter: number;
  opacity: number; zIndex: number; dprCap: number;
  from: RGB; to: RGB;

  overscan: number;       
  lockEdges: boolean;  
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
  overscan: 0,          // 0 → auto (parallax + wobble + 8)
  lockEdges: false,
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
      const seconds = (now * 0.001) * cfg.speed;
      const angle = seconds * 0.12;
      const tNoise = seconds * 0.8;

      const { vw, vh } = vp();
      ctx.clearRect(0, 0, vw, vh);

      const snap = (v: number) => Math.round(v * dpr) / dpr;
      const cellW = vw / cfg.cols, cellH = vh / cfg.rows;

      const dx = Math.cos(angle), dy = Math.sin(angle);
      const shiftX = (mouse.x - 0.5) * cfg.parallax;
      const shiftY = (mouse.y - 0.5) * cfg.parallax;

      // --- NEW: overscan / edge locking setup
      const autoBleed = cfg.parallax + cfg.wobble + 8; // safety margin
      const bleedPx = cfg.lockEdges ? 0 : Math.max(cfg.overscan ?? 0, autoBleed);
      const ex = Math.ceil(bleedPx / cellW); // extra cells per side (x)
      const ey = Math.ceil(bleedPx / cellH); // extra cells per side (y)
      const colsFull = cfg.cols + ex * 2;
      const rowsFull = cfg.rows + ey * 2;

      const points = Array.from({ length: rowsFull + 1 }, (_, gy) =>
        Array.from({ length: colsFull + 1 }, (_, gx) => {
          const gridX = gx - ex;
          const gridY = gy - ey;

          const px0 = gridX * cellW + shiftX;
          const py0 = gridY * cellH + shiftY;

          const n = noise(gridX * 0.8, gridY * 0.7, tNoise);
          const onOuter =
            cfg.lockEdges && (gx === 0 || gx === colsFull || gy === 0 || gy === rowsFull);

          const wob = onOuter ? 0 : cfg.wobble * n;

          let px = px0 + wob;
          let py = py0 + wob;

          if (cfg.lockEdges) {
            if (gx === 0) px = 0;
            if (gx === colsFull) px = vw;
            if (gy === 0) py = 0;
            if (gy === rowsFull) py = vh;
          }

          return { x: snap(px), y: snap(py), n };
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

      // draw full (possibly overscanned) grid
      for (let y = 0; y < rowsFull; y++) {
        for (let x = 0; x < colsFull; x++) {
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
    cfg.from.r, cfg.from.g, cfg.from.b, cfg.to.r, cfg.to.g, cfg.to.b,
    // NEW deps
    cfg.overscan, cfg.lockEdges,
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
        // background: `rgb(${cfg.from.r},${cfg.from.g},${cfg.from.b})`,
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
