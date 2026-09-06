import createMDX from "@next/mdx";
import { fileURLToPath } from "node:url";

const yamlFrontmatterPlugin = fileURLToPath(new URL("./remark-yaml-frontmatter.mjs", import.meta.url));

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-frontmatter", yamlFrontmatterPlugin],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: { unoptimized: true },
};

export default withMDX(nextConfig);
