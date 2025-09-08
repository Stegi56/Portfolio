import { motion } from "framer-motion";
import type { Project } from "../data/profile";

export default function ProjectCard({ p }: { p: Project }) {
  return (
    <motion.article
      className="card"
      style={{ padding: "16px", display: "grid", gap: "12px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <header style={{display:"flex", justifyContent:"space-between", alignItems:"baseline", gap:"10px"}}>
        <strong style={{fontWeight:700}}>{p.name}</strong>
        <div style={{display:"flex", gap:"10px"}}>
          {p.link && <a className="btn" href={p.link} target="_blank" rel="noreferrer">Live</a>}
          {p.repo && <a className="btn" href={p.repo} target="_blank" rel="noreferrer">Code</a>}
        </div>
      </header>
      <p className="p">{p.description}</p>
      {!!p.highlights?.length && (
        <ul style={{margin:0, paddingLeft:"18px", color:"var(--muted)"}}>
          {p.highlights.map((h,i) => <li key={i}>{h}</li>)}
        </ul>
      )}
      <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
        {p.tech.map(t => <span className="chip" key={t}>{t}</span>)}
      </div>
    </motion.article>
  );
}
