"use client";

import Link from "next/link";
import { useEffect, useRef, type MouseEvent } from "react";
import { publicPath } from "../lib/publicPath";
import { profile } from "../data/profile";

export default function Nav(props: { resumeUrl?: string }) {
  const { resumeUrl } = props;
  const stopTrackingScrollRef = useRef<(() => void) | undefined>(undefined);

  useEffect(() => () => stopTrackingScrollRef.current?.(), []);

  const navigateToSection = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    event.preventDefault();
    window.history.pushState(null, "", `#${id}`);
    stopTrackingScrollRef.current?.();
    stopTrackingScrollRef.current = scrollWithBrowserBehavior(target);
  };

  return (
    <nav className="nav">
      <div className="container glass nav-inner">
        <div style={{display:"flex", alignItems:"center"}}>
          <Link href="/#home" onClick={(event) => navigateToSection(event, "home")}
            aria-label={`${profile.brand} home`} className="kbd kbd-xl ps-0 pe-0"
            style={{
              background:"linear-gradient(90deg,#9881fc,#3b82f6)", WebkitBackgroundClip:"text", color:"transparent", 
              fontSize:"var(--fs-brand)", fontWeight:800
            }}>
            {profile.brand}
          </Link>
        </div>
        <div className="nav-links d-flex justify-content-end">
          <Link className="ps-2 pe-2" href="/#skills" onClick={(event) => navigateToSection(event, "skills")}>Skills</Link>
          <Link className="ps-2 pe-2" href="/#contact" onClick={(event) => navigateToSection(event, "contact")}>Contact</Link>
          <Link className="ps-2 pe-2" href="/blog/">Blog</Link>
          {resumeUrl && <a className="btn primary ps-2 pe-2 ms-1" href={publicPath(resumeUrl)} target="_blank" rel="noreferrer">Resume</a>}
        </div>
      </div>
    </nav>
  );
}

function scrollWithBrowserBehavior(target: HTMLElement) {
  let settleTimer: number | undefined;
  let correctionCount = 0;

  const desiredScrollY = () => {
    const scrollMargin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const targetTop = window.scrollY + target.getBoundingClientRect().top - scrollMargin;
    return Math.max(0, Math.min(targetTop, document.documentElement.scrollHeight - window.innerHeight));
  };

  const cleanup = () => {
    window.clearTimeout(settleTimer);
    window.removeEventListener("scroll", scheduleSettleCheck);
  };

  const checkSettledPosition = () => {
    if (Math.abs(window.scrollY - desiredScrollY()) <= 1 || correctionCount >= 2) {
      cleanup();
      return;
    }

    correctionCount += 1;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    scheduleSettleCheck();
  };

  const scheduleSettleCheck = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(checkSettledPosition, 150);
  };

  window.addEventListener("scroll", scheduleSettleCheck, { passive: true });
  target.scrollIntoView({ behavior: "smooth", block: "start" });
  scheduleSettleCheck();

  return cleanup;
}
