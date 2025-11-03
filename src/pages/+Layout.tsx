import LowPolyBackground from "../components/LowPolyBackground";
import { profile } from "../data/profile";
import Nav from "../components/Nav";
import ScrollProgressBar from "../components/ScrollProgressBar";
import { useBreakpoint } from '../hooks/useBreakpoint';

export function Layout({ children }: { children: React.ReactNode }) {
  const breakpoint = useBreakpoint();
    const backgroundConfig = {
    lg: { cols: 24, rows: 16 },
    md: { cols: 18, rows: 18 },
    sm: { cols: 10, rows: 16 },
  };
  const { cols, rows } = backgroundConfig[breakpoint];
    
  return (
    <>
      <LowPolyBackground
        speed={2.5}        // slower animation
        wobble={15}        // stronger vertex wobble
        parallax={25}      // stronger mouse shift
        glow={0.2}         // brighter near cursor
        glowRadius={150}   // larger glow area
        cols={cols}
        rows={rows}
        dprCap={1.5}         // tame high-DPI cost
        from={{ r: 45, g: 58, b: 99 }}
        to={{ r: 70, g: 58, b: 140 }}
      />
      <ScrollProgressBar />
      <Nav resumeUrl={profile.resumeUrl}/>
      {children}
    </>
  )
}
