import React from "react";

interface TechPillsProps {
  displayTech: Array<string>;

  allTech: Map<string, boolean>;
  toggleTech: (tech: string) => void;

  justifyContent?: "center" | "flex-start";
}

export default function TechPills({ displayTech, allTech, toggleTech, justifyContent="flex-start"}: TechPillsProps) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent:justifyContent}}>
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