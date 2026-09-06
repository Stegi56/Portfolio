import { motion } from "framer-motion";
import type { Experience } from "../typeDefs/profile";

import TechPills from "./TechPills";
import { publicPath } from "../lib/publicPath";

interface TechProps {
  allTech: Map<string, boolean>;
  toggleTech: (tech: string) => void;
}

export default function ExperienceCard({ exp, allTech, toggleTech }: { exp: Experience } & TechProps) {
  return (
    <motion.article
      className="card mb-3"
      style={{ padding: "16px", display: "grid", gap: "10px" }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <img
          src={publicPath(exp.logo)}
          alt={`${exp.company} logo`}
          width="60"
          height="60"
          loading="lazy"
          decoding="async"
          style={{ alignSelf: "center", maxWidth: "14dvw", maxHeight: "14dvw" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />

        <div style={{ flex: 1, minWidth: 150, maxWidth: "80%" }}>
          <strong style={{ fontWeight: 700 }}>{exp.role}</strong>
          {exp.link !== undefined ? (
            <a className="url" href={exp.link} target="_blank" rel="noreferrer" style={{ display: "block" }}>{exp.company}</a>
          ) : (
            <span style={{ color: "var(--muted)", display: "block" }}>{exp.company}</span>
          )}
        </div>
        <span className="kbd kbd-s" style={{ flex: 1, minWidth: 70, maxWidth: 210, color: "var(--muted)", textAlign: "end" }}>
          {exp.start} {"\u2014"} {exp.end}
        </span>
      </div>

      {exp.promotions?.map((promotion, i) => (
        <div
          key={`${promotion.from}-${promotion.to}-${promotion.date}-${i}`}
          style={{ color: "var(--muted)", fontSize: "0.9em" }}
        >
          Promoted: {promotion.from} {"\u2192"} {promotion.to} {"\u00b7"} {promotion.date}
        </div>
      ))}

      {exp.poster && (
        <a className="btn glass nav-links text-white" href={publicPath(exp.poster)} target="_blank" rel="noreferrer">Poster</a>
      )}
      <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--muted)" }}>
        {exp.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <TechPills displayTech={exp.tech} allTech={allTech} toggleTech={toggleTech} />
    </motion.article>
  );
}
