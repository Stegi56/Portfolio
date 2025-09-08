import React from "react";

export default function Nav(props: { links: { id: string; label: string }[]; github?: string; linkedin?: string; resumeUrl?: string }) {
  const { links, github, linkedin, resumeUrl } = props;
  return (
    <nav className="nav">
      <div className="container glass nav-inner">
        <div style={{display:"flex", alignItems:"center", gap:"0.9rem"}}>
          <span aria-hidden className="kbd" style={{background:"linear-gradient(90deg,#7a5cff,#3b82f6)", WebkitBackgroundClip:"text", color:"transparent", fontWeight:800}}>STEGI</span>
          <span className="kbd" style={{color:"var(--muted)"}}>Software Engineer</span>
        </div>
        <div className="nav-links">
          {links.map(l => <a key={l.id} href={`#${l.id}`}>{l.label}</a>)}
          {resumeUrl && <a className="btn" href={resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
          {linkedin && <a aria-label="LinkedIn" href={linkedin} target="_blank" rel="noreferrer">in</a>}
          {github && <a aria-label="GitHub" href={github} target="_blank" rel="noreferrer">GH</a>}
        </div>
      </div>
    </nav>
  );
}
