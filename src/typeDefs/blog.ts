export type Blog = {
  title: string;
  slug: string;
  date: string;
  cover: string;
  length: string;
  embed: string;
  Content: React.ComponentType;
};

export type MDXModule = {
  default: React.ComponentType;
  frontmatter: Pick<Blog, 'title' | 'slug' | 'date' | 'cover' | 'length' | 'embed'>;
};