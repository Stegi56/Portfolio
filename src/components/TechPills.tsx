import React from "react";

interface TechPillsProps {
  displayTech: Array<string>;

  allTech: Map<string, boolean>;
  toggleTech: (tech: string) => void;
}

export default function TechPills({ displayTech, allTech, toggleTech }: TechPillsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
      {displayTech.map(tech => (
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