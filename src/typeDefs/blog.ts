export type BlogMetadata = {
  title: string;
  date: string;
};

export type BlogSummary = BlogMetadata & {
  slug: string;
  cover: string;
  readingTime: string;
};

export type BlogEntry = {
  frontmatter: BlogSummary;
  Content: React.ComponentType;
};
