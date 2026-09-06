import "server-only";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { BlogEntry, BlogMetadata, BlogSummary } from "../../typeDefs/blog";

const BLOG_DIRECTORY = join(process.cwd(), "src", "data", "blog");
const DATE_PATTERN = /^(0[1-9]|[12]\d|3[01])-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{4}$/;
const WORDS_PER_MINUTE = 200;

export const blogSummaries = readdirSync(BLOG_DIRECTORY, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(blogFile(entry.name)))
  .map(({ name: slug }) => readBlogSummary(slug))
  .sort((a, b) => parseDate(b.date) - parseDate(a.date));

export async function getBlog(slug: string): Promise<BlogEntry | undefined> {
  const frontmatter = blogSummaries.find((blog) => blog.slug === slug);
  if (!frontmatter) return undefined;

  const { default: Content } = await import(`./${slug}/blog.mdx`);
  return { frontmatter, Content };
}

function readBlogSummary(slug: string): BlogSummary {
  const source = readFileSync(blogFile(slug), "utf8");
  const yaml = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/)?.[1];
  if (!yaml) throw new Error(`Blog "${slug}" must start with YAML frontmatter.`);

  const metadata = parse(yaml) as Partial<BlogMetadata> & Record<string, unknown>;
  if (typeof metadata.title !== "string" || !metadata.title.trim()) {
    throw new Error(`Blog "${slug}" must have a non-empty title.`);
  }
  if (typeof metadata.date !== "string" || !DATE_PATTERN.test(metadata.date)) {
    throw new Error(`Blog "${slug}" date must use DD-MMM-YYYY, for example 03-Jan-2026.`);
  }

  const unsupportedFields = Object.keys(metadata).filter((field) => !["title", "date"].includes(field));
  if (unsupportedFields.length) {
    throw new Error(`Blog "${slug}" has unsupported or derived metadata: ${unsupportedFields.join(", ")}.`);
  }

  const cover = `/blog/${slug}/cover.jpg`;
  if (!existsSync(join(process.cwd(), "public", "blog", slug, "cover.jpg"))) {
    throw new Error(`Blog "${slug}" must provide its derived cover at public${cover}.`);
  }

  return {
    title: metadata.title,
    date: metadata.date,
    slug,
    cover,
    readingTime: `${estimateReadingMinutes(source)}min read`,
  };
}

function blogFile(slug: string) {
  return join(BLOG_DIRECTORY, slug, "blog.mdx");
}

function parseDate(date: string) {
  const [day, month, year] = date.split("-");
  const monthIndex = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(month);
  const parsed = Date.UTC(Number(year), monthIndex, Number(day));
  const value = new Date(parsed);
  if (value.getUTCFullYear() !== Number(year) || value.getUTCMonth() !== monthIndex || value.getUTCDate() !== Number(day)) {
    throw new Error(`Invalid blog date: ${date}.`);
  }
  return parsed;
}

function estimateReadingMinutes(source: string) {
  const article = source
    .replace(/^---[\s\S]*?---/, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "");
  const words = article.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length ?? 0;
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}
