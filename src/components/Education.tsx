import { motion } from "framer-motion";
import type { Education } from "../data/profile";

export default function EducationCard({ ed }: { ed: Education }) {
  return (
    <motion.article
      className="card mb-3"
      style={{ padding: "16px", display: "grid", gap: "10px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <img
          src={ed.logo}
          width="60"
          height="60"
          style={{alignSelf:"center"}}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        <div style={{ flex: 1, minWidth: 200 }}>
          <strong style={{ fontWeight: 700 }}>{ed.title}</strong>
          <p className="mb-0" style={{ color:"var(--muted)", display: "block" }}>{ed.institution}</p>
        </div>
        <span className="kbd" style={{ flex: 1, minWidth: 0, maxWidth:170 ,color: "var(--muted)", textAlign:"end"}}>{ed.start} — {ed.end}</span>
      </div>
      {ed.certificate &&(
        <a className="btn glass nav-links" href={ed.certificate} target="_blank" rel="noreferrer">Certificate</a>
      )}
      <ul style={{margin:0, paddingLeft:"18px", color:"var(--muted)"}}>
        {ed.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      {!!ed.tech?.length && (
        <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
          {ed.tech.map(t => <span className="chip glass" key={t}>{t}</span>)}
        </div>
      )}
    </motion.article>
  );
}
