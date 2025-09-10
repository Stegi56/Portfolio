import { motion } from "framer-motion";
import type { Experience } from "../data/profile";

export default function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <motion.article
      className="card pe-2 mb-2 ms-1 me-1"
      style={{ padding: "16px", display: "grid", gap: "10px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div className="row">
        <div className="col-2 pt-1 me-2"><img
          src={exp.logo}
          width="60"
          height="60"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        /></div>
        <div className="col-6 me-0 pe-0">
          <strong className="row" style={{fontWeight:700}}>{exp.role}</strong>
          <a className="row" href={exp.link} target="_blank" rel="noreferrer" style={{color:"var(--muted)"}}>{exp.company}</a>
        </div>
        <span className="kbd col-3 ms-0 me-0 ps-2 pe-0" style={{color:"var(--muted)"}}>{exp.start} — {exp.end}</span>
      </div>
      <ul style={{margin:0, paddingLeft:"18px", color:"var(--muted)"}}>
        {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      {!!exp.tech?.length && (
        <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
          {exp.tech.map(t => <span className="chip" key={t}>{t}</span>)}
        </div>
      )}
    </motion.article>
  );
}
