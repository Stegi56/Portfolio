import { motion } from "framer-motion";
import type { Experience } from "../data/profile";

export default function ExperienceCard({ exp }: { exp: Experience }) {
  return (
    <motion.article
      className="card"
      style={{ padding: "16px", display: "grid", gap: "10px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:"8px"}}>
        <div style={{display:"flex", flexDirection:"column", gap:"4px"}}>
          <strong style={{fontWeight:700}}>{exp.role}</strong>
          <a href={exp.link} target="_blank" rel="noreferrer" style={{color:"var(--muted)"}}>{exp.company}</a>
        </div>
        <span className="kbd" style={{color:"var(--muted)"}}>{exp.start} — {exp.end}</span>
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
