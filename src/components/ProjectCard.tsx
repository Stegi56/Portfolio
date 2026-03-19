import { motion } from "framer-motion";
import type { Project } from "../typeDefs/profile";

import TechPills from "./TechPills";

interface TechProps{
  allTech: Map<string, boolean>;
  toggleTech: (tech: string) => void;
}

export default function ProjectCard({ p, allTech, toggleTech}: { p: Project } & TechProps) {
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
            loading="lazy" 
            decoding="async"
          />
        )}
        <strong>{p.name}</strong>
      <div className="ms-auto d-flex flex-column"style={{ gap: "6px" }}>
        {p.repo && <a className="btn glass px-2 text-white justify-content-center" href={p.repo} target="_blank" rel="noreferrer">Repo</a>}
        {p.about && <a className="btn glass px-2 text-white justify-content-center" href={p.about} target="_blank" rel="noreferrer">About</a>}
      </div>
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
      {!!p.photo && (
        <img
          className=""
          src={p.photo}
          width="100%"
          loading="lazy" 
          decoding="async"
        />
      )}

      {!!p.video && (
        <video className="" width="100%" height="auto" controls>
          <source src={p.video} type="video/mp4"/>
          Your browser does not support the video tag.
        </video>
      )}

      <TechPills displayTech={p.tech} allTech={allTech} toggleTech={toggleTech}/>

    </motion.article>
  );
}
