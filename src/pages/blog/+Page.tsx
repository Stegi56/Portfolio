import { profile } from "../../data/profile";
import LowPolyBackground from "../../components/LowPolyBackground";
import Nav from "../../components/Nav";
import ScrollProgressBar from "../../components/ScrollProgressBar";
import { useBreakpoint } from '../../hooks/useBreakpoint';
import Section from "../../components/Section";
import Hero from "../../components/Hero";
import BlogPeekCard from "../../components/BlogPeekCard";

import type { MDXModule, Blog } from "../../typeDefs/blog";

export default function Page() {
  //const carouselTitle = profile.name + " - " + profile.headline;
  // useTitleCarousel(carouselTitle, 200);

  const blogFiles = import.meta.glob<MDXModule>('../data/blog/**/blog.mdx',{ eager: true });
  const blogs: Blog[] = Object.values(blogFiles)
    .map((mod) => ({
      ...mod.frontmatter,
      Content: mod.default,
    }))

  return (
    <>
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
