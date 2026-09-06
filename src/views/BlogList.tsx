"use client";

import { profile } from "../data/profile";
import ResponsiveBackground from "../components/ResponsiveBackground";
import Nav from "../components/Nav";
import ScrollProgressBar from "../components/ScrollProgressBar";
import Section from "../components/Section";
import Hero from "../components/Hero";
import BlogPeekCard from "../components/BlogPeekCard";

import type { BlogSummary } from "../typeDefs/blog";

export default function BlogList({ blogs }: { blogs: BlogSummary[] }) {
  return (
    <>
      <ResponsiveBackground />
      <ScrollProgressBar />
      <Nav resumeUrl={profile.resumeUrl}/>

      <Hero/>

      <div>
        <Section id="blog" title="Blog">
          {blogs.map(blog => (
            <div key={blog.slug}>
              <BlogPeekCard blog={blog} />
            </div>
          ))}
        </Section>
      </div>
    </>
  )
}
