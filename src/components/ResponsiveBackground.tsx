"use client";

import { useBreakpoint } from "../hooks/useBreakpoint";
import LowPolyBackground from "./LowPolyBackground";

const backgroundConfig = {
  lg: { cols: 24, rows: 16 },
  md: { cols: 18, rows: 18 },
  sm: { cols: 10, rows: 16 },
};

export default function ResponsiveBackground() {
  const breakpoint = useBreakpoint();
  return (
    <LowPolyBackground
      {...backgroundConfig[breakpoint]}
      speed={2.5}
      wobble={15}
      parallax={25}
      glow={0.2}
      glowRadius={150}
      dprCap={1.5}
      from={{ r: 45, g: 58, b: 99 }}
      to={{ r: 70, g: 58, b: 140 }}
    />
  );
}
