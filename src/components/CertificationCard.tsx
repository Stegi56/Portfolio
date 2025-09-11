import { motion } from "framer-motion";
import type { Certification } from "../data/profile";

export default function CertificationCard({ cert }: { cert: Certification }) {
  return (
    <motion.article
      className="card mb-3"
      style={{ padding: "16px", display: "grid", gap: "10px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <img
        src={cert.image}
        width="150"
        height="150"
        style={{placeSelf:"center"}}
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
        <strong style={{ fontWeight: 700 }}>{cert.name}</strong>
        {cert.link != undefined ? (
          <a className="url" href={cert.link} target="_blank" rel="noreferrer" style={{ display: "block" }}>{cert.issuer}</a>
        ) : (
          <a style={{ color:"var(--muted)", display: "block" }}>{cert.issuer}</a>
        )}
      <span className="kbd" style={{ flex: 1, minWidth: 0, maxWidth:150 ,color: "var(--muted)"}}>{cert.issueDate}</span>
      {cert.certificate &&(
        <a className="btn glass" href={cert.certificate} target="_blank" rel="noreferrer">Certificate</a>
      )}

      {!!cert.tech?.length && (
        <div style={{display:"flex", flexWrap:"wrap", gap:"8px"}}>
          {cert.tech.map(t => <span className="chip" key={t}>{t}</span>)}
        </div>
      )}
    </motion.article>
  );
}
