import React, { useEffect, useRef } from "react";

/**
 * Lightweight low‑poly background:
 * - Canvas grid split into triangles
 * - Subtle time-based wobble + mouse parallax
 * - Blue ↔ violet palette, darkened to stay minimalist
 */
export default function LowPolyBackground() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, time = 0;

    const onResize = () => {
      w = canvas.width = window.innerWidth * devicePixelRatio;
      h = canvas.height = window.innerHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    };
    onResize();
    window.addEventListener("resize", onResize);

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove);

    const cols = 28;             // tune counts for perf/quality
    const rows = 18;

    const draw = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      ctx.clearRect(0, 0, vw, vh);

      const cellW = vw / cols;
      const cellH = vh / rows;

      // base gradient direction slowly rotates
      const angle = time * 0.00012;
      const dx = Math.cos(angle), dy = Math.sin(angle);

      // slight global parallax
      const shiftX = (mouse.current.x - 0.5) * 10;
      const shiftY = (mouse.current.y - 0.5) * 10;

      // precompute perturbed grid points
      const points: { x: number; y: number; n: number }[][] = [];
      for (let y = 0; y <= rows; y++) {
        const row = [];
        for (let x = 0; x <= cols; x++) {
          const px = x * cellW + shiftX;
          const py = y * cellH + shiftY;
          const n = noise(x * 0.8, y * 0.7, time * 0.0008);
          const wobble = 6 * n;
          row.push({ x: px + wobble, y: py + wobble, n });
        }
        points.push(row);
      }

      // draw triangles
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const p00 = points[y][x],     p10 = points[y][x + 1];
          const p01 = points[y + 1][x], p11 = points[y + 1][x + 1];

          // two triangles per cell
          tri(p00, p10, p11);
          tri(p00, p11, p01);
        }
      }

      function tri(a: any, b: any, c: any) {
        const cx = (a.x + b.x + c.x) / 3;
        const cy = (a.y + b.y + c.y) / 3;

        // gradient factor
        const g = clamp01((cx * dx + cy * dy) / Math.hypot(vw, vh));
        // mouse highlight
        const mx = mouse.current.x * vw;
        const my = mouse.current.y * vh;
        const dist = Math.hypot(cx - mx, cy - my);
        const glow = Math.max(0, 1 - dist / 420) * 0.18;

        // base blue/violet blend on dark
        const base = mix(
          { r: 22, g: 35, b: 56 },      // deep blue
          { r: 60, g: 52, b: 120 },     // indigo
          g * 0.9
        );
        // slight triangle-local variation
        const jitter = (a.n + b.n + c.n) / 3;
        const col = lighten(base, 0.06 * jitter + glow);

        ctx.beginPath();
        ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y);
        ctx.closePath();
        ctx.fillStyle = `rgb(${col.r},${col.g},${col.b})`;
        ctx.fill();
      }

      time += 16.66;
      raf.current = requestAnimationFrame(draw);
    };

    raf.current = requestAnimationFrame(draw);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        opacity: 0.75
      }}
      aria-hidden
    />
  );
}

// -------- utilities (tiny, no deps)
function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function mix(a: RGB, b: RGB, t: number): RGB {
  return { r: ir(a.r + (b.r - a.r) * t), g: ir(a.g + (b.g - a.g) * t), b: ir(a.b + (b.b - a.b) * t) };
}
function lighten(c: RGB, amt: number): RGB {
  return { r: ir(c.r + 255 * amt), g: ir(c.g + 255 * amt), b: ir(c.b + 255 * amt) };
}
function ir(n: number){ return Math.round(Math.max(0, Math.min(255, n))); }
type RGB = { r:number; g:number; b:number };
function noise(x:number, y:number, t:number){
  // simple, fast pseudo-noise
  return Math.sin(1.2*x + 0.7*y + 0.6*t) * Math.cos(0.7*x - 1.1*y + 0.4*t);
}
