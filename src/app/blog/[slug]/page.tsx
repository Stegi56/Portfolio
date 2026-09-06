import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Blog from "../../../views/Blog";
import { blogSummaries, getBlog } from "../../../data/blog";

export const dynamicParams = false;

export function generateStaticParams() {
  return blogSummaries.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return {};

  const description = `${blog.frontmatter.readingTime} by Joel Staugaitis.`;
  return {
    title: `${blog.frontmatter.title} | Joel's Blog`,
    description,
    alternates: { canonical: `/blog/${slug}/` },
    openGraph: {
      title: blog.frontmatter.title,
      description,
      type: "article",
      url: `/blog/${slug}/`,
      images: [blog.frontmatter.cover],
    },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) notFound();

  return <main><Blog Content={blog.Content} blog={blog.frontmatter} /></main>;
}
