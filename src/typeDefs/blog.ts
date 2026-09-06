export type BlogFrontmatter = {
  title: string;
  slug: string;
  date: string;
  cover: string;
  length: string;
  embed?: string;
};

export type BlogEntry = {
  frontmatter: BlogFrontmatter;
  Content: React.ComponentType;
};
