import React from "react";
import { HashLink } from "react-router-hash-link";

export default function Nav(props: { resumeUrl?: string }) {
  const { resumeUrl } = props;

  const scrollWithFallback = (el: HTMLElement) => {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100); 
  };

  return (
    <nav className="nav">
      <div className="container glass nav-inner">
        <div style={{display:"flex", alignItems:"center"}}>
          <HashLink to="/#home"
            aria-hidden className="kbd kbd-xl ps-0 pe-0"
            style={{
              background:"linear-gradient(90deg,#9881fc,#3b82f6)", WebkitBackgroundClip:"text", color:"transparent", 
              fontSize:"var(--fs-brand)", fontWeight:800
            }}>
            STEGI56
          </HashLink>
        </div>
        <div className="nav-links d-flex justify-content-end">
          <HashLink className="ps-2 pe-2" to="/#skills">Skills</HashLink>
          <HashLink className="ps-2 pe-2" scroll={scrollWithFallback} to="/#contact">Contact</HashLink>
          <HashLink className="ps-2 pe-2" to="/blog">Blog</HashLink>
          {resumeUrl && <a className="btn primary ps-2 pe-2 ms-1" href={resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
        </div>
      </div>
    </nav>
  );
}
