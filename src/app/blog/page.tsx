import type { Metadata } from "next";
import BlogList from "../../views/BlogList";
import { blogSummaries } from "../../data/blog";

export const metadata: Metadata = {
  title: "Joel's Blog",
  description: "Articles by software engineer Joel Staugaitis.",
  alternates: { canonical: "/blog/" },
};

export default function BlogListPage() {
  return <main><BlogList blogs={blogSummaries} /></main>;
}
