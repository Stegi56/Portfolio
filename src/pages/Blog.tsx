import { useParams } from 'react-router-dom';

import { profile } from "../data/profile";
import LowPolyBackground from "../components/LowPolyBackground";
import Nav from "../components/Nav";
import ScrollProgressBar from "../components/ScrollProgressBar";
import { useBreakpoint } from '../hooks/useBreakpoint';

import type { MDXModule, Blog } from "../typeDefs/blog";

const allBlogModules = import.meta.glob<MDXModule>('../data/blogs/*/blog.mdx', { eager: true });

export default function Blog() {
  const { slug } = useParams();

  //const carouselTitle = profile.name + " - " + profile.headline;
  // useTitleCarousel(carouselTitle, 200);
  document.title = "Joel's Blog";

  const breakpoint = useBreakpoint();
    const backgroundConfig = {
    lg: { cols: 24, rows: 16 },
    md: { cols: 18, rows: 18 },
    sm: { cols: 10, rows: 16 },
  };
  const { cols, rows } = backgroundConfig[breakpoint];

  const mod = allBlogModules[`../data/blogs/${slug}/blog.mdx`];
  const blog: Blog = {
    ...mod.frontmatter,
    Content: mod.default,
  };

  const Content = blog.Content;

  return (
    <>
      <LowPolyBackground
        speed={2.5}        // slower animation
        wobble={15}        // stronger vertex wobble
        parallax={25}      // stronger mouse shift
        glow={0.2}         // brighter near cursor
        glowRadius={150}   // larger glow area
        cols={cols}
        rows={rows}
        dprCap={1.5}         // tame high-DPI cost
        from={{ r: 45, g: 58, b: 99 }}
        to={{ r: 70, g: 58, b: 140 }}
      />
      <ScrollProgressBar />
      <Nav resumeUrl={profile.resumeUrl}/>

      <section className=" container mb-2 pt-3 ps-0 pe-0 pb-2">
        <div
          className="card mb-3"
          style={{ padding: "16px", color: "var(--text)" }}
        >
          <Content />
        </div>
      </section>
    </>
  )
}
