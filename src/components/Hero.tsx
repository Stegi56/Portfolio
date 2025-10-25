import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { profile } from "../data/profile";

export default function Hero() {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 100, damping: 12 });
  const sry = useSpring(ry, { stiffness: 100, damping: 12 });

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
    <section className="section mb-2 pt-3" id="home">
      <div className="container ps-0 pe-0" style={{display:"grid", gap:"22px"}}>
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
          <div className="row">
            <div className="col mb-2 ps-2" style={{maxWidth:"80%"}}>
              <div style={{display:"grid", gridTemplateColumns:"auto 1fr",  alignItems:"center"}}>
                <img
                  src="favicon.svg"
                  width="130"
                  height="130"
                  loading="lazy" 
                  decoding="async"
                  alt={`${profile.name} avatar`}
                  style={{borderRadius:"16px", border:"1px solid var(--edge)", maxWidth:"30dvw", maxHeight:"30dvw"}}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <h1 className="h1 ms-2" style={{margin:0}}>{profile.name}</h1>
              </div>
              <div>
                <p className="kbd kbd-l" style={{margin:0, whiteSpace:"nowrap"}}>{profile.headline}</p>
                <p className="p p-m" style={{margin:0}}>{profile.location}</p>
              </div>
            </div>
            <div className="col ps-1">            
              <ul className="ps-0 mb-0">
                {profile.certifications.map(c => 
                  <img
                    key={c.image + " hero badge"}
                    src={c.image}
                    width="90"
                    height="90"
                    loading="lazy" 
                    decoding="async"
                    style={{maxWidth:"19dvw", maxHeight:"19dvw"}}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
                {profile.education.map(e => 
                  <img
                    key={e.logo + " hero badge"}
                    src={e.logo}
                    className="p-1"
                    width="90"
                    height="90"
                    loading="lazy" 
                    decoding="async"
                    style={{maxWidth:"19dvw", maxHeight:"19dvw"}}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </ul>
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}
