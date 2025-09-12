import { motion } from "framer-motion";
import type { Project } from "../data/profile";

export default function ProjectCard({ p }: { p: Project }) {
  return (
    <motion.article
      className="card mb-3"
      style={{ padding: "16px", display: "grid", gap: "12px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <header style={{display:"flex", alignItems:"center"}}>
        {!!p.logo && (
          <img
            className="me-2"
            src={p.logo}
            width="60"
            height="60"
          />
        )}
        <strong>{p.name}</strong>
        {p.repo && <a className="btn glass ms-auto" href={p.repo} target="_blank" rel="noreferrer">Repo</a>}
      </header>
      <p className="p mb-0">{p.description}</p>
      {!!p.bullets?.length && (
        <ul style={{margin:0, paddingLeft:"18px", color:"var(--muted)"}}>
          {p.bullets.map((h,i) => <li key={i}>{h}</li>)}
        </ul>
      )}
      {p.embed && (
        <div className="video-container" dangerouslySetInnerHTML={{ __html: p.embed }} />
      )}
      {!!p.demo && (
        <img
          className=""
          src={p.demo}
          width="100%"
        />
      )}
      <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
        {p.tech.map(t => <span className="chip" key={t}>{t}</span>)}
      </div>

    </motion.article>
  );
}
