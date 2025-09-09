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
          <div style={{display:"grid", gridTemplateColumns:"1fr 1fr"}}>
            <div>
              <div style={{display:"grid", gridTemplateColumns:"130px 1fr", gap:"18px", alignItems:"center"}}>
                <img
                  src="/favicon.svg"
                  width="130"
                  height="130"
                  alt={`${profile.name} avatar`}
                  style={{borderRadius:"16px", border:"1px solid var(--edge)"}}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <h1 className="h1" style={{margin:0}}>{profile.name}</h1>
              </div>
              <div>
                <p className="kbd fs-5" style={{margin:0, whiteSpace:"nowrap"}}>{profile.headline}</p>
                <p className="p" style={{margin:0}}>{profile.location}</p>
              </div>
            </div>
            <ul className="ps-1">
              {profile.certifications.map(c => 
                <img
                  src={c.image}
                  width="75"
                  height="75"
                  alt={`${profile.name} avatar`}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
