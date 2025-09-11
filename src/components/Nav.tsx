import React from "react";

export default function Nav(props: { links: { id: string; label: string }[]; github?: string; linkedin?: string; resumeUrl?: string }) {
  const { links, github, linkedin, resumeUrl } = props;
  return (
    <nav className="nav">
      <div className="container glass nav-inner">
        <div style={{display:"flex", alignItems:"center"}}>
          <a aria-hidden className="kbd ps-1 pe-1" href="#hero"
          style={{background:"linear-gradient(90deg,#9881fc,#3b82f6)", WebkitBackgroundClip:"text", color:"transparent", fontSize:32, fontWeight:800}}>
            STEGI56
          </a>
        </div>
        <div className="nav-links d-flex justify-content-end">
          {links.map(l => <a className="ps-1 pe-1 ms-2 me-1" key={l.id} href={`#${l.id}`}>{l.label}</a>)}
          {resumeUrl && <a className="btn primary ps-2 pe-2 ms-2 me-1" href={resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
        </div>
      </div>
    </nav>
  );
}
