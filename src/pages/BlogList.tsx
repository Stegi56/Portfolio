import { profile } from "../data/profile";
import LowPolyBackground from "../components/LowPolyBackground";
import Nav from "../components/Nav";
import ScrollProgressBar from "../components/ScrollProgressBar";
import { useBreakpoint } from '../hooks/useBreakpoint';
import Section from "../components/Section";
import Hero from "../components/Hero";
import BlogPeekCard from "../components/BlogPeekCard";

import type { MDXModule, Blog } from "../typeDefs/blog";

export default function BlogList() {
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


  const blogFiles = import.meta.glob<MDXModule>('../data/blog/**/blog.mdx',{ eager: true });
  const blogs: Blog[] = Object.values(blogFiles)
    .map((mod) => ({
      ...mod.frontmatter,
      Content: mod.default,
    })).toReversed()

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

      <Hero/>

      <div>
        <Section id="blog" title="Blog">
          {blogs.map(blog => (
            <div>
              <BlogPeekCard blog={blog} />
            </div>
          ))}
        </Section>
      </div>
    </>
  )
}
