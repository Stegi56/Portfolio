
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
          className={`chip ps-0 pt-0 pb-0 glass ${(allTech.get(tech)?? false) ? 'selected' : ''}`}
          key={tech}
          style={{gap:"0px"}}
        >
          <img
            className="p-0 m-0"
            src={"logos/" + tech + ".png"}
            loading="lazy" 
            decoding="async"
            style={{alignSelf:"center", borderRadius:"18px 0px 0px 18px", maxHeight:"1.8rem", maxWidth:"1.8rem"}}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <img
            className="p-0 m-0"
            src={"logos/" + tech + ".jpg"}
            loading="lazy" 
            decoding="async"
            style={{alignSelf:"center", borderRadius:"18px 0px 0px 18px", maxHeight:"1.8rem", maxWidth:"1.8rem"}}
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="ps-2 pt-1 pb-1">{tech}</div>
        </button>
      ))}
    </div>
  );
}