import React from "react";

interface TechPillsProps {
  displayTech: Array<string>;

  allTech: Map<string, boolean>;
  toggleTech: (tech: string) => void;
}

export default function TechPills({ displayTech, allTech, toggleTech }: TechPillsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent:"center", gap: "10px" }}>
      {displayTech.sort((a, b) => a[0].localeCompare(b[0])).map(tech => (
        <button
          onClick={() => toggleTech(tech)}
          className={`chip glass ${(allTech.get(tech)?? false) ? 'selected' : ''}`}
          key={tech}
        >
          {tech}
        </button>
      ))}
    </div>
  );
}