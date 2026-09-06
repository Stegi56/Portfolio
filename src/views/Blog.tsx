import { profile } from "../data/profile";
import ResponsiveBackground from "../components/ResponsiveBackground";
import Nav from "../components/Nav";
import ScrollProgressBar from "../components/ScrollProgressBar";
import type { BlogSummary } from "../typeDefs/blog";

export default function Blog({ Content, blog }: { Content: React.ComponentType; blog: BlogSummary }) {
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
          <img src={blog.cover} className="mt-0 mb-3 w-100" alt="" />
          <h1 className="h2">{blog.title}</h1>
          <div className="kbd blog-date">{blog.date}</div>
          <i className="mb-3">{blog.readingTime}</i>
          <hr />
          <Content />
        </div>
      </section>
    </>
  )
}
