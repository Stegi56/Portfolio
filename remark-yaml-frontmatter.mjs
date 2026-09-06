import { valueToEstree } from "estree-util-value-to-estree";
import { define } from "unist-util-mdx-define";
import { parse } from "yaml";

export default function remarkYamlFrontmatter() {
  return (tree, file) => {
    const node = tree.children.find((child) => child.type === "yaml");
    const frontmatter = node ? parse(node.value) : {};
    define(tree, file, { frontmatter: valueToEstree(frontmatter) });
  };
}
