declare module "*.mdx" {
  const MDXContent: React.ComponentType;
  export const frontmatter: import("./typeDefs/blog").BlogFrontmatter;
  export default MDXContent;
}
