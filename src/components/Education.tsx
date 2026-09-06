import { motion } from "framer-motion";
import type { Education } from "../typeDefs/profile";

import TechPills from "./TechPills";
import { publicPath } from "../lib/publicPath";

interface TechProps{
  allTech: Map<string, boolean>;
  toggleTech: (tech: string) => void;
}

export default function EducationCard({ ed, allTech, toggleTech}: { ed: Education } & TechProps) {
  return (
    <motion.article
      className="card mb-3"
      style={{ padding: "16px", display: "grid", gap: "10px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "clamp(.2rem, 0.2vw + .3rem, 12px)" }}>
        <img
          src={publicPath(ed.logo)}
          alt={`${ed.institution} logo`}
          width="60"
          height="60"
          loading="lazy" 
          decoding="async"
          style={{alignSelf:"center"}}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        <div style={{ flex: 1, minWidth: 150, maxWidth:"80%"}}>
          <strong style={{ fontWeight: 700 }}>{ed.title}</strong>
          <div><i className="mb-0 italic" style={{ color:"var(--muted)" }}>{ed.grade}</i></div>
          <a className="url" href={ed.link} target="_blank" rel="noreferrer" >{ed.institution}</a>
        </div>
        <span className="kbd kbd-s ps-0 ms-0" style={{ flex: 1, minWidth: 60, maxWidth:"20%" ,color: "var(--muted)", textAlign:"end"}}>{ed.start} — {ed.end}</span>
      </div>
      {ed.certificate &&(
        <a className="btn glass nav-links text-white" href={publicPath(ed.certificate)} target="_blank" rel="noreferrer">Certificate</a>
      )}
      <ul style={{margin:0, paddingLeft:"18px", color:"var(--muted)"}}>
        {ed.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <TechPills displayTech={ed.tech} allTech={allTech} toggleTech={toggleTech}/>
    </motion.article>
  );
}
