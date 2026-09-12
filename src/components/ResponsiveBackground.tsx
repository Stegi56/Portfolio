"use client";

import { useEffect, useRef } from "react";
import { mountBackground } from "../lib/background";

export default function ResponsiveBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => mountBackground(canvas.current!), []);
  return (
    <canvas
      ref={canvas}
      aria-hidden
      style={{
        position: "fixed", inset: 0,
        width: "100dvw", height: "100dvh",
        zIndex: -1, opacity: 0.75, pointerEvents: "none",
      }}
    />
  );
}
