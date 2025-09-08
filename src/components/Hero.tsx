import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { profile } from "../data/profile";

export default function Hero() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 100, damping: 15 });
  const sry = useSpring(ry, { stiffness: 100, damping: 15 });

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const b = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = (e.clientX - b.left) / b.width - 0.5;
    const y = (e.clientY - b.top) / b.height - 0.5;
    rx.set(y * 10);
    ry.set(-x * 10);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };

  const bg = useMotionTemplate`radial-gradient(600px 300px at 20% -10%, rgba(122,92,255,.25), transparent 60%)`;

  return (
    <section className="section" style={{paddingTop: "120px"}}>
      <div className="container" style={{display:"grid", gap:"22px"}}>
        <motion.div
          className="card"
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          style={{
            padding: "28px",
            backgroundImage: bg,
            transformStyle:"preserve-3d",
            perspective: "800px",
            rotateX: srx,
            rotateY: sry
          }}
        >
          <div style={{display:"grid", gridTemplateColumns:"100px 1fr", gap:"18px", alignItems:"center"}}>
            <img
              src="/avatar.png"
              width="100"
              height="100"
              alt={`${profile.name} avatar`}
              style={{borderRadius:"16px", border:"1px solid var(--edge)"}}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            <div>
              <h1 className="h1">{profile.name}</h1>
              <p className="p" style={{marginTop:"6px"}}>{profile.headline} — {profile.location}</p>
              <div style={{display:"flex", gap:"10px", flexWrap:"wrap", marginTop:"12px"}}>
                <a className="btn primary" href="#projects">View Projects</a>
                <a className="btn" href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
                <a className="btn" href={profile.github} target="_blank" rel="noreferrer">GitHub</a>
              </div>
            </div>
          </div>
        </motion.div>
        <p className="p" style={{maxWidth: "70ch"}}>{profile.summary}</p>
      </div>
    </section>
  );
}
