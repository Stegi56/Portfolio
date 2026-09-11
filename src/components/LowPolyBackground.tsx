"use client";

import { useEffect, useRef } from "react";
import { advancePointer, createPointerMotion, defaultTeleportLimits, listenForPointer, resizePointer, setPointerTarget, type TeleportLimits } from "../lib/pointerMotion";

type RGB = { r: number; g: number; b: number };

export type LowPolyProps = Partial<{
  cols: number; rows: number;
  speed: number; wobble: number; parallax: number;
  teleportLimits: TeleportLimits;
  glow: number; glowRadius: number; colorJitter: number;
  opacity: number; zIndex: number; dprCap: number;
  from: RGB; to: RGB;
  overscan: number;       
  lockEdges: boolean;  
}>;

const DEF = {
  teleportLimits: defaultTeleportLimits,
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
    let motion = createPointerMotion({ x: 0, y: 0 });
    let reacquire = true;
    const limits = {
      maxVelocity: Math.max(1, cfg.teleportLimits.maxVelocity),
      acceleration: Math.max(1, cfg.teleportLimits.acceleration),
      deceleration: Math.max(1, cfg.teleportLimits.deceleration),
      minimumApproachSpeed: cfg.teleportLimits.minimumApproachSpeed,
      captureDistance: cfg.teleportLimits.captureDistance,
    };
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = motionPreference.matches;
    let width = 0, height = 0;
    // Keep scene coordinates stable while mobile browser controls change height.
    // Extra rows cover newly exposed space instead of stretching the whole mesh.
    let sceneHeight = 0;
    let previousTime: number | undefined;
    let seconds = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
    let rafId = 0;

    const requestRender = () => {
      if (!rafId && !document.hidden) rafId = requestAnimationFrame(loop);
    };

    const vp = () => {
      const bounds = canvas.getBoundingClientRect();
      return {
        vw: Math.ceil(bounds.width),
        vh: Math.ceil(bounds.height),
      };
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
      const { vw, vh } = vp();
      if (vw <= 0 || vh <= 0) return;
      if (!width || !height) {
        motion = createPointerMotion({ x: vw / 2, y: vh / 2 });
        sceneHeight = vh;
      } else if (width !== vw || (cfg.lockEdges && height !== vh)) {
        resizePointer(motion, vw / width, vh / sceneHeight);
        sceneHeight = vh;
      }
      width = vw;
      height = vh;
      const pixelWidth = Math.round(vw * dpr);
      const pixelHeight = Math.round(vh * dpr);
      if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
      if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      requestRender();
    };

    const loop = (now: number) => {
      rafId = 0;
      const dt = previousTime === undefined ? 0 : Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      const nextDpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
      const dimensions = vp();

      // A client-side navigation can briefly detach the canvas from layout.
      // Wait for the next frame instead of calculating an infinite overscan grid.
      if (dimensions.vw <= 0 || dimensions.vh <= 0) {
        if (!reduced) requestRender();
        return;
      }

      if (
        !width ||
        canvas.width !== Math.round(dimensions.vw * nextDpr) ||
        canvas.height !== Math.round(dimensions.vh * nextDpr)
      ) {
        resize();
      }

      if (!reduced) {
        advancePointer(motion, dt, limits);
        seconds += dt * cfg.speed;
      }
      const angle = seconds * 0.12;
      const tNoise = seconds * 0.8;

      const { vw, vh } = dimensions;
      ctx.clearRect(0, 0, vw, vh);

      const snap = (v: number) => Math.round(v * dpr) / dpr;
      const cellW = vw / cfg.cols, cellH = sceneHeight / cfg.rows;

      const dx = Math.cos(angle), dy = Math.sin(angle);
      const shiftX = (motion.position.x / vw - 0.5) * cfg.parallax;
      const shiftY = (motion.position.y / sceneHeight - 0.5) * cfg.parallax;

      // Momentum may briefly carry recovery beyond an edge; cover the shift without clamping its path.
      const autoBleed = Math.max(cfg.parallax, Math.abs(shiftX), Math.abs(shiftY)) + cfg.wobble + 8;
      const bleedPx = cfg.lockEdges ? 0 : Math.max(cfg.overscan ?? 0, autoBleed);
      const ex = Math.ceil(bleedPx / cellW); // extra cells per side (x)
      const ey = Math.ceil(bleedPx / cellH); // extra cells per side (y)
      const colsFull = cfg.cols + ex * 2;
      const rowsFull = Math.ceil(vh / cellH) + ey * 2;

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
        const grad = clamp01((cx * dx + cy * dy) / Math.hypot(vw, sceneHeight));
        const mx = motion.position.x, my = motion.position.y;
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

      if (!reduced && (cfg.speed !== 0 || motion.correction)) requestRender();
      else previousTime = undefined;
    };

    const stopListening = listenForPointer(window, (point, teleport) => {
      if (reduced) return;
      const bounds = canvas.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      setPointerTarget(motion, {
        x: Math.max(0, Math.min(bounds.width, point.x - bounds.left)),
        y: Math.max(0, Math.min(bounds.height, point.y - bounds.top)),
      }, teleport || reacquire);
      reacquire = false;
      requestRender();
    });
    const preferenceChanged = () => {
      reduced = motionPreference.matches;
      motion = createPointerMotion({ x: width / 2, y: height / 2 });
      reacquire = true;
      seconds = 0;
      previousTime = undefined;
      requestRender();
    };
    const visibilityChanged = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      previousTime = undefined;
      requestRender();
    };
    // Resize the backing buffer only inside a drawing frame, so clearing it
    // and repainting happen together rather than flashing between frames.
    requestRender();
    window.addEventListener("resize", requestRender);
    window.visualViewport?.addEventListener("resize", requestRender);
    const resizeObserver = new ResizeObserver(requestRender);
    resizeObserver.observe(document.documentElement);
    motionPreference.addEventListener("change", preferenceChanged);
    document.addEventListener("visibilitychange", visibilityChanged);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", requestRender);
      window.visualViewport?.removeEventListener("resize", requestRender);
      resizeObserver.disconnect();
      stopListening();
      motionPreference.removeEventListener("change", preferenceChanged);
      document.removeEventListener("visibilitychange", visibilityChanged);
    };
  }, [
    cfg.cols, cfg.rows, cfg.speed, cfg.wobble, cfg.parallax,
    cfg.glow, cfg.glowRadius, cfg.colorJitter, cfg.dprCap,
    cfg.from.r, cfg.from.g, cfg.from.b, cfg.to.r, cfg.to.g, cfg.to.b,
    cfg.overscan, cfg.lockEdges,
    cfg.teleportLimits.maxVelocity, cfg.teleportLimits.acceleration, cfg.teleportLimits.deceleration,
    cfg.teleportLimits.minimumApproachSpeed,
    cfg.teleportLimits.captureDistance,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      data-low-poly-cols={cfg.cols}
      data-low-poly-rows={cfg.rows}
      style={{
        position: "fixed",
        inset: 0,
        width: "100dvw",
        height: "100dvh",
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
