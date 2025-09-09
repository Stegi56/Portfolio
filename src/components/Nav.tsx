import React from "react";

export default function Nav(props: { links: { id: string; label: string }[]; github?: string; linkedin?: string; resumeUrl?: string }) {
  const { links, github, linkedin, resumeUrl } = props;
  return (
    <nav className="nav">
      <div className="container glass nav-inner">
        <div style={{display:"flex", alignItems:"center", gap:"0.9rem"}}>
          <span aria-hidden className="kbd" style={{background:"linear-gradient(90deg,#9881fc,#3b82f6)", WebkitBackgroundClip:"text", color:"transparent", fontSize:38, fontWeight:800}}>STEGI56</span>
        </div>
        <div className="nav-links">
          {links.map(l => <a key={l.id} href={`#${l.id}`}>{l.label}</a>)}
          {resumeUrl && <a className="btn primary" href={resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
        </div>
      </div>
    </nav>
  );
}
