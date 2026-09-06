import { profile } from "../data/profile";
import ResponsiveBackground from "../components/ResponsiveBackground";
import Nav from "../components/Nav";
import ScrollProgressBar from "../components/ScrollProgressBar";

export default function Blog({ Content }: { Content: React.ComponentType }) {
  return (
    <>
      <ResponsiveBackground />
      <ScrollProgressBar />
      <Nav resumeUrl={profile.resumeUrl}/>

      <section className=" container mb-2 pt-3 ps-0 pe-0 pb-2"
      style={{backdropFilter: "blur(5px)" }}>
        <div
          className="card mb-3"
          style={{ padding: "16px", color: "var(--text)"}}
        >
          <Content />
        </div>
      </section>
    </>
  )
}
