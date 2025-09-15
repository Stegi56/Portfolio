import { motion } from "framer-motion";
import type { Certification } from "../data/profile";
import TechPills from "./TechPills";


interface TechProps{
  allTech: Map<string, boolean>;
  toggleTech: (tech: string) => void;
}

export default function CertificationCard({ cert, allTech, toggleTech }: { cert: Certification } & TechProps) {  
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
        loading="lazy"   
        decoding="async"
        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
      />
      <strong style={{ fontWeight: 700 }}>{cert.name}</strong>
      <div className="row">
        {cert.link != undefined ? (
          <a className="col-md-7 col-sm-12" href={cert.link} target="_blank" rel="noreferrer" style={{ color:"var(--urlColour)", display: "block" }}>{cert.issuer}</a>
        ) : (
          <a className="col-md-7 col-sm-12" style={{ color:"var(--muted)", display: "block" }}>{cert.issuer}</a>
        )}
        <span className="col-md-5 col-sm-12 kbd text-md-end text-sm-start" style={{flex: 1, minWidth: 0, maxWidth:150 ,color: "var(--muted)"}}>{cert.issueDate}</span>
      </div>
      {cert.certificate &&(
        <a className="btn glass" href={cert.certificate} target="_blank" rel="noreferrer">Certificate</a>
      )}

      <TechPills displayTech={cert.tech} allTech={allTech} toggleTech={toggleTech}/>
    </motion.article>
  );
}
