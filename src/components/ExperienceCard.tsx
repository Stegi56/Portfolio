import { motion } from "framer-motion";
import type { Experience } from "../data/profile";

export default function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <motion.article
      className="card mb-3"
      style={{ padding: "16px", display: "grid", gap: "10px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <img
          src={exp.logo}
          width="60"
          height="60"
          style={{alignSelf:"center"}}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        <div style={{ flex: 1, minWidth: 200 }}>
          <strong style={{ fontWeight: 700 }}>{exp.role}</strong>
          {exp.link != undefined ? (
            <a className="url" href={exp.link} target="_blank" rel="noreferrer" style={{ display: "block" }}>{exp.company}</a>
          ) : (
            <a href={exp.link} target="_blank" rel="noreferrer" style={{ color:"var(--muted)", display: "block" }}>{exp.company}</a>
          )}
        </div>
        <span className="kbd" style={{ flex: 1, minWidth: 110, maxWidth:150 ,color: "var(--muted)", textAlign:"end"}}>{exp.start} — {exp.end}</span>
      </div>
      {exp.poster &&(
        <a className="btn glass nav-links" href={exp.poster} target="_blank" rel="noreferrer">Poster</a>
      )}
      <ul style={{margin:0, paddingLeft:"18px", color:"var(--muted)"}}>
        {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      {!!exp.tech?.length && (
        <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
          {exp.tech.map(t => <span className="chip glass" key={t}>{t}</span>)}
        </div>
      )}
    </motion.article>
  );
}
