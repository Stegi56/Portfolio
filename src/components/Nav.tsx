import { Link } from '../renderer/Link';

export default function Nav(props: { resumeUrl?: string }) {
  const { resumeUrl } = props;

  const scrollWithFallback = (el: HTMLElement) => {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100); 
  };

  return (
    <nav className="nav">
      <div className="container glass nav-inner">
        <div style={{display:"flex", alignItems:"center"}}>
          <Link href="/#home"
            aria-hidden className="kbd kbd-xl ps-0 pe-0"
            style={{
              background:"linear-gradient(90deg,#9881fc,#3b82f6)", WebkitBackgroundClip:"text", color:"transparent", 
              fontSize:"var(--fs-brand)", fontWeight:800
            }}>
            STEGI56
          </Link>
        </div>
        <div className="nav-links d-flex justify-content-end">
          <Link className="ps-2 pe-2" href="/#skills">Skills</Link>
          <Link className="ps-2 pe-2"  href="/#contact">Contact</Link>
          <Link className="ps-2 pe-2" href="/blog">Blog</Link>
          {resumeUrl && <a className="btn primary ps-2 pe-2 ms-1" href={resumeUrl} target="_blank" rel="noreferrer">Resume</a>}
        </div>
      </div>
    </nav>
  );
}